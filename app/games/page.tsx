"use client";

import { Dice5, Plane, Trophy, Sparkles, Gauge, BadgeCheck } from "lucide-react";
import { Shell } from "@/components/Shell";
import { GameCard, PromoBanner } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

export default function GamesPage() {
  const { t } = useI18n();

  const GAMES = [
    {
      icon: Trophy,
      iconAnimation: "animate-bounce-ball",
      titleKey: "virtualFootball",
      descKey: "virtualFootballDesc",
      href: "/games/virtual-football",
      gradient: "from-emerald-500 to-green-600",
      badge: t("games.hot"),
      badgeColor: "bg-gradient-to-r from-amber-500 to-yellow-400 text-black",
      playable: true,
      image: "/images/virtual_football.png",
    },
    {
      icon: Plane,
      iconAnimation: "animate-plane-fly",
      titleKey: "aviator",
      descKey: "aviatorDesc",
      href: "/games/aviator",
      gradient: "from-cyan-500 to-blue-600",
      badge: t("games.hot"),
      badgeColor: "bg-gradient-to-r from-amber-500 to-yellow-400 text-black",
      playable: true,
      image: "/images/aviator.png",
    },
    {
      icon: Dice5,
      iconAnimation: "animate-dice-roll",
      titleKey: "keno",
      descKey: "kenoDesc",
      href: "/games/keno",
      gradient: "from-amber-500 to-orange-600",
      playable: true,
      image: "/images/fast_keno.png",
    },
    {
      icon: Sparkles,
      iconAnimation: "animate-pulse",
      titleKey: "sweetBonanza",
      descKey: "sweetBonanzaDesc",
      href: "/games/sweet-bonanza",
      gradient: "from-pink-500 to-rose-600",
      badge: "Demo",
      badgeColor: "bg-gradient-to-r from-pink-500 to-rose-400 text-white",
      playable: true,
      image: "/images/sweet_bonanza.png",
    },
    {
      icon: Trophy,
      titleKey: "gatesOfOlympus",
      descKey: "gatesOfOlympusDesc",
      href: "/games/gates-of-olympus",
      gradient: "from-yellow-400 to-amber-600",
      badge: "Demo",
      badgeColor: "bg-gradient-to-r from-yellow-500 to-amber-400 text-black",
      playable: true,
      image: "/images/gates_of_olympus.png",
    },
    {
      icon: Dice5,
      titleKey: "sugarRush",
      descKey: "sugarRushDesc",
      href: "/games/sugar-rush",
      gradient: "from-fuchsia-500 to-purple-600",
      badge: "Demo",
      badgeColor: "bg-gradient-to-r from-fuchsia-500 to-purple-400 text-white",
      playable: true,
      image: "/images/sugar_rush.svg",
    },
    {
      icon: Gauge,
      titleKey: "roulette",
      descKey: "rouletteDesc",
      href: "#",
      gradient: "from-red-500 to-rose-600",
      badge: t("games.comingSoon"),
      badgeColor: "bg-white/10 text-text-muted",
      playable: false,
      image: "/images/live_roulette.png",
    },
    {
      icon: BadgeCheck,
      titleKey: "vip",
      descKey: "vipDesc",
      href: "#",
      gradient: "from-gold to-amber-600",
      badge: t("games.comingSoon"),
      badgeColor: "bg-white/10 text-text-muted",
      playable: false,
    },
  ];

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-black">
            <span className="gradient-text">{t("games.title")}</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-text-secondary">
            {t("hero.subtitle")}
          </p>
        </motion.div>

        {/* Promo banner */}
        <div className="mt-6">
          <PromoBanner />
        </div>

        {/* Game cards grid */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <GameCard
                icon={game.icon}
                iconAnimation={game.iconAnimation}
                title={t(`games.${game.titleKey}`)}
                description={t(`games.${game.descKey}`)}
                href={game.href}
                gradient={game.gradient}
                badge={game.badge}
                badgeColor={game.badgeColor}
                playable={game.playable}
                image={game.image}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
