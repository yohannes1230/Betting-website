"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Plane, Dice5, ChevronRight, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type PromoSlide = {
  id: string;
  icon: React.ElementType;
  iconAnimation: string;
  href: string;
  gradient: string;
  accentGlow: string;
  titleKey: string;
  subtitleKey: string;
  ctaKey: string;
};

const SLIDES: PromoSlide[] = [
  {
    id: "virtual-football",
    icon: Trophy,
    iconAnimation: "animate-bounce-ball",
    href: "/games/virtual-football",
    gradient: "from-emerald-900/80 via-green-800/60 to-teal-900/80",
    accentGlow: "rgba(34, 197, 94, 0.3)",
    titleKey: "promo.vfTitle",
    subtitleKey: "promo.vfSubtitle",
    ctaKey: "promo.vfCta",
  },
  {
    id: "aviator",
    icon: Plane,
    iconAnimation: "animate-plane-fly",
    href: "/games/aviator",
    gradient: "from-blue-900/80 via-cyan-800/60 to-indigo-900/80",
    accentGlow: "rgba(0, 212, 255, 0.3)",
    titleKey: "promo.aviatorTitle",
    subtitleKey: "promo.aviatorSubtitle",
    ctaKey: "promo.aviatorCta",
  },
  {
    id: "keno",
    icon: Dice5,
    iconAnimation: "animate-dice-roll",
    href: "/games/keno",
    gradient: "from-amber-900/80 via-yellow-800/60 to-orange-900/80",
    accentGlow: "rgba(251, 191, 36, 0.3)",
    titleKey: "promo.kenoTitle",
    subtitleKey: "promo.kenoSubtitle",
    ctaKey: "promo.kenoCta",
  },
];

export function PromoBanner() {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  // Auto-rotate every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];
  const Icon = slide.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: 180 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Link
            href={slide.href}
            className={`flex h-full items-center gap-6 rounded-2xl bg-gradient-to-r ${slide.gradient} p-6 transition hover:brightness-110 md:p-8`}
            style={{ boxShadow: `0 0 40px ${slide.accentGlow}` }}
          >
            {/* Animated icon */}
            <div className="flex-shrink-0">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm md:h-20 md:w-20`}
              >
                <Icon className={`h-8 w-8 text-white md:h-10 md:w-10 ${slide.iconAnimation}`} />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" />
                <span className="text-xs font-bold uppercase tracking-wider text-gold">
                  {t("promo.hot")}
                </span>
              </div>
              <h3 className="mt-1 text-xl font-black text-white md:text-2xl">
                {t(slide.titleKey)}
              </h3>
              <p className="mt-1 text-sm font-medium text-white/70 line-clamp-2">
                {t(slide.subtitleKey)}
              </p>
            </div>

            {/* CTA */}
            <div className="hidden flex-shrink-0 md:block">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/25">
                {t(slide.ctaKey)}
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current
                ? "w-6 bg-white"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
