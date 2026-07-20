import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "glass";
  glow?: boolean;
}

export function Card({ className, variant = "default", glow = false, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl p-4 transition-all duration-300",
        variant === "dark"
          ? "bg-bg-deep text-text-primary border border-white/5"
          : variant === "glass"
          ? "glass-card"
          : "bg-bg-card text-text-primary border border-white/6 hover:border-white/10",
        glow && "neon-border",
        className,
      )}
      {...props}
    />
  );
}
