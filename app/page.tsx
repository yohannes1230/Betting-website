"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Activity, Dice5, BarChart3, Sparkles, ChevronRight } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button, Card, DemoBadge, LiveBadge, SkeletonRow } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

type MatchData = {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  isLive: boolean;
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  startTime: string;
  odds: Array<{ id: string; marketName: string; selection: string; value: number }>;
};

export default function HomePage() {
  const { t } = useI18n();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches?live=true")
      .then((r) => r.json())
      .then((data) => {
        setMatches(Array.isArray(data) ? data.slice(0, 4) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const leagues = [...new Set(matches.map((m) => m.league))];

  return (
    <Shell>
      {/* Hero Section */}
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_430px] lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col justify-center"
          >
            <DemoBadge />
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-medium text-white/75">
              {t("hero.subtitle")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register">
                <Button>{t("hero.cta")}</Button>
              </Link>
              <Link href="/sports">
                <Button variant="ghost">{t("hero.browse")}</Button>
              </Link>
            </div>
          </motion.div>

          {/* Live matches preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl bg-white p-4 text-dark-text shadow-2xl"
          >
            <div className="flex items-center justify-between px-1 pb-3">
              <span className="font-black text-navy">{t("sports.liveNow")}</span>
              <LiveBadge />
            </div>
            {loading ? (
              <SkeletonRow rows={2} />
            ) : matches.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-muted">
                {t("sports.noLive")}
              </p>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <Link
                    key={m.id}
                    href={`/sports/match/${m.id}`}
                    className="block rounded-xl bg-light-grey p-3 transition hover:bg-blue-tint"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-black text-navy">
                          {m.homeTeam} vs {m.awayTeam}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-muted">
                          {m.isLive ? `${m.minute}' — ${m.homeScore}-${m.awayScore}` : m.league}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted" />
                    </div>
                    <div className="mt-2 flex gap-2">
                      {m.odds
                        .filter((o) => o.marketName === "Match Result")
                        .slice(0, 3)
                        .map((o) => (
                          <span
                            key={o.id}
                            className="flex-1 rounded-full bg-white px-2 py-1.5 text-center text-xs font-black text-navy"
                            style={{ fontVariantNumeric: "tabular-nums" }}
                          >
                            {o.selection} {Number(o.value).toFixed(2)}
                          </span>
                        ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Leagues carousel */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          {["Ethiopian Premier League", "English Premier League", "La Liga", "CAF Champions League", "Serie A"].map((league) => (
            <Link
              key={league}
              href={`/sports?league=${encodeURIComponent(league)}`}
              className="min-w-56 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="font-black text-navy">{league}</div>
              <div className="mt-1 text-sm font-bold text-electric">
                {matches.filter((m) => m.league === league).length} {t("leagues.matches")}
              </div>
            </Link>
          ))}
        </div>

        {/* Promo banner */}
        <div className="mt-6 rounded-xl bg-electric px-5 py-4 text-white">
          <Sparkles className="mb-2 h-5 w-5" />
          <div className="font-black">{t("promo.welcome")}</div>
        </div>

        {/* Feature cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { icon: ShieldCheck, title: t("features.safe"), desc: t("features.safeDesc") },
            { icon: Activity, title: t("features.live"), desc: t("features.liveDesc") },
            { icon: Dice5, title: t("features.games"), desc: t("features.gamesDesc") },
            { icon: BarChart3, title: t("features.admin"), desc: t("features.adminDesc") },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <Icon className="h-6 w-6 text-electric" />
              <h3 className="mt-3 font-black text-navy">{title}</h3>
              <p className="mt-1 text-sm font-semibold text-muted">{desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </Shell>
  );
}
