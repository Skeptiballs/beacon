"use client";

import { useState, useMemo } from "react";
import { MainShell } from "@/components/layout/MainShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompanyTable } from "@/components/companies/CompanyTable";
import { CompanyFilters } from "@/components/companies/CompanyFilters";
import { PresetFilters } from "@/components/companies/PresetFilters";
import { AddCompanyDialog } from "@/components/companies/AddCompanyDialog";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyFilters as Filters } from "@/lib/types";
import { Building2, Filter } from "lucide-react";

export default function CompaniesPage() {
  const [filters, setFilters] = useState<Filters>({});
  const { data, isLoading, error } = useCompanies(filters);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.region ||
      filters.category ||
      filters.hq_country ||
      filters.employees ||
      filters.starred !== undefined
    );
  }, [filters]);

  return (
    <MainShell>
      <PageHeader
        title="Companies"
        description="Discover and track companies in the maritime industry."
      >
        <AddCompanyDialog />
      </PageHeader>

      <CompanyFilters filters={filters} onFiltersChange={setFilters} />

      <PresetFilters filters={filters} onFiltersChange={setFilters} />

      {/* Visual count indicator */}
      {!isLoading && data && (
        <div className="flex items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tabular-nums">
                  {data.data.length}
                </span>
                <span className="text-sm text-muted-foreground font-normal">
                  {data.data.length === 1 ? "company" : "companies"}
                </span>
              </div>
              {hasActiveFilters && data.data.length !== data.total && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Filter className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Filtered from {data.total} total
                  </span>
                </div>
              )}
            </div>
          </div>
          {!hasActiveFilters && (
            <div className="text-sm text-muted-foreground">
              Total in database
            </div>
          )}
        </div>
      )}

      {error ? (
        <div className="border border-destructive rounded-lg p-8 text-center text-destructive">
          Failed to load companies. Please try again.
        </div>
      ) : (
        <CompanyTable data={data?.data || []} isLoading={isLoading} sortBy={filters.sortBy} />
      )}
    </MainShell>
  );
}

