import { CategoryCode } from "./types";

// Human-readable labels for category codes
export const CATEGORY_LABELS: Record<CategoryCode, string> = {
  VTS: "Vessel Traffic Services",
  HW: "Hardware",
  PMIS: "Port Management Information Systems",
  PCS: "Port Community Systems",
  CS: "Coastal Surveillance",
  PDMS: "Pilot Dispatch Management Systems",
  AIS: "AIS Network Management",
  TOS: "Terminal Operating Systems",
  MD: "Marine Data",
};

// All available category codes
export const CATEGORY_CODES: CategoryCode[] = ["VTS", "HW", "PMIS", "PCS", "CS", "PDMS", "AIS", "TOS", "MD"];

// Get display label for a category code
export function getCategoryLabel(code: CategoryCode): string {
  return CATEGORY_LABELS[code] ?? code;
}

