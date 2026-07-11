# GrowEasy — AI-Powered CSV Lead Importer

Upload a CSV lead export in *any* column layout — Facebook Lead Ads, Google Ads,
a real-estate CRM, a manually built spreadsheet, whatever — and have it mapped
into the GrowEasy CRM schema automatically using an LLM (Google Gemini).

The system doesn't rely on fixed column names. It sends each row's raw
header/value pairs to Gemini with a schema-constrained prompt, and the model
maps by *meaning* (e.g. "Ph", "Mobile", "WhatsApp Number" all become
`mobile_without_country_code`).

## Project structure

```
backend/    Node.js + Express API — CSV parsing, batching, Gemini extraction
frontend/   Next.js (App Router) — upload, preview, confirm, results UI
samples/    Example messy CSVs (Facebook, Google Ads, real-estate CRM, manual sheet)
```

## How it works

1. **Upload** — drag & drop or pick a `.csv` file (client-side validated, max 5MB).
2. **Preview** — the file is parsed *entirely in the browser* (no backend call yet)
   and shown in a sticky-header, scrollable table exactly as it is in the file.
3. **Confirm** — only now does the frontend call the backend.
4. **AI Mapping** — the backend re-parses the CSV, splits rows into batches of 25,
   and sends each batch to Gemini in parallel (bounded concurrency) with a
   schema-constrained prompt (Gemini's `responseSchema` / structured output — not
   just "please return JSON"). Failed batches retry up to twice with backoff; if a
   batch still fails, its rows are reported as skipped rather than silently lost.
5. **Results** — imported vs. skipped records, with counts, an "AI batches" health
   indicator, and a one-click CRM-formatted CSV export.

## Prerequisites

- Node.js 20.9+
- A [Gemini API key](https://aistudio.google.com/app/apikey) 

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and set GEMINI_API_KEY=your_key
npm run dev
```

Runs on `http://localhost:4000`. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Runs on `http://localhost:3000`.

Open the app, drop in one of the files from [`samples/`](samples/), preview it,
confirm, and watch the AI-mapped result come back.

## API

### `POST /api/import`

`multipart/form-data`, field name `file` (a `.csv`, max 5MB).

Response:

```json
{
  "records": [ { "created_at": "...", "name": "...", "email": "...", "...": "..." } ],
  "skipped": [ { "index": 5, "raw": { "...": "..." }, "reason": "no email or phone present" } ],
  "totalImported": 4,
  "totalSkipped": 2,
  "totalRows": 6,
  "batches": { "total": 1, "succeeded": 1, "failed": 0 }
}
```

## AI extraction rules

Implemented in [`backend/src/services/aiExtractor.ts`](backend/src/services/aiExtractor.ts):

- `crm_status` is constrained to the 4 allowed enum values (or blank).
- `data_source` is constrained to the 5 allowed project slugs (or blank if not confidently indicated).
- `created_at` is required to be parseable by `new Date(...)`.
- Extra emails/phone numbers beyond the primary one are folded into `crm_note`.
- Rows with neither an email nor a phone number are skipped (both by prompt
  instruction and a server-side backstop check, in case the model gets it wrong).
- Every CSV row maps to exactly one output row — no line-break injection into the CSV.

## Design notes / trade-offs

- **Parsing happens twice, by design.** The browser parses for the zero-cost
  preview (per the "no AI processing yet" requirement); the backend re-parses
  the same file server-side before sending it to the model, so the AI step never
  trusts client-supplied JSON.
- **Structured output over prompt-and-hope.** Gemini's `responseSchema` enforces
  the JSON shape and the enum fields at the API level, which is far more reliable
  than parsing free-form model text.
- **Batching + bounded concurrency.** 25 rows/batch, 3 batches in flight at once —
  balances throughput against per-request token limits and rate limits.
- **Stateless.** No database. Each import is a single request/response; nothing
  is persisted server-side.
- **Large files.** The preview and results tables switch to virtualized rendering
  (`@tanstack/react-virtual`) above ~60 rows so a several-thousand-row CSV stays smooth.

## Docker

```bash
GEMINI_API_KEY=your_key docker compose up --build
```

Frontend on `:3000`, backend on `:4000`.

## Tech stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, react-dropzone, PapaParse, TanStack Virtual
- **Backend:** Node.js, Express, TypeScript, Multer, PapaParse, `@google/generative-ai` (Gemini)
