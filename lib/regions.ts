import { RegionCode } from "./types";

// Human-readable labels for region codes
export const REGION_LABELS: Record<RegionCode, string> = {
  EU: "Europe",
  NA: "North America",
  AP: "Asia Pacific",
  LA: "Latin America",
};

// All available region codes
export const REGION_CODES: RegionCode[] = ["EU", "NA", "AP", "LA"];

// Get display label for a region code
export function getRegionLabel(code: RegionCode): string {
  return REGION_LABELS[code] ?? code;
}






