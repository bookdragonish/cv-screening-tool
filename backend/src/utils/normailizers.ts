/**
 * Returns a clean string.
 *
 * - Trims whitespace
 * - Returns empty string if value is null/undefined
 */
export function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Cleans a list of strings.
 *
 * - Trims each item
 * - Removes empty items
 * - Removes duplicates
 */
export function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => normalizeString(item))
    .filter(Boolean);
}