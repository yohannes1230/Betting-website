"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Zap, Trophy, Plane, Flame, Gift } from "lucide-react";
import { Button } from "./Button";

export type PromoSlide = {
  id: string;
  badge: string;
  title: string;
  highlightTitle: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  icon: "zap" | "trophy" | "plane" | "flame" | "gift";
  bgGradient: string;
  badgeColor: string;
};

export const DEFAULT_PROMO_SLIDES: PromoSlide[] = [
  {
    id: "welcome-bonus",
    badge: "100% WELCOME BONUS",
    title: "Double Your Deposit Up To",
    highlightTitle: "10,000 ETB",
    subtitle: "Join Tipplay today and get a 100% instant match bonus on your first deposit!",
    ctaText: "Claim Bonus Now",
    ctaHref: "/register",
    icon: "gift",
    bgGradient: "from-[#00E676]/20 via-[#181C24] to-[#0B0E11]",
    badgeColor: "bg-[#00E676] text-black font-black",
  },
  {
    id: "epl-spotlight",
    badge: "ETHIOPIAN PREMIER LEAGUE",
    title: "Super Boosted Odds On",
    highlightTitle: "Saint George vs Fasil Kenema",
    subtitle: "Highest odds guaranteed for all Ethiopian Premier League matches this weekend.",
    ctaText: "Bet On EPL",
    ctaHref: "/sports?league=Ethiopian%20Premier%20League",
    icon: "trophy",
    bgGradient: "from-amber-500/20 via-[#181C24] to-[#0B0E11]",
    badgeColor: "bg-amber-400 text-black font-black",
  },
  {
    id: "aviator-crash",
    badge: "HIGH MULTIPLIER CRASH",
    title: "Fly High & Win Up To",
    highlightTitle: "100,000x Multiplier",
    subtitle: "Cash out before the plane flies away! Fast-paced real-time action.",
    ctaText: "Play Aviator Now",
    ctaHref: "/games/aviator",
    icon: "plane",
    bgGradient: "from-cyan-500/20 via-[#181C24] to-[#0B0E11]",
    badgeColor: "bg-cyan-400 text-black font-black",
  },
  {
    id: "cashback-weekly",
    badge: "WEEKLY CASHBACK",
    title: "Get 15% Cashback Every",
    highlightTitle: "Monday Morning",
    subtitle: "Play any sportsbook or casino game and get 15% automatic cashback on net losses.",
    ctaText: "Learn More",
    ctaHref: "/#promotions",
    icon: "zap",
    bgGradient: "from-purple-500/20 via-[#181C24] to-[#0B0E11]",
    badgeColor: "bg-purple-400 text-black font-black",
  },
];

interface PromoCarouselProps {
  slides?: PromoSlide[];
  autoplayInterval?: number;
}

export function PromoCarousel({
  slides = DEFAULT_PROMO_SLIDES,
  autoplayInterval = 5000,
}: PromoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, autoplayInterval);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, autoplayInterval]);

  const currentSlide = slides[currentIndex];

  const renderIcon = (icon: PromoSlide["icon"]) => {
    switch (icon) {
      case "trophy": return <Trophy className="h-8 w-8 text-amber-400" />;
      case "plane": return <Plane className="h-8 w-8 text-cyan-400 animate-pulse" />;
      case "flame": return <Flame className="h-8 w-8 text-red-500" />;
      case "gift": return <Gift className="h-8 w-8 text-[#00E676]" />;
      default: return <Zap className="h-8 w-8 text-[#00E676]" />;
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-[#181C24]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={`relative min-h-[220px] sm:min-h-[260px] p-6 sm:p-10 bg-gradient-to-r ${currentSlide.bgGradient} flex flex-col justify-center`}
        >
          <div className="max-w-2xl">
            <span
              className={`inline-block rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase ${currentSlide.badgeColor} shadow-md mb-3`}
            >
              {currentSlide.badge}
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              {currentSlide.title}{" "}
              <span className="bg-gradient-to-r from-[#00E676] to-[#FFD700] bg-clip-text text-transparent">
                {currentSlide.highlightTitle}
              </span>
            </h2>

            <p className="mt-2 text-xs sm:text-sm font-medium text-text-secondary line-clamp-2 max-w-xl">
              {currentSlide.subtitle}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <Link href={currentSlide.ctaHref}>
                <Button variant="gold" className="text-xs sm:text-sm px-6 py-2.5 font-black shadow-lg shadow-electric/20">
                  <Zap className="h-4 w-4" />
                  {currentSlide.ctaText}
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex h-24 w-24 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            {renderIcon(currentSlide.icon)}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/70 border border-white/10 backdrop-blur-sm transition"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/70 border border-white/10 backdrop-blur-sm transition"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-6 bg-[#00E676]"
                : "w-2 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
