"use client";

import Link from "next/link";
import { Dice5, Plane, Trophy, Sparkles, Gauge, BadgeCheck } from "lucide-react";
import { Shell } from "@/components/Shell";
import { useI18n } from "@/lib/i18n";

const GAMES = [
  { icon: Dice5, title: "keno", href: "/games/keno", playable: true },
  { icon: Plane, title: "aviator", href: "/games/aviator", playable: true },
  { icon: Trophy, title: "virtualFootball", href: "/games/virtual-football", playable: true },
  { icon: Sparkles, title: "slots", href: "#", playable: false },
  { icon: Gauge, title: "roulette", href: "#", playable: false },
  { icon: BadgeCheck, title: "vip", href: "#", playable: false },
];

export default function GamesPage() {
  const { t } = useI18n();

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-3xl font-black text-navy">{t("games.title")}</h1>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {GAMES.map(({ icon: Icon, title, href, playable }) => (
            <Link
              key={title}
              href={href}
              className="relative rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md hover:ring-electric/20"
            >
              <Icon className="h-8 w-8 text-electric" />
              <div className="mt-4 text-xl font-black text-navy">
                {t(`games.${title}`)}
              </div>
              <p className="mt-1 text-sm font-semibold text-muted">
                {playable ? "Play now" : ""}
              </p>
              {!playable && (
                <span className="absolute right-4 top-4 rounded-full bg-light-grey px-3 py-1 text-xs font-black text-muted">
                  {t("games.comingSoon")}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}
