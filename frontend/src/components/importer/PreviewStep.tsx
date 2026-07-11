"use client";

import { Button } from "@/components/ui/Button";
import { DataTable, DataTableColumn } from "./DataTable";
import { ParsedCsv } from "@/lib/csv";

interface Props {
  file: File;
  parsed: ParsedCsv;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PreviewStep({ file, parsed, onConfirm, onCancel }: Props) {
  const columns: DataTableColumn[] = parsed.headers.map((h) => ({ key: h, label: h, width: 200 }));

  return (
    <div className="anim-fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)] text-white shadow-[0_8px_20px_-6px_var(--brand-glow)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h1M4 6a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            </svg>
            <span className="absolute -bottom-1 -right-1 rounded bg-[var(--accent)] px-1 py-px text-[8px] font-bold uppercase text-white">
              csv
            </span>
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-[var(--foreground)]">{file.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-[var(--background)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <span className="rounded-md bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--brand)]">
                {parsed.rows.length.toLocaleString()} rows
              </span>
              <span className="rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                {parsed.headers.length} columns
              </span>
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-1.5 text-xs font-medium text-[var(--muted)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand)]" />
          </span>
          Raw preview — nothing sent to AI yet
        </span>
      </div>

      <DataTable columns={columns} rows={parsed.rows} maxHeight={460} />

      <div className="mt-7 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-[var(--muted)] sm:max-w-sm">
          These are your rows exactly as they appear in the file. Confirm to let AI map every column
          into GrowEasy CRM fields — status, source, contacts and all.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button size="lg" onClick={onConfirm} className="flex-1 sm:flex-none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
            Confirm &amp; Map with AI
          </Button>
        </div>
      </div>
    </div>
  );
}
