import { ImportResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function importCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/import`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let message = `Import failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // response wasn't JSON — fall back to the generic message
    }
    throw new Error(message);
  }

  return res.json();
}
