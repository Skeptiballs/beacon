"use client";

import { Button } from "@/components/ui/button";
import { CompanyFilters } from "@/lib/types";
import { Ship, Globe2, MapPin, Star } from "lucide-react";

interface PresetFiltersProps {
  filters: CompanyFilters;
  onFiltersChange: (filters: CompanyFilters) => void;
}

interface PresetFilter {
  label: string;
  icon: React.ReactNode;
  filters: CompanyFilters;
}

const PRESET_FILTERS: PresetFilter[] = [
  {
    label: "Starred",
    icon: <Star className="h-4 w-4" />,
    filters: { starred: true },
  },
  {
    label: "VTS Providers",
    icon: <Ship className="h-4 w-4" />,
    filters: { category: "VTS" },
  },
  {
    label: "PMIS in Europe",
    icon: <Globe2 className="h-4 w-4" />,
    filters: { category: "PMIS", region: "EU" },
  },
  {
    label: "Benelux Companies",
    icon: <MapPin className="h-4 w-4" />,
    filters: { hq_country: "NLD,BEL,LUX" },
  },
];

// Check if current filters match a preset's filters
function isPresetActive(currentFilters: CompanyFilters, presetFilters: CompanyFilters): boolean {
  const currentCategory = currentFilters.category || undefined;
  const currentRegion = currentFilters.region || undefined;
  const currentHqCountry = currentFilters.hq_country || undefined;
  const currentStarred = currentFilters.starred ?? undefined;
  const presetCategory = presetFilters.category || undefined;
  const presetRegion = presetFilters.region || undefined;
  const presetHqCountry = presetFilters.hq_country || undefined;
  const presetStarred = presetFilters.starred ?? undefined;
  
  return currentCategory === presetCategory && 
         currentRegion === presetRegion && 
         currentHqCountry === presetHqCountry &&
         currentStarred === presetStarred;
}

export function PresetFilters({ filters, onFiltersChange }: PresetFiltersProps) {
  const handlePresetClick = (preset: PresetFilter) => {
    // If the preset is already active, clear those specific filters
    if (isPresetActive(filters, preset.filters)) {
      const newFilters = { ...filters };
      
      // Remove the filters that this preset sets
      if (preset.filters.category !== undefined) {
        delete newFilters.category;
      }
      if (preset.filters.region !== undefined) {
        delete newFilters.region;
      }
      if (preset.filters.hq_country !== undefined) {
        delete newFilters.hq_country;
      }
      if (preset.filters.starred !== undefined) {
        delete newFilters.starred;
      }
      
      onFiltersChange(newFilters);
    } else {
      // Apply the preset filters
      onFiltersChange(preset.filters);
    }
  };

  return (
    <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-muted">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground shrink-0">
          Quick Filters:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_FILTERS.map((preset) => {
            const isActive = isPresetActive(filters, preset.filters);
            return (
              <Button
                key={preset.label}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="h-8 gap-1.5"
              >
                {preset.icon}
                <span className="text-xs">{preset.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

