import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { enrichCompanyStream } from "@/lib/ai/enrichCompany";
import { normalizeEmployeeRange } from "@/lib/employees";
import { CategoryCode, CompanyResponse, RegionCode } from "@/lib/types";

// Reuse the response mapping used elsewhere
function toCompanyResponse(
  company: typeof schema.companies.$inferSelect,
  regions: string[],
  categories: string[]
): CompanyResponse {
  return {
    id: company.id,
    name: company.name,
    website: company.website,
    linkedin_url: company.linkedin_url,
    logo_url: company.logo_url,
    hq_country: company.hq_country,
    hq_city: company.hq_city,
    categories: categories as CategoryCode[],
    summary: company.summary,
    employees: normalizeEmployeeRange(company.employees) || null,
    regions: regions as RegionCode[],
    starred: !!company.starred,
    created_at: company.created_at,
    updated_at: company.updated_at,
  };
}

// POST /api/companies/[id]/enrich - Run agentic enrichment for a company
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start: async (controller) => {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
          send({ type: "error", message: "Invalid company ID" });
          controller.close();
          return;
        }

        const body = await request.json().catch(() => ({}));
        const nameInput = typeof body.name === "string" ? body.name : "";
        const websiteInput = typeof body.website === "string" ? body.website : undefined;

        const company = await db
          .select()
          .from(schema.companies)
          .where(eq(schema.companies.id, id))
          .get();

        if (!company) {
          send({ type: "error", message: "Company not found" });
          controller.close();
          return;
        }

        const regionsRows = await db
          .select()
          .from(schema.companyRegions)
          .where(eq(schema.companyRegions.company_id, id))
          .all();
        const regions = regionsRows.map((r) => r.region);

        const categoriesRows = await db
          .select()
          .from(schema.companyCategories)
          .where(eq(schema.companyCategories.company_id, id))
          .all();
        const categories = categoriesRows.map((c) => c.category);

        const existing = toCompanyResponse(company, regions, categories);

        for await (const event of enrichCompanyStream({
          name: nameInput || existing.name,
          website: websiteInput || existing.website || undefined,
          existing,
        })) {
          send(event);
        }
      } catch (error) {
        console.error("Error running enrichment:", error);
        const message = error instanceof Error ? error.message : "Failed to run enrichment";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

