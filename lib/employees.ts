import { EmployeeRange } from "./types";

type EmployeeRangeOption = {
  value: EmployeeRange;
  label: string;
  min: number;
  max?: number;
};

export const EMPLOYEE_RANGE_OPTIONS: readonly EmployeeRangeOption[] = [
  { value: "1-10", label: "1-10", min: 1, max: 10 },
  { value: "11-50", label: "11-50", min: 11, max: 50 },
  { value: "51-200", label: "51-200", min: 51, max: 200 },
  { value: "201-500", label: "201-500", min: 201, max: 500 },
  { value: "501-1000", label: "501-1,000", min: 501, max: 1000 },
  { value: "1001-5000", label: "1,001-5,000", min: 1001, max: 5000 },
  { value: "5001-10000", label: "5,001-10,000", min: 5001, max: 10000 },
  { value: "10001+", label: "10,001+", min: 10001 },
] as const;

export const EMPLOYEE_RANGE_VALUES = EMPLOYEE_RANGE_OPTIONS.map((option) => option.value);

export function getEmployeeRangeLabel(value?: EmployeeRange | string | null): string | undefined {
  const option = EMPLOYEE_RANGE_OPTIONS.find((opt) => opt.value === value);
  return option?.label;
}

const MAX_RANGE = Number.MAX_SAFE_INTEGER;

export function normalizeEmployeeRange(input?: string | null): EmployeeRange | undefined {
  if (!input) return undefined;

  const trimmed = input.trim();
  if (!trimmed) return undefined;

  const sanitized = trimmed.replace(/\s+/g, "").replace(/,/g, "").replace(/–/g, "-");

  const directMatch = EMPLOYEE_RANGE_OPTIONS.find((option) => {
    const normalizedValue = option.value.replace(/,/g, "");
    const normalizedLabel = option.label.replace(/\s+/g, "").replace(/,/g, "").replace(/–/g, "-");
    return sanitized === normalizedValue || sanitized === normalizedLabel;
  });
  if (directMatch) return directMatch.value;

  const dashPos = sanitized.indexOf("-");
  const plusPos = sanitized.indexOf("+");

  const toNumber = (value: string) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  let sample: number | undefined;

  if (dashPos > -1) {
    const start = toNumber(sanitized.slice(0, dashPos));
    const end = toNumber(sanitized.slice(dashPos + 1));
    if (start !== undefined && end !== undefined && end >= start) {
      sample = Math.round((start + end) / 2);
    }
  } else if (plusPos > -1) {
    const start = toNumber(sanitized.slice(0, plusPos));
    if (start !== undefined) {
      sample = start + 1;
    }
  } else {
    const single = toNumber(sanitized);
    if (single !== undefined) {
      sample = single;
    }
  }

  if (sample === undefined) return undefined;

  const match = EMPLOYEE_RANGE_OPTIONS.find((option) => {
    const max = option.max ?? MAX_RANGE;
    return sample >= option.min && sample <= max;
  });

  return match?.value;
}

