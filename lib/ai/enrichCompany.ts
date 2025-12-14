import { GoogleGenAI } from "@google/genai";
import { searchLinkedInWithGCS } from "@/lib/ai/gcsSearch";
import { CATEGORY_CODES } from "@/lib/categories";
import { REGION_CODES } from "@/lib/regions";
import { normalizeEmployeeRange } from "@/lib/employees";
import {
  AgentStep,
  AgentStepStatus,
  CompanyResponse,
  CreateCompanyInput,
  EnrichmentEvent,
} from "@/lib/types";

type EnrichmentInput = {
  name: string;
  website?: string | null;
  existing?: CompanyResponse | null;
};

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_TEXT_BYTES = 120_000; // ~120 KB cap for fetched HTML/text
const FETCH_TIMEOUT_MS = 10000;
const MODEL_TIMEOUT_MS = 20000;

function baseSteps(): AgentStep[] {
  return [
    { id: "fetch", label: "Fetching website content", status: "pending" },
    { id: "extract", label: "Extracting signals", status: "pending" },
    { id: "infer", label: "Inferring company fields", status: "pending" },
    { id: "structure", label: "Structuring suggestions", status: "pending" },
  ];
}

function updateStepStatus(steps: AgentStep[], id: string, status: AgentStepStatus): AgentStep[] {
  return steps.map((step) => (step.id === id ? { ...step, status } : step)) as AgentStep[];
}

function markDoneThrough(steps: AgentStep[], id: string): AgentStep[] {
  let reached = false;
  return steps.map((step) => {
    if (step.id === id) {
      reached = true;
      return { ...step, status: "done" };
    }
    if (!reached) {
      return { ...step, status: "done" };
    }
    return step;
  }) as AgentStep[];
}

function ensureHttpUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.toString();
  } catch {
    return undefined;
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        "User-Agent": "Portstack-Agent/1.0",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

async function fetchWebsiteText(url?: string) {
  if (!url) return "";
  try {
    const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    if (!res.ok) return "";
    const reader = res.body?.getReader();
    if (!reader) return "";
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.byteLength;
        if (received > MAX_TEXT_BYTES) {
          chunks.push(value.slice(0, MAX_TEXT_BYTES - (received - value.byteLength)));
          break;
        }
        chunks.push(value);
      }
    }
    const decoder = new TextDecoder("utf-8");
    const html = decoder.decode(Buffer.concat(chunks as any));
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, MAX_TEXT_BYTES);
  } catch {
    return "";
  }
}

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function normalizeCategories(values?: string[]): CreateCompanyInput["categories"] {
  if (!values) return undefined;
  const normalized = values
    .map((c) => c.trim().toUpperCase())
    .filter((c): c is typeof CATEGORY_CODES[number] => CATEGORY_CODES.includes(c as any));
  return normalized.length ? normalized : undefined;
}

function normalizeRegions(values?: string[]): CreateCompanyInput["regions"] {
  if (!values) return undefined;
  const normalized = values
    .map((r) => r.trim().toUpperCase())
    .filter((r): r is typeof REGION_CODES[number] => REGION_CODES.includes(r as any));
  return normalized.length ? normalized : undefined;
}

function deriveLinkedIn(name: string, website?: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (website) {
    try {
      const domain = new URL(website).hostname.replace(/^www\./, "");
      return `https://www.linkedin.com/company/${domain.replace(/\./g, "-")}`;
    } catch {
      // fall through
    }
  }
  return `https://www.linkedin.com/company/${slug}`;
}

function deriveLogo(website?: string) {
  if (!website) return undefined;
  try {
    const domain = new URL(website).hostname;
    return `https://logo.clearbit.com/${domain}`;
  } catch {
    return undefined;
  }
}

type GeminiSuggestion = Partial<CreateCompanyInput> & { name?: string };

function extractLinkedInFromHtml(html: string): string | undefined {
  const match = html.match(/https?:\/\/(?:www\.)?linkedin\.com\/company\/[^"'<\s>]*/i);
  if (match && match[0]) return match[0];
  return undefined;
}

function isValidLinkedInUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!/linkedin\\.com$/i.test(parsed.hostname)) return undefined;
    if (!parsed.pathname.toLowerCase().startsWith("/company/")) return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

async function callModelJSON(genai: GoogleGenAI, prompt: string): Promise<GeminiSuggestion | null> {
  const result = await genai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  } as any);
  const raw = (result as any)?.text ?? "";
  return parseJsonSafe<GeminiSuggestion>(raw);
}

export async function* enrichCompanyStream(
  input: EnrichmentInput
): AsyncGenerator<EnrichmentEvent, void, unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genai = new GoogleGenAI({ apiKey });

  let steps = baseSteps();
  const website = ensureHttpUrl(input.website || input.existing?.website);
  let websiteText = "";
  let linkedinUrl: string | undefined;
  let linkedinText = "";
  let hqCity: string | undefined;
  let hqCountry: string | undefined;
  let employees = normalizeEmployeeRange(input.existing?.employees);
  let regions: CreateCompanyInput["regions"];
  let categories: CreateCompanyInput["categories"];

  // Step 1: Fetch website and try to extract LinkedIn
  steps = updateStepStatus(steps, "fetch", "active");
  yield { type: "step-start", stepId: "fetch", label: "Fetching website content" } as EnrichmentEvent;
  websiteText = await fetchWebsiteText(website);
  const linkedInFromSite = extractLinkedInFromHtml(websiteText);
  linkedinUrl = isValidLinkedInUrl(linkedInFromSite);
  if (linkedinUrl) {
    yield { type: "partial-suggestion", data: { linkedin_url: linkedinUrl } } as EnrichmentEvent;
  }
  steps = markDoneThrough(steps, "fetch");
  yield { type: "step-complete", stepId: "fetch" } as EnrichmentEvent;

  // Step 2: LinkedIn discovery via GCS if missing
  steps = updateStepStatus(steps, "extract", "active");
  yield { type: "step-start", stepId: "extract", label: "Discovering LinkedIn via search" } as EnrichmentEvent;
  if (!linkedinUrl) {
    const query = [input.name, "linkedin"].filter(Boolean).join(" ");
    const found = await searchLinkedInWithGCS(query);
    const validated = isValidLinkedInUrl(found);
    if (validated) {
      linkedinUrl = validated;
      yield { type: "partial-suggestion", data: { linkedin_url: linkedinUrl } } as EnrichmentEvent;
    }
  }
  steps = markDoneThrough(steps, "extract");
  yield { type: "step-complete", stepId: "extract" } as EnrichmentEvent;

  // Step 3: Fetch LinkedIn page (best-effort)
  steps = updateStepStatus(steps, "infer", "active");
  yield { type: "step-start", stepId: "infer", label: "Fetching LinkedIn page" } as EnrichmentEvent;
  if (linkedinUrl) {
    linkedinText = await fetchWebsiteText(linkedinUrl);
  }
  steps = markDoneThrough(steps, "infer");
  yield { type: "step-complete", stepId: "infer" } as EnrichmentEvent;

  // Step 4: Infer HQ & employees from LinkedIn (fallback to site)
  steps = updateStepStatus(steps, "structure", "active");
  yield { type: "step-start", stepId: "structure", label: "Inferring HQ & employees" } as EnrichmentEvent;
  if (linkedinText) {
    const prompt = `
You extract HQ city, HQ country (3-letter ISO or common name), and employee range from LinkedIn-like text.
Return JSON:
{
  "hq_city": string | null,
  "hq_country": string | null,
  "employees": string | null
}
Only fill fields if confident; otherwise use null.
Source text:
${linkedinText.slice(0, 20000)}
`.trim();
    const result = await callModelJSON(genai, prompt);
    hqCity = result?.hq_city || undefined;
    hqCountry = result?.hq_country ? result.hq_country.toUpperCase() : undefined;
    const normalizedEmployees = normalizeEmployeeRange(result?.employees);
    if (normalizedEmployees) {
      employees = normalizedEmployees;
    }
    if (hqCity || hqCountry || normalizedEmployees) {
      yield {
        type: "partial-suggestion",
        data: {
          hq_city: hqCity,
          hq_country: hqCountry,
          employees: normalizedEmployees,
        },
      } as EnrichmentEvent;
    }
  } else if (websiteText) {
    const prompt = `
You extract HQ city, HQ country (3-letter ISO or common name), and employee range from website text.
Return JSON:
{
  "hq_city": string | null,
  "hq_country": string | null,
  "employees": string | null
}
Only fill fields if confident; otherwise use null.
Website text:
${websiteText.slice(0, 20000)}
`.trim();
    const result = await callModelJSON(genai, prompt);
    hqCity = result?.hq_city || undefined;
    hqCountry = result?.hq_country ? result.hq_country.toUpperCase() : undefined;
    const normalizedEmployees = normalizeEmployeeRange(result?.employees);
    if (normalizedEmployees) {
      employees = normalizedEmployees;
    }
    if (hqCity || hqCountry || normalizedEmployees) {
      yield {
        type: "partial-suggestion",
        data: {
          hq_city: hqCity,
          hq_country: hqCountry,
          employees: normalizedEmployees,
        },
      } as EnrichmentEvent;
    }
  }

  // Step 5: Regions & categories from website
  const promptRegions = `
You infer regions and categories for a maritime company from website text.
Allowed regions: ${REGION_CODES.join(", ")}.
Allowed categories: ${CATEGORY_CODES.join(", ")}.
Return JSON:
{
  "regions": string[] | null,
  "categories": string[] | null
}
Only include codes from the allowed lists and only if confident. Use null otherwise.
Website text:
${websiteText.slice(0, 20000)}
`.trim();
  const rc = await callModelJSON(genai, promptRegions);
  regions = normalizeRegions(rc?.regions || undefined);
  categories = normalizeCategories(rc?.categories || undefined);
  if ((regions && regions.length) || (categories && categories.length)) {
    yield { type: "partial-suggestion", data: { regions, categories } } as EnrichmentEvent;
  }

  // Final structuring
  const name = input.name?.trim() || input.existing?.name || "";
  const websiteNormalized = ensureHttpUrl(input.website || input.existing?.website) || website;
  const linkedinFinal = isValidLinkedInUrl(linkedinUrl) || deriveLinkedIn(name, websiteNormalized);
  const logo = deriveLogo(websiteNormalized);

  const suggestions: CreateCompanyInput & { name: string } = {
    name,
    website: websiteNormalized,
    linkedin_url: linkedinFinal,
    logo_url: logo,
    hq_country: hqCountry,
    hq_city: hqCity,
    employees,
    summary: input.existing?.summary || undefined,
    categories,
    regions,
  };

  steps = markDoneThrough(steps, "structure");

  yield {
    type: "suggestions",
    data: suggestions,
    steps,
  } as EnrichmentEvent;
}

