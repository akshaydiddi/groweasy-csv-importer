"use client";

import { useCallback, useState } from "react";
import { StepIndicator, StepKey } from "@/components/importer/StepIndicator";
import { ThemeToggle } from "@/components/importer/ThemeToggle";
import { UploadStep } from "@/components/importer/UploadStep";
import { PreviewStep } from "@/components/importer/PreviewStep";
import { ProcessingStep } from "@/components/importer/ProcessingStep";
import { ResultsStep } from "@/components/importer/ResultsStep";
import { ParsedCsv, parseCsvFile } from "@/lib/csv";
import { importCsv } from "@/lib/api";
import { ImportResult } from "@/lib/types";

export default function Home() {
  const [step, setStep] = useState<StepKey>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileAccepted = useCallback(async (accepted: File) => {
    setError(null);
    try {
      const parsedCsv = await parseCsvFile(accepted);
      setFile(accepted);
      setParsed(parsedCsv);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't parse this CSV file.");
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!file) return;
    setStep("processing");
    setError(null);
    try {
      const res = await importCsv(file);
      setResult(res);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Please try again.");
      setStep("preview");
    }
  }, [file]);

  const handleReset = useCallback(() => {
    setFile(null);
    setParsed(null);
    setResult(null);
    setError(null);
    setStep("upload");
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      {/* ambient mesh gradient backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[560px] overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--hero-gradient)" }} />
        <div
          className="mesh-blob anim-drift-a h-72 w-72 sm:h-96 sm:w-96"
          style={{ background: "var(--brand)", top: "-6rem", left: "8%" }}
        />
        <div
          className="mesh-blob anim-drift-b h-64 w-64 sm:h-80 sm:w-80"
          style={{ background: "var(--accent)", top: "-3rem", right: "10%" }}
        />
        <div
          className="mesh-blob anim-drift-c h-56 w-56 sm:h-72 sm:w-72"
          style={{ background: "var(--brand-2)", top: "8rem", left: "45%" }}
        />
      </div>

      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)] text-[15px] font-extrabold text-white shadow-[0_6px_16px_-4px_var(--brand-glow)]">
              G
            </div>
            <div>
              <p className="text-[15px] font-bold leading-none tracking-tight text-[var(--foreground)]">
                GrowEasy
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-[var(--muted)]">AI Lead Importer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <div className="anim-fade-up mb-11 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Import leads from{" "}
            <span className="gradient-text-flow">any CSV</span>
          </h1>
          <p className="mx-auto mt-3.5 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Facebook exports, Google Ads, messy spreadsheets — drop the file and AI maps every column
            into clean GrowEasy CRM records.
          </p>
        </div>

        <div className="anim-fade-up stagger-2 mx-auto mb-11 max-w-3xl">
          <StepIndicator current={step} />
        </div>

        {error && (
          <div className="anim-scale-in mx-auto mb-6 flex max-w-3xl items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <span className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </span>
            <button onClick={() => setError(null)} className="shrink-0 font-bold underline underline-offset-2">
              Dismiss
            </button>
          </div>
        )}

        <div
          key={step}
          className="glass-card grain-overlay anim-fade-up rounded-[28px] p-5 shadow-[var(--card-shadow)] sm:p-9"
        >
          {step === "upload" && <UploadStep onFileAccepted={handleFileAccepted} />}

          {step === "preview" && file && parsed && (
            <PreviewStep file={file} parsed={parsed} onConfirm={handleConfirm} onCancel={handleReset} />
          )}

          {step === "processing" && <ProcessingStep rowCount={parsed?.rows.length ?? 0} />}

          {step === "results" && result && <ResultsStep result={result} onReset={handleReset} />}
        </div>

        {step !== "upload" && step !== "results" && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l6-6m-6 6l6 6" />
              </svg>
              Start over with a different file
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]/60 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 text-xs text-[var(--muted)] sm:flex-row sm:px-8">
          <span className="font-medium">GrowEasy · AI-powered CRM CSV import</span>
          <span className="flex items-center gap-4">
            <span>Batched extraction</span>
            <span className="h-1 w-1 rounded-full bg-[var(--border-strong)]" />
            <span>Auto retry</span>
            <span className="h-1 w-1 rounded-full bg-[var(--border-strong)]" />
            <span>Schema validated</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
