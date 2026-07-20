"use client";

import { clsx } from "clsx";

type Variant = "primary" | "ghost" | "soft" | "danger" | "gold";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-electric text-white shadow-lg shadow-electric/20 hover:bg-electric-hover hover:shadow-electric/30",
  ghost:
    "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30",
  soft:
    "bg-white/10 text-electric hover:bg-electric hover:text-white",
  danger:
    "bg-live/15 text-live hover:bg-live hover:text-white shadow-lg shadow-live/10",
  gold:
    "bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black shadow-lg shadow-gold/20 hover:from-amber-400 hover:to-yellow-300",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:ring-offset-2 focus:ring-offset-bg-deep disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
