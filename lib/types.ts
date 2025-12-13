// Region codes for company geographic presence
export type RegionCode = "EU" | "NA" | "AP" | "LA";

// Category codes for company classification
export type CategoryCode =
  | "VTS"
  | "HW"
  | "PMIS"
  | "PCS"
  | "CS"
  | "PDMS"
  | "AIS"
  | "TOS"
  | "MD";

// Company response shape from API
export type EmployeeRange =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "501-1000"
  | "1001-5000"
  | "5001-10000"
  | "10001+";

export type AgentStepStatus = "pending" | "active" | "done";

export type AgentStep = {
  id: string;
  label: string;
  status: AgentStepStatus;
};

export type EnrichmentEvent =
  | { type: "step-start"; stepId: string; label?: string }
  | { type: "step-complete"; stepId: string }
  | { type: "partial-suggestion"; data?: Partial<CreateCompanyInput & { name?: string }> }
  | { type: "suggestions"; data?: (CreateCompanyInput & { name: string }) | null; steps?: AgentStep[] }
  | { type: "error"; message?: string };

export type CompanyResponse = {
  id: number;
  name: string;
  website: string | null;
  linkedin_url: string | null;
  logo_url: string | null;
  hq_country: string | null;
  hq_city: string | null;
  categories: CategoryCode[];
  summary: string | null;
  employees: EmployeeRange | null;
  regions: RegionCode[];
  starred: boolean;
  created_at: string;
  updated_at: string;
};

export type CompanyNote = {
  id: number;
  company_id: number;
  content: string;
  created_at: string;
};

// Payload for creating a new company
export type CreateCompanyInput = {
  name: string;
  website?: string;
  linkedin_url?: string;
  logo_url?: string;
  hq_country?: string;
  hq_city?: string;
  categories?: CategoryCode[];
  summary?: string;
  employees?: EmployeeRange;
  regions?: RegionCode[];
  starred?: boolean;
};

// Sort options for companies
export type CompanySortOption = "name-asc" | "name-desc" | "newest" | "oldest";

// Query params for filtering companies
export type CompanyFilters = {
  search?: string;
  region?: RegionCode;
  category?: CategoryCode;
  hq_country?: string;
  starred?: boolean;
  employees?: EmployeeRange;
  sortBy?: CompanySortOption;
};

// API response wrapper for lists
export type ListResponse<T> = {
  data: T[];
  total: number;
};

export type EnrichmentResponse = {
  suggestions: (CreateCompanyInput & { name: string }) | null;
  steps?: AgentStep[];
};

// API error response
export type ApiError = {
  error: string;
  details?: string;
};

