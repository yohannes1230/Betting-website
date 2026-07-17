import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl p-4 shadow-sm ring-1 ring-black/5",
        variant === "dark" ? "bg-navy text-white" : "bg-white",
        className,
      )}
      {...props}
    />
  );
}
