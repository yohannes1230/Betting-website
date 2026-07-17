"use client";

import { clsx } from "clsx";

type Variant = "primary" | "ghost" | "soft" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-electric text-white shadow-lg shadow-electric-hover/30 hover:bg-electric-hover",
  ghost:
    "border border-white/30 bg-white/10 text-white hover:bg-white/20",
  soft:
    "bg-blue-tint text-navy hover:bg-electric hover:text-white",
  danger:
    "bg-live/10 text-live hover:bg-live hover:text-white",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-electric-hover focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
