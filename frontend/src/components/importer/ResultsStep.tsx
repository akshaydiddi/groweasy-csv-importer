"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, DataTableColumn } from "./DataTable";
import { CRM_FIELD_LABELS, CRM_FIELD_ORDER, CrmRecord, ImportResult } from "@/lib/types";
import { downloadCsv, recordsToCsv } from "@/lib/exportCsv";

interface Props {
  result: ImportResult;
  onReset: () => void;
}

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  SALE_DONE: "success",
  GOOD_LEAD_FOLLOW_UP: "info",
  DID_NOT_CONNECT: "warning",
  BAD_LEAD: "danger",
};

function StatCard({
  label,
  value,
  sub,
  icon,
  tone,
  delay,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  tone: "brand" | "accent" | "danger" | "neutral";
  delay: string;
}) {
  const iconClasses = {
    brand: "bg-[var(--brand-soft)] text-[var(--brand)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
    danger: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
    neutral: "bg-[var(--background)] text-[var(--muted)]",
  }[tone];

  return (
    <div
      className={clsx(
        "anim-fade-up group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] transition-shadow hover:shadow-[var(--card-shadow-hover)] sm:p-5",
        delay
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">{label}</p>
        <span className={clsx("flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110", iconClasses)}>
          {icon}
        </span>
      </div>
      <p className="anim-count-pop mt-2 text-3xl font-extrabold tabular-nums tracking-tight text-[var(--foreground)]">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] font-medium text-[var(--muted)]">{sub}</p>}
    </div>
  );
}

export function ResultsStep({ result, onReset }: Props) {
  const [tab, setTab] = useState<"imported" | "skipped">("imported");

  const successRate =
    result.totalRows > 0 ? Math.round((result.totalImported / result.totalRows) * 100) : 0;

  const importedColumns: DataTableColumn[] = useMemo(
    () =>
      CRM_FIELD_ORDER.map((key) => ({
        key,
        label: CRM_FIELD_LABELS[key],
        width: key === "crm_note" || key === "description" ? 260 : key === "name" || key === "email" ? 200 : 150,
        render:
          key === "crm_status"
            ? (v: string) => (v ? <Badge tone={STATUS_TONE[v] ?? "neutral"}>{v.replaceAll("_", " ")}</Badge> : "—")
            : undefined,
      })),
    []
  );

  const importedRows = result.records as unknown as Record<string, string>[];

  const skippedColumns: DataTableColumn[] = useMemo(() => {
    const rawKeys = new Set<string>();
    result.skipped.forEach((s) => Object.keys(s.raw).forEach((k) => rawKeys.add(k)));
    return [
      { key: "__reason", label: "Skip Reason", width: 240 },
      ...Array.from(rawKeys).map((k) => ({ key: k, label: k, width: 180 })),
    ];
  }, [result.skipped]);

  const skippedRows = useMemo(
    () => result.skipped.map((s) => ({ __reason: s.reason, ...s.raw })),
    [result.skipped]
  );

  function handleExport() {
    downloadCsv("groweasy_crm_import.csv", recordsToCsv(result.records as CrmRecord[]));
  }

  return (
    <div className="anim-fade-in">
      {/* success banner */}
      <div className="anim-scale-in mb-6 flex items-center gap-3.5 rounded-2xl border border-[var(--brand-soft)] bg-[var(--brand-soft)]/70 px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-[0_6px_16px_-4px_var(--brand-glow)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <div>
          <p className="text-[15px] font-bold text-[var(--foreground)]">
            Import complete — {successRate}% of rows mapped successfully
          </p>
          <p className="text-xs text-[var(--muted)]">
            {result.totalImported.toLocaleString()} leads are ready for your CRM
            {result.totalSkipped > 0 && ` · ${result.totalSkipped} skipped (see tab below)`}
          </p>
        </div>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Rows"
          value={result.totalRows}
          sub="found in your file"
          tone="neutral"
          delay="stagger-1"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m-9.75 0h7.5" />
            </svg>
          }
        />
        <StatCard
          label="Imported"
          value={result.totalImported}
          sub={`${successRate}% success rate`}
          tone="brand"
          delay="stagger-2"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Skipped"
          value={result.totalSkipped}
          sub="missing email & phone"
          tone="danger"
          delay="stagger-3"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
        <StatCard
          label="AI Batches"
          value={`${result.batches.succeeded}/${result.batches.total}`}
          sub={result.batches.failed > 0 ? `${result.batches.failed} failed after retries` : "all succeeded"}
          tone="accent"
          delay="stagger-4"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          }
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--background)] p-1">
          <button
            type="button"
            onClick={() => setTab("imported")}
            className={clsx(
              "rounded-lg px-4 py-1.5 text-[13px] font-semibold transition-all duration-200",
              tab === "imported"
                ? "bg-[var(--surface)] text-[var(--brand)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            ✓ Imported ({result.totalImported})
          </button>
          <button
            type="button"
            onClick={() => setTab("skipped")}
            className={clsx(
              "rounded-lg px-4 py-1.5 text-[13px] font-semibold transition-all duration-200",
              tab === "skipped"
                ? "bg-[var(--surface)] text-red-500 shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            ⊘ Skipped ({result.totalSkipped})
          </button>
        </div>

        <div className="flex gap-2.5">
          <Button variant="brand" size="sm" onClick={handleExport} disabled={result.records.length === 0}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />
            </svg>
            Export CRM CSV
          </Button>
          <Button size="sm" onClick={onReset}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New import
          </Button>
        </div>
      </div>

      <div key={tab} className="anim-fade-in">
        {tab === "imported" ? (
          <DataTable
            columns={importedColumns}
            rows={importedRows}
            maxHeight={500}
            emptyLabel="No records were successfully mapped."
          />
        ) : (
          <DataTable
            columns={skippedColumns}
            rows={skippedRows}
            maxHeight={500}
            emptyLabel="Nothing was skipped — every row had an email or phone number."
          />
        )}
      </div>
    </div>
  );
}
