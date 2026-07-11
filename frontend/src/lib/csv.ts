import Papa from "papaparse";

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export class CsvValidationError extends Error {}

export function validateCsvFile(file: File) {
  const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
  if (!isCsv) {
    throw new CsvValidationError("Only .csv files are supported.");
  }
  if (file.size === 0) {
    throw new CsvValidationError("This file is empty.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new CsvValidationError("File exceeds the 5MB size limit.");
  }
}

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        if (headers.length === 0) {
          reject(new CsvValidationError("No columns detected in this CSV."));
          return;
        }
        const rows = result.data.filter((row) =>
          Object.values(row).some((v) => v && String(v).trim().length > 0)
        );
        if (rows.length === 0) {
          reject(new CsvValidationError("This CSV has no data rows."));
          return;
        }
        resolve({ headers, rows });
      },
      error: (err: Error) => reject(err),
    });
  });
}
