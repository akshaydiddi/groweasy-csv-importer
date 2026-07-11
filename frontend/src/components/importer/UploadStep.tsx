"use client";

import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import clsx from "clsx";
import { CsvValidationError, validateCsvFile } from "@/lib/csv";

interface Props {
  onFileAccepted: (file: File) => void;
}

const SAMPLE_CSV = `created_at,name,email,mobile,city,company,status,remarks
2026-05-13 14:20:48,John Doe,john.doe@example.com,9876543210,Mumbai,GrowEasy,Interested,Client asked to reschedule demo
2026-05-13 14:25:30,Sarah Johnson,sarah.johnson@example.com,9876543211,Bangalore,Tech Solutions,No Answer,"Person was busy, will try again"
`;

const SOURCE_CHIPS = [
  { label: "Facebook Lead Ads", icon: "f" },
  { label: "Google Ads", icon: "G" },
  { label: "Excel exports", icon: "X" },
  { label: "CRM exports", icon: "C" },
  { label: "Manual sheets", icon: "M" },
];

export function UploadStep({ onFileAccepted }: Props) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      setError(null);
      if (rejections.length > 0) {
        setError(rejections[0].errors[0]?.message || "That file couldn't be accepted.");
        return;
      }
      const file = accepted[0];
      if (!file) return;
      try {
        validateCsvFile(file);
        onFileAccepted(file);
      } catch (err) {
        setError(err instanceof CsvValidationError ? err.message : "Couldn't read that file.");
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "text/csv": [".csv"] },
    maxSize: 5 * 1024 * 1024,
  });

  function downloadSample(e: React.MouseEvent) {
    e.stopPropagation();
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="anim-fade-up mx-auto max-w-3xl">
      <div
        {...getRootProps()}
        className={clsx(
          "group relative isolate flex cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl border-2 border-dashed px-8 py-16 text-center transition-all duration-300 sm:py-20",
          isDragActive
            ? "scale-[1.01] border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_0_6px_var(--accent-glow)]"
            : "border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--accent)] hover:shadow-[var(--card-shadow-hover)]"
        )}
      >
        <input {...getInputProps()} />

        {/* decorative dotted grid */}
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />

        <div
          className={clsx(
            "anim-float relative flex h-20 w-20 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
            "bg-gradient-to-br from-[var(--accent)] to-[#e8552c] text-white shadow-[0_12px_28px_-8px_var(--accent-glow)]"
          )}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7 9m5-5l5 5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 16.5v2.25A2.25 2.25 0 0117.75 21H6.25A2.25 2.25 0 014 18.75V16.5" />
          </svg>
          <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-white shadow-md">
            AI
          </span>
        </div>

        <div>
          <p className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            {isDragActive ? "Release to upload" : "Drop your CSV here"}
          </p>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            or <span className="font-semibold text-[var(--accent)] underline decoration-2 underline-offset-2">browse files</span> from your computer
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-1.5 text-xs font-medium text-[var(--muted)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          .csv only · up to 5MB · processed securely
        </span>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {SOURCE_CHIPS.map((chip, i) => (
            <span
              key={chip.label}
              className={clsx(
                "anim-fade-up inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)] transition-colors group-hover:border-[var(--border-strong)]",
                `stagger-${Math.min(i + 1, 4)}`
              )}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded bg-[var(--brand-soft)] text-[9px] font-bold text-[var(--brand)]">
                {chip.icon}
              </span>
              {chip.label}
            </span>
          ))}
        </div>

        <p className="max-w-lg text-xs leading-relaxed text-[var(--muted)]">
          Column names don&apos;t need to match anything. Our AI reads whatever headers you have —
          &ldquo;Ph&rdquo;, &ldquo;Contact No.&rdquo;, &ldquo;Lead&rdquo;, &ldquo;Remarks&rdquo; — and maps
          them into clean GrowEasy CRM fields.
        </p>

        <button
          type="button"
          onClick={downloadSample}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] transition-colors hover:text-[var(--brand-hover)]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />
          </svg>
          Download a sample CSV to try it out
        </button>
      </div>

      {error && (
        <div className="anim-scale-in mt-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
