"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Zap, Trophy, Plane, Flame, Gift, VolumeX, Pause, Play } from "lucide-react";
import { Button } from "./Button";

export type HeroVideoSlide = {
  id: string;
  badge: string;
  headline: string;
  highlightTitle: string;
  subhead: string;
  ctaLabel: string;
  ctaHref: string;
  textPosition: "left" | "right" | "center";
  videoSrc: string;
  webmSrc?: string;
  mobileVideoSrc?: string;
  poster: string;
  badgeColor?: string;
};

export const DEFAULT_HERO_SLIDES: HeroVideoSlide[] = [
  {
    id: "football-hero",
    badge: "ETHIOPIAN PREMIER LEAGUE",
    headline: "Super Boosted Odds On",
    highlightTitle: "Saint George vs Fasil Kenema",
    subhead: "Highest odds guaranteed for all Ethiopian Premier League matches this weekend.",
    ctaLabel: "Bet On Football",
    ctaHref: "/sports?league=Ethiopian%20Premier%20League",
    textPosition: "left",
    videoSrc: "/videos/football.mp4",
    webmSrc: "/videos/football.webm",
    mobileVideoSrc: "/videos/football-mobile.mp4",
    poster: "/images/virtual_football.png",
    badgeColor: "bg-[#00E676] text-black font-black",
  },
  {
    id: "crash-hero",
    badge: "HIGH MULTIPLIER CRASH",
    headline: "Fly High & Win Up To",
    highlightTitle: "100,000x Multiplier",
    subhead: "Cash out before the plane flies away! Real-time multiplier simulation.",
    ctaLabel: "Play Aviator Crash",
    ctaHref: "/games/aviator",
    textPosition: "right",
    videoSrc: "/videos/crash.mp4",
    webmSrc: "/videos/crash.webm",
    mobileVideoSrc: "/videos/crash-mobile.mp4",
    poster: "/images/aviator.png",
    badgeColor: "bg-cyan-400 text-black font-black",
  },
  {
    id: "casino-hero",
    badge: "CASINO & SLOTS SPOTLIGHT",
    headline: "Instant Win Jackpots &",
    highlightTitle: "Tumbling Reels",
    subhead: "Spin to win on Sweet Bonanza, Gates of Olympus, and Fast Keno draw games.",
    ctaLabel: "Explore Casino Games",
    ctaHref: "/games",
    textPosition: "left",
    videoSrc: "/videos/casino.mp4",
    webmSrc: "/videos/casino.webm",
    mobileVideoSrc: "/videos/casino-mobile.mp4",
    poster: "/images/slots.png",
    badgeColor: "bg-purple-400 text-black font-black",
  },
];

interface HeroVideoCarouselProps {
  slides?: HeroVideoSlide[];
  autoplayInterval?: number;
}

export function HeroVideoCarousel({
  slides = DEFAULT_HERO_SLIDES,
  autoplayInterval = 7000,
}: HeroVideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [preloadedIndices, setPreloadedIndices] = useState<Set<number>>(new Set([0]));
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  // 1. Detect Network SaveData / Slow 2G Throttling & Prefers Reduced Motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const conn = (navigator as any).connection || (navigator as any).webkitConnection;
      if (conn?.saveData || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") {
        setIsSlowConnection(true);
      }

      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setPrefersReducedMotion(true);
      }
    }
  }, []);

  // 2. PreloadNext Slide Video
  useEffect(() => {
    const nextIdx = (currentIndex + 1) % slides.length;
    if (!preloadedIndices.has(nextIdx)) {
      setPreloadedIndices((prev) => new Set(prev).add(nextIdx));
    }
  }, [currentIndex, slides.length, preloadedIndices]);

  // 3. Autoplay Timer
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    const timer = setInterval(nextSlide, autoplayInterval);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, autoplayInterval, prefersReducedMotion]);

  const currentSlide = slides[currentIndex];

  // Text position styling rules for visual safe zone
  const getOverlayPositionClass = (position: HeroVideoSlide["textPosition"]) => {
    switch (position) {
      case "right":
        return "items-start sm:items-end text-left sm:text-right sm:ml-auto";
      case "center":
        return "items-center text-center mx-auto";
      case "left":
      default:
        return "items-start text-left mr-auto";
    }
  };

  const shouldPlayVideo = !isSlowConnection && !prefersReducedMotion;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-[#0B0E11] min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* ───── Background Video & Poster Stack with Crossfade ───── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Poster Static Image (Always Present for zero flash) */}
            <img
              src={currentSlide.poster}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] scale-105"
            />

            {/* Video Background Layer */}
            {shouldPlayVideo && (
              <video
                ref={(el) => { videoRefs.current[currentIndex] = el; }}
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
                poster={currentSlide.poster}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] transition-opacity duration-500"
              >
                {currentSlide.webmSrc && <source src={currentSlide.webmSrc} type="video/webm" />}
                <source src={currentSlide.videoSrc} type="video/mp4" />
              </video>
            )}

            {/* Dark Gradient Backdrop Mask for Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E11] via-[#0B0E11]/60 to-transparent" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B0E11]/40 to-[#0B0E11]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ───── HTML Text Overlay (Safe Zone Positioning) ───── */}
      <div className="relative z-10 w-full px-5 py-8 sm:px-12 sm:py-14 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={`flex flex-col max-w-xl ${getOverlayPositionClass(currentSlide.textPosition)}`}
          >
            {/* Promo Badge */}
            <span
              className={`inline-block rounded-full px-3.5 py-1 text-[10px] sm:text-xs font-black tracking-wider uppercase ${
                currentSlide.badgeColor || "bg-[#00E676] text-black"
              } shadow-lg mb-3`}
            >
              {currentSlide.badge}
            </span>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {currentSlide.headline}{" "}
              <span className="bg-gradient-to-r from-[#00E676] via-[#FFD700] to-[#00E676] bg-clip-text text-transparent">
                {currentSlide.highlightTitle}
              </span>
            </h1>

            {/* Subhead */}
            <p className="mt-3 text-xs sm:text-sm font-semibold text-text-secondary leading-relaxed line-clamp-2 drop-shadow">
              {currentSlide.subhead}
            </p>

            {/* CTA Button */}
            <div className="mt-5 sm:mt-6 flex items-center gap-3">
              <Link href={currentSlide.ctaHref}>
                <Button variant="gold" className="text-xs sm:text-sm px-5 py-2.5 sm:px-6 sm:py-3 font-black shadow-xl shadow-electric/25">
                  <Zap className="h-4 w-4" />
                  {currentSlide.ctaLabel}
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ───── Navigation Controls & Indicators ───── */}
      {/* Left/Right Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 border border-white/10 backdrop-blur-md transition"
        aria-label="Previous Video Slide"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 border border-white/10 backdrop-blur-md transition"
        aria-label="Next Video Slide"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Video Mute / Pause Status & Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
        <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
          <VolumeX className="h-3 w-3 text-electric" /> Muted Video
        </span>
        <div className="h-3 w-px bg-white/20" />
        <div className="flex items-center gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 bg-[#00E676]"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
