"use client";

import React from "react";
import Link from "next/link";

interface TipplayLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function TipplayLogo({
  className = "",
  size = "md",
  showText = true,
}: TipplayLogoProps) {
  const dimensions = {
    sm: { icon: "h-7 w-7", text: "text-base", mark: 28 },
    md: { icon: "h-9 w-9", text: "text-xl", mark: 36 },
    lg: { icon: "h-12 w-12", text: "text-2xl", mark: 48 },
  }[size];

  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      {/* Geometric Tipplay Icon Mark */}
      <div className={`relative flex items-center justify-center ${dimensions.icon}`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(0,230,118,0.4)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="tipplay-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E676" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="tipplay-accent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#00E676" />
            </linearGradient>
            <filter id="tipplay-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Rounded Hex Shield Base */}
          <path
            d="M20 3L35 10.5V26.5L20 35L5 26.5V10.5L20 3Z"
            fill="#121620"
            stroke="url(#tipplay-grad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Stylized Dynamic Tip Chevron + Play Arrow */}
          <path
            d="M14 12.5L24 20L14 27.5V12.5Z"
            fill="url(#tipplay-grad)"
          />
          <path
            d="M22 13L28.5 20L22 27"
            stroke="url(#tipplay-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-black tracking-tight ${dimensions.text} select-none`}>
          <span className="bg-gradient-to-r from-[#00E676] via-[#10B981] to-[#34D399] bg-clip-text text-transparent">
            Tip
          </span>
          <span className="text-white">play</span>
        </span>
      )}
    </Link>
  );
}
