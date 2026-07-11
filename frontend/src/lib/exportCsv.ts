import { CRM_FIELD_ORDER, CrmRecord } from "./types";

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function recordsToCsv(records: CrmRecord[]): string {
  const header = CRM_FIELD_ORDER.join(",");
  const lines = records.map((record) =>
    CRM_FIELD_ORDER.map((key) => escapeCell(record[key] ?? "")).join(",")
  );
  return [header, ...lines].join("\n");
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
