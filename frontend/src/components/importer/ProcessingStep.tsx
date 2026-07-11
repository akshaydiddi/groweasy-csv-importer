"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

const STAGES = [
  { label: "Reading column headers", at: 0 },
  { label: "Matching fields by meaning", at: 22 },
  { label: "Extracting contacts & locations", at: 45 },
  { label: "Classifying status & source", at: 66 },
  { label: "Validating against CRM schema", at: 84 },
];

export function ProcessingStep({ rowCount }: { rowCount: number }) {
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    const cap = 93;
    const interval = setInterval(() => {
      setProgress((p) => (p >= cap ? cap : p + Math.max(0.4, (cap - p) * 0.045)));
    }, 180);
    return () => clearInterval(interval);
  }, []);

  const estimatedBatches = Math.max(1, Math.ceil(rowCount / 25));

  return (
    <div className="anim-fade-up mx-auto flex max-w-xl flex-col items-center py-12 text-center sm:py-16">
      {/* orbital loader */}
      <div className="relative mb-8 h-24 w-24">
        <div
          className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--border-strong)]"
          style={{ animation: "orbit-spin 9s linear infinite" }}
        />
        <div
          className="absolute inset-0"
          style={{ animation: "orbit-spin 2.4s linear infinite" }}
        >
          <span className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]" />
        </div>
        <div
          className="absolute inset-2.5"
          style={{ animation: "orbit-spin 3.8s linear infinite reverse" }}
        >
          <span className="absolute -bottom-0.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--brand)] shadow-[0_0_10px_var(--brand-glow)]" />
        </div>
        <div className="absolute inset-5 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[#e8552c] text-white shadow-[0_10px_26px_-8px_var(--accent-glow)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
        <span className="shimmer-text">AI is mapping your leads</span>
      </h3>
      <p className="mt-1.5 text-sm text-[var(--muted)]">
        {rowCount.toLocaleString()} rows · {estimatedBatches} batch{estimatedBatches > 1 ? "es" : ""} · usually
        takes a few seconds
      </p>

      {/* progress bar */}
      <div className="mt-8 w-full">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--muted)]">
          <span>Processing</span>
          <span className="tabular-nums text-[var(--accent)]">{Math.round(progress)}%</span>
        </div>
        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="progress-stripes h-full rounded-full bg-[var(--accent)] transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* stage checklist */}
      <ul className="mt-7 w-full space-y-2 text-left">
        {STAGES.map((stage) => {
          const done = progress > stage.at + 14;
          const active = !done && progress >= stage.at;
          return (
            <li
              key={stage.label}
              className={clsx(
                "flex items-center gap-3 rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-all duration-300",
                done && "border-[var(--brand-soft)] bg-[var(--brand-soft)]/60 text-[var(--foreground)]",
                active && "border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--foreground)]",
                !done && !active && "border-transparent text-[var(--muted)] opacity-50"
              )}
            >
              <span
                className={clsx(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
                  done && "bg-[var(--brand)] text-white",
                  active && "bg-[var(--accent)] text-white",
                  !done && !active && "border border-[var(--border-strong)]"
                )}
              >
                {done ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : active ? (
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
                ) : null}
              </span>
              {stage.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
