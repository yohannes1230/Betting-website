"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface GameCardProps {
  icon: React.ElementType;
  iconAnimation?: string;
  title: string;
  description: string;
  href: string;
  gradient: string;
  badge?: string;
  badgeColor?: string;
  playable?: boolean;
  image?: string;
}

export function GameCard({
  icon: Icon,
  iconAnimation,
  title,
  description,
  href,
  gradient,
  badge,
  badgeColor = "bg-live text-white",
  playable = true,
  image,
}: GameCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href={href}
        className={clsx(
          "group relative flex flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300",
          "neon-border card-shine",
          !playable && "pointer-events-none opacity-60",
        )}
        style={{
          background: "var(--color-bg-card)",
        }}
      >
        {/* Optional Cover Image */}
        {image && (
          <>
            <img 
              src={image} 
              alt={title} 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            {/* Dark gradient overlay to make text readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/80 to-transparent" />
          </>
        )}

        <div className="relative z-10 flex h-full flex-col">
          {/* Gradient accent bar at top */}
          <div className={`absolute -inset-x-6 -top-6 h-1 bg-gradient-to-r ${gradient}`} />

        {/* Badge */}
        {badge && (
          <span
            className={clsx(
              "absolute right-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
              badgeColor,
              badge === "HOT" && "animate-gold-glow",
            )}
          >
            {badge}
          </span>
        )}

        {/* Icon */}
        <div className={`mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/10 transition group-hover:ring-white/20 ${image ? 'bg-black/40 backdrop-blur-md' : 'bg-white/5'}`}>
          <Icon
            className={clsx(
              "h-7 w-7 text-electric transition group-hover:text-electric-hover",
              iconAnimation,
            )}
          />
        </div>

        {/* Text */}
        <h3 className="text-lg font-black text-text-primary">{title}</h3>
        <p className="mt-1 text-sm font-medium text-text-secondary">{description}</p>

        {/* Play now indicator */}
        {playable && (
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-electric opacity-0 transition group-hover:opacity-100">
            <span className="h-1.5 w-1.5 rounded-full bg-electric" />
            Play Now
          </div>
        )}
        </div>
      </Link>
    </motion.div>
  );
}
