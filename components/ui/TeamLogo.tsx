"use client";

import { clsx } from "clsx";
import { getTeamBadgeUrl, getTeamBadgeFallback } from "@/lib/teamLogos";

interface TeamLogoProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

export function TeamLogo({ name, size = "md", className }: TeamLogoProps) {
  const logoUrl = getTeamBadgeUrl(name);

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10 shadow-lg transition-transform hover:scale-110",
        sizeMap[size],
        className,
      )}
      title={name}
    >
      <img
        src={logoUrl}
        alt={`${name} badge`}
        className="h-full w-full object-contain p-1"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.onerror = null;
          target.src = getTeamBadgeFallback(name);
        }}
      />
    </div>
  );
}
