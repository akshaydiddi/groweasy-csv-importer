import { getExtractionModel } from "./geminiClient";
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES, CrmRecord, RawRow, SkippedRecord } from "../types/crm";

const SYSTEM_PROMPT = `You are a data-mapping engine for GrowEasy, a real-estate/sales CRM. You receive raw CSV lead rows exported from arbitrary, unpredictable sources (Facebook Lead Ads, Google Ads, Excel sheets, other CRMs, manual spreadsheets). Column names vary wildly and are never guaranteed to match the CRM schema.

Your job: map each raw row to the GrowEasy CRM schema by MEANING, not by exact column-name matching. Use judgement on synonyms, abbreviations, and unlabeled columns (e.g. "Mobile", "Contact No.", "Ph", "WhatsApp Number" all mean mobile_without_country_code; "Full Name", "Lead", "Customer" all mean name; "Remarks", "Comment", "Notes" all mean crm_note).

CRM SCHEMA FIELDS:
- created_at: lead creation date/time. MUST be a string parseable by JavaScript's \`new Date(created_at)\`. Prefer ISO-like "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD". If no date is present in the row, use "" (leave blank) rather than inventing one.
- name: lead's full name.
- email: primary email address only (see multi-value rule below).
- country_code: phone country code, formatted like "+91". Infer from context (e.g. Indian 10-digit numbers, "India" as country) when not explicit. If truly unknown, leave "".
- mobile_without_country_code: the phone number WITHOUT the country code, digits only (strip spaces/dashes/parens).
- company: company or organization name.
- city, state, country: location fields, mapped independently if present.
- lead_owner: the sales rep / agent / assignee responsible for this lead (may appear as "Owner", "Assigned To", "Agent", "Sales Rep").
- crm_status: MUST be exactly one of: ${CRM_STATUS_VALUES.join(", ")}. Infer from any status/stage/disposition column using best judgement (e.g. "Closed Won"/"Converted" -> SALE_DONE, "Not Interested"/"Rejected" -> BAD_LEAD, "No Answer"/"Unreachable" -> DID_NOT_CONNECT, "New"/"Interested"/"Hot" -> GOOD_LEAD_FOLLOW_UP). If there is no reasonable signal, leave "".
- crm_note: free text bucket for remarks, follow-up notes, extra comments, AND any secondary emails/phone numbers that don't fit the primary fields (see multi-value rule). Combine multiple pieces with " | " as a separator. Keep it to a single line (no literal newlines — use "\\n" as an escaped sequence if you must represent a line break).
- data_source: MUST be exactly one of: ${DATA_SOURCE_VALUES.join(", ")}, or "" if nothing in the row confidently indicates one of these five specific projects/campaigns. Do NOT guess loosely — only set this if there is clear textual evidence (e.g. a campcampaign/project/source column literally naming one of these).
- possession_time: for real-estate leads, when the property should be ready/possession-ready (e.g. "Dec 2026", "Ready to move"). Blank if not applicable.
- description: any other useful free-text context that doesn't belong in crm_note (e.g. property requirements, budget, unit type). Blank if nothing extra.

MULTI-VALUE RULE:
- If a row has multiple emails, use the first (leftmost / primary-looking) one as "email" and append the rest into crm_note as "Extra email: x@y.com".
- If a row has multiple phone numbers, use the first as mobile_without_country_code and append the rest into crm_note as "Extra phone: 9999999999".

SKIP RULE:
- If a row has NEITHER a usable email NOR a usable mobile/phone number, set "skip": true and give a short "skip_reason" (e.g. "no email or phone present"). Do not fabricate contact info to avoid skipping.
- Otherwise set "skip": false and fill in every field you can confidently determine; leave fields "" (empty string) if there's no reasonable source data — never invent values.

OUTPUT RULES:
- Return exactly one result object per input row, using the same "index" value given in the input for that row (so results can be matched back to inputs). Do not add, merge, drop, or reorder rows.
- All string values must be single-line (no raw newlines).
- Be decisive and consistent — same-shaped input should map the same way every time.`;

interface IndexedRecord extends CrmRecord {
  _index: number;
}

interface ExtractionOutcome {
  records: IndexedRecord[];
  skipped: SkippedRecord[];
  batchFailed: boolean;
}

const MAX_RETRIES = 2;
const BATCH_SIZE = 25;
const CONCURRENCY = 3;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function extractBatch(rows: RawRow[]): Promise<ExtractionOutcome> {
  const model = getExtractionModel();
  const userPayload = rows.map((r) => ({ index: r.index, row: r.data }));

  const prompt = `${SYSTEM_PROMPT}\n\nINPUT ROWS (JSON array, map every one):\n${JSON.stringify(userPayload)}`;

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text) as {
        results: Array<Record<string, unknown> & { index: number; skip: boolean; skip_reason?: string }>;
      };

      const byIndex = new Map(rows.map((r) => [r.index, r]));
      const records: IndexedRecord[] = [];
      const skipped: SkippedRecord[] = [];

      for (const item of parsed.results ?? []) {
        const source = byIndex.get(item.index);
        if (!source) continue;

        if (item.skip) {
          skipped.push({
            index: item.index,
            raw: source.data,
            reason: (item.skip_reason as string) || "Missing email and phone number",
          });
          continue;
        }

        const record: IndexedRecord = {
          _index: item.index,
          created_at: str(item.created_at),
          name: str(item.name),
          email: str(item.email),
          country_code: str(item.country_code),
          mobile_without_country_code: str(item.mobile_without_country_code),
          company: str(item.company),
          city: str(item.city),
          state: str(item.state),
          country: str(item.country),
          lead_owner: str(item.lead_owner),
          crm_status: (CRM_STATUS_VALUES as readonly string[]).includes(str(item.crm_status))
            ? (str(item.crm_status) as CrmRecord["crm_status"])
            : "",
          crm_note: str(item.crm_note),
          data_source: (DATA_SOURCE_VALUES as readonly string[]).includes(str(item.data_source))
            ? (str(item.data_source) as CrmRecord["data_source"])
            : "",
          possession_time: str(item.possession_time),
          description: str(item.description),
        };

        // Backstop: the model may occasionally mismark skip=false with no contact info.
        if (!record.email && !record.mobile_without_country_code) {
          skipped.push({ index: item.index, raw: source.data, reason: "Missing email and phone number" });
          continue;
        }

        records.push(record);
      }

      // Any input rows the model dropped entirely are treated as failures for this batch,
      // not silently lost — surfaced to the caller so a retry/skip decision can be made.
      const returnedIndexes = new Set((parsed.results ?? []).map((r) => r.index));
      const missing = rows.filter((r) => !returnedIndexes.has(r.index));
      for (const m of missing) {
        skipped.push({ index: m.index, raw: m.data, reason: "AI did not return a result for this row" });
      }

      return { records, skipped, batchFailed: false };
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
      }
    }
  }

  console.error("Batch extraction failed after retries:", lastError);
  return {
    records: [],
    skipped: rows.map((r) => ({
      index: r.index,
      raw: r.data,
      reason: "AI extraction failed for this batch after retries",
    })),
    batchFailed: true,
  };
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function stripIndex(record: IndexedRecord): CrmRecord {
  const rest = { ...record };
  delete (rest as Partial<IndexedRecord>)._index;
  return rest;
}

export async function extractCrmRecords(rows: RawRow[]) {
  const batches = chunk(rows, BATCH_SIZE);
  const results: ExtractionOutcome[] = new Array(batches.length);

  let cursor = 0;
  async function worker() {
    while (cursor < batches.length) {
      const i = cursor++;
      results[i] = await extractBatch(batches[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, batches.length) }, worker));

  const skipped = results.flatMap((r) => r.skipped);
  const failedBatches = results.filter((r) => r.batchFailed).length;

  // Preserve original row order in the output for a stable preview/result mapping.
  const records: CrmRecord[] = results
    .flatMap((r) => r.records)
    .sort((a, b) => a._index - b._index)
    .map((r) => stripIndex(r));

  return {
    records,
    skipped: skipped.sort((a, b) => a.index - b.index),
    batchSummary: { total: batches.length, succeeded: batches.length - failedBatches, failed: failedBatches },
  };
}
