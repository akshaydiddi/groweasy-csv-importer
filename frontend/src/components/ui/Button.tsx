import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "brand";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-[var(--accent)] to-[#e8552c] text-white shadow-[0_4px_14px_-4px_var(--accent-glow)] hover:shadow-[0_8px_22px_-4px_var(--accent-glow)] hover:-translate-y-px active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_14px_-4px_var(--accent-glow)]",
  brand:
    "bg-gradient-to-b from-[var(--brand)] to-[#0c8a7f] text-white shadow-[0_4px_14px_-4px_var(--brand-glow)] hover:shadow-[0_8px_22px_-4px_var(--brand-glow)] hover:-translate-y-px active:translate-y-0",
  secondary:
    "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm hover:bg-[var(--background)] hover:-translate-y-px active:translate-y-0",
  ghost: "bg-transparent text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
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
  { className, variant = "primary", size = "md", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    />
  );
});
