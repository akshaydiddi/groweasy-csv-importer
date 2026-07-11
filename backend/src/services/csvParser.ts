import Papa from "papaparse";
import { RawRow } from "../types/crm";

export class CsvParseError extends Error {}

/**
 * Parses raw CSV text into row objects keyed by the CSV's own headers.
 * Headers are trimmed; fully-empty rows are dropped. Column names are
 * intentionally left as-is (not normalized) so the AI sees the source's
 * real vocabulary (e.g. "Phone Number", "E-mail Address", "Lead Contact").
 */
export function parseCsv(csvText: string): { headers: string[]; rows: RawRow[] } {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
    transform: (v) => (typeof v === "string" ? v.trim() : v),
  });

  if (result.errors.length > 0) {
    const fatal = result.errors.filter((e) => e.type !== "FieldMismatch");
    if (fatal.length > 0) {
      throw new CsvParseError(fatal[0].message);
    }
  }

  const headers = result.meta.fields ?? [];
  if (headers.length === 0) {
    throw new CsvParseError("No columns detected in CSV file.");
  }

  const rows: RawRow[] = result.data
    .map((data, index) => ({ index, data }))
    .filter(({ data }) => Object.values(data).some((v) => v && String(v).trim().length > 0));

  if (rows.length === 0) {
    throw new CsvParseError("CSV file contains no data rows.");
  }

  return { headers, rows };
}
