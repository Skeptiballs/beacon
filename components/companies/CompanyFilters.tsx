"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REGION_CODES, REGION_LABELS } from "@/lib/regions";
import { CATEGORY_CODES, CATEGORY_LABELS } from "@/lib/categories";
import { CompanyFilters as Filters, CompanySortOption } from "@/lib/types";
import { ArrowDownAZ, Search } from "lucide-react";

const SORT_OPTIONS: { value: CompanySortOption; label: string }[] = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

interface CompanyFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function CompanyFilters({ filters, onFiltersChange }: CompanyFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={filters.search || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value || undefined })
          }
          className="pl-9"
        />
      </div>

      {/* Region filter */}
      <Select
        value={filters.region || "all"}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            region: value === "all" ? undefined : (value as Filters["region"]),
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All regions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All regions</SelectItem>
          {REGION_CODES.map((code) => (
            <SelectItem key={code} value={code}>
              {REGION_LABELS[code]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category filter */}
      <Select
        value={filters.category || "all"}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            category: value === "all" ? undefined : (value as Filters["category"]),
          })
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {CATEGORY_CODES.map((code) => (
            <SelectItem key={code} value={code}>
              {CATEGORY_LABELS[code]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort by */}
      <Select
        value={filters.sortBy || "name-asc"}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            sortBy: value as CompanySortOption,
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <ArrowDownAZ className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

