import { ButtonHTMLAttributes, forwardRef, MouseEvent } from "react";
import clsx from "clsx";
import { useRipple } from "@/hooks/useRipple";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "brand";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-[var(--accent)] to-[var(--accent-2)] text-white shadow-[0_4px_14px_-4px_var(--accent-glow)] hover:shadow-[0_10px_26px_-4px_var(--accent-glow)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_14px_-4px_var(--accent-glow)]",
  brand:
    "bg-gradient-to-b from-[var(--brand)] to-[var(--brand-2)] text-white shadow-[0_4px_14px_-4px_var(--brand-glow)] hover:shadow-[0_10px_26px_-4px_var(--brand-glow)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  secondary:
    "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm hover:bg-[var(--background)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  ghost: "bg-transparent text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)] active:scale-[0.98]",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-2 text-[13px]",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-[15px]",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", onMouseDown, ...rest },
  ref
) {
  const ripple = useRipple();

  function handleMouseDown(e: MouseEvent<HTMLButtonElement>) {
    ripple(e);
    onMouseDown?.(e);
  }

  return (
    <button
      ref={ref}
      onMouseDown={handleMouseDown}
      className={clsx(
        "relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    />
  );
});
