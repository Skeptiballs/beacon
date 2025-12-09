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
  | "TOS";

// Company response shape from API
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
  employees: string | null;
  regions: RegionCode[];
  created_at: string;
  updated_at: string;
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
  employees?: string;
  regions?: RegionCode[];
};

// Sort options for companies
export type CompanySortOption = "name-asc" | "name-desc" | "newest" | "oldest";

// Query params for filtering companies
export type CompanyFilters = {
  search?: string;
  region?: RegionCode;
  category?: CategoryCode;
  hq_country?: string;
  sortBy?: CompanySortOption;
};

// API response wrapper for lists
export type ListResponse<T> = {
  data: T[];
  total: number;
};

// API error response
export type ApiError = {
  error: string;
  details?: string;
};

