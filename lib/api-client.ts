import {
  CompanyResponse,
  CreateCompanyInput,
  CompanyFilters,
  ListResponse,
  CompanyNote,
} from "./types";

// Base URL for API calls (relative for Next.js)
const API_BASE = "/api";

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Build query string from filter params
function buildQueryString(filters?: CompanyFilters): string {
  if (!filters) return "";

  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.region) params.set("region", filters.region);
  if (filters.category) params.set("category", filters.category);
  if (filters.hq_country) params.set("hq_country", filters.hq_country);
  if (filters.starred !== undefined) params.set("starred", String(filters.starred));
  if (filters.employees) params.set("employees", filters.employees);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

// API client for companies
export const companiesApi = {
  // Get list of companies with optional filters
  list: (filters?: CompanyFilters): Promise<ListResponse<CompanyResponse>> =>
    apiFetch(`/companies${buildQueryString(filters)}`),

  // Get single company by ID
  get: (id: number): Promise<CompanyResponse> => apiFetch(`/companies/${id}`),

  // Create new company
  create: (data: CreateCompanyInput): Promise<CompanyResponse> =>
    apiFetch("/companies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update company by ID
  update: (id: number, data: CreateCompanyInput): Promise<CompanyResponse> =>
    apiFetch(`/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Toggle starred flag for a company
  toggleStar: (id: number, starred: boolean): Promise<CompanyResponse> =>
    apiFetch(`/companies/${id}/star`, {
      method: "PATCH",
      body: JSON.stringify({ starred }),
    }),

  // Delete company by ID
  delete: (id: number): Promise<{ success: boolean; id: number }> =>
    apiFetch(`/companies/${id}`, {
      method: "DELETE",
    }),

  // List notes for a company
  listNotes: (companyId: number): Promise<CompanyNote[]> =>
    apiFetch(`/companies/${companyId}/notes`),

  // Create a note for a company
  createNote: (companyId: number, content: string): Promise<CompanyNote> =>
    apiFetch(`/companies/${companyId}/notes`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  // Update a company note
  updateNote: (companyId: number, noteId: number, content: string): Promise<CompanyNote> =>
    apiFetch(`/companies/${companyId}/notes/${noteId}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }),

  // Delete a company note
  deleteNote: (companyId: number, noteId: number): Promise<{ success: boolean; id: number }> =>
    apiFetch(`/companies/${companyId}/notes/${noteId}`, {
      method: "DELETE",
    }),
};

