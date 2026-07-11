import clsx from "clsx";

export type StepKey = "upload" | "preview" | "processing" | "results";

const STEPS: { key: StepKey; label: string; hint: string }[] = [
  { key: "upload", label: "Upload", hint: "Drop your CSV" },
  { key: "preview", label: "Preview", hint: "Check raw rows" },
  { key: "processing", label: "AI Mapping", hint: "Smart extraction" },
  { key: "results", label: "Review", hint: "Import & export" },
];

export function StepIndicator({ current }: { current: StepKey }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="flex w-full items-start">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <li key={step.key} className="flex flex-1 items-start last:flex-none">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
              <span
                className={clsx(
                  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  isDone && "bg-[var(--brand)] text-white shadow-[0_4px_14px_-4px_var(--brand-glow)]",
                  isActive &&
                    "bg-[var(--accent)] text-white shadow-[0_4px_16px_-2px_var(--accent-glow)] anim-pulse-ring",
                  !isDone &&
                    !isActive &&
                    "border-2 border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)]"
                )}
              >
                {isDone ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className="text-center sm:text-left">
                <span
                  className={clsx(
                    "block text-[13px] font-semibold leading-tight transition-colors",
                    isActive || isDone ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                  )}
                >
                  {step.label}
                </span>
                <span className="hidden text-[11px] text-[var(--muted)] md:block">{step.hint}</span>
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="relative mx-2 mt-[17px] h-[3px] flex-1 overflow-hidden rounded-full bg-[var(--border)] sm:mx-4">
                <div
                  className={clsx(
                    "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand)] transition-all duration-700 ease-out",
                    isDone ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
