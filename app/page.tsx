"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Activity,
  Dice5,
  BarChart3,
  ChevronRight,
  Trophy,
  Plane,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import {
  Button,
  Card,
  DemoBadge,
  LiveBadge,
  PromoBanner,
  SkeletonRow,
  TeamLogo,
} from "@/components/ui";
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

/* ─── Animated floating particles in hero ─── */
function HeroParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-electric/10"
          style={{
            width: `${20 + i * 15}px`,
            height: `${20 + i * 15}px`,
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `float ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── League emojis ─── */
const LEAGUE_ICONS: Record<string, string> = {
  "Ethiopian Premier League": "🇪🇹",
  "English Premier League": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "La Liga": "🇪🇸",
  "CAF Champions League": "🌍",
  "Serie A": "🇮🇹",
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

  return (
    <Shell>
      {/* ═══════════ Hero Section ═══════════ */}
      <section className="relative overflow-hidden mesh-gradient">
        <HeroParticles />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1fr_430px] lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <DemoBadge />
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.1] md:text-6xl">
              <span className="gradient-text">{t("hero.titleHighlight")}</span>
              <br />
              <span className="text-text-primary">{t("hero.title")}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-medium text-text-secondary">
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button variant="gold" className="text-base">
                  <Zap className="h-4 w-4" />
                  {t("hero.cta")}
                </Button>
              </Link>
              <Link href="/sports">
                <Button variant="ghost">{t("hero.browse")}</Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-8 flex gap-8">
              {[
                { icon: Users, value: t("hero.stat1"), label: t("hero.stat1Label") },
                { icon: Trophy, value: t("hero.stat2"), label: t("hero.stat2Label") },
                { icon: TrendingUp, value: t("hero.stat3"), label: t("hero.stat3Label") },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Icon className="h-4 w-4 text-electric" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-text-primary">{value}</div>
                    <div className="text-xs font-medium text-text-muted">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ─── Live matches preview card ─── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between px-1 pb-4">
              <span className="text-sm font-black text-text-primary">{t("sports.featuredMatches")}</span>
              <LiveBadge />
            </div>
            {loading ? (
              <SkeletonRow rows={2} />
            ) : matches.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-text-muted">
                {t("sports.noLive")}
              </p>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <Link
                    key={m.id}
                    href={`/sports/match/${m.id}`}
                    className="group block rounded-xl bg-white/5 p-3.5 transition hover:bg-white/8 neon-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-2 w-8 shrink-0">
                        <TeamLogo name={m.homeTeam} size="sm" />
                        <TeamLogo name={m.awayTeam} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm font-black text-text-primary truncate group-hover:text-electric transition">
                          <span>{m.homeTeam}</span>
                          {m.isLive && <span className="text-gold tabular">{m.homeScore ?? 0}</span>}
                        </div>
                        <div className="flex items-center justify-between text-sm font-black text-text-primary mt-1 truncate group-hover:text-electric transition">
                          <span>{m.awayTeam}</span>
                          {m.isLive && <span className="text-gold tabular">{m.awayScore ?? 0}</span>}
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-text-muted flex items-center gap-1">
                          <span className="text-electric">{LEAGUE_ICONS[m.league] || "⚽"} {m.league}</span>
                          <span className="text-white/20">•</span>
                          {m.isLive ? <span className="text-live">{m.minute}'</span> : <span>{new Date(m.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {m.odds
                        .filter((o) => o.marketName === "Match Result")
                        .slice(0, 3)
                        .map((o) => (
                          <div
                            key={o.id}
                            className="flex-1 rounded-lg bg-bg-elevated px-2 py-2 flex items-center justify-between text-xs font-black transition hover:bg-electric hover:text-white"
                          >
                            <span className="text-text-muted">{o.selection}</span>
                            <span className="text-electric group-hover:text-current">{Number(o.value).toFixed(2)}</span>
                          </div>
                        ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/sports"
              className="mt-4 flex items-center justify-center gap-1 text-sm font-bold text-electric transition hover:text-electric-hover"
            >
              View all matches <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Promo Banners ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <PromoBanner />
      </section>

      {/* ═══════════ League carousel ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          {["Ethiopian Premier League", "English Premier League", "La Liga", "CAF Champions League", "Serie A"].map((league) => (
            <Link
              key={league}
              href={`/sports?league=${encodeURIComponent(league)}`}
              className="group min-w-56 rounded-2xl bg-bg-card p-4 border border-white/6 transition hover:border-electric/30 hover:shadow-lg hover:shadow-electric/5"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{LEAGUE_ICONS[league] || "⚽"}</span>
                <div className="font-black text-text-primary">{league}</div>
              </div>
              <div className="mt-2 text-sm font-bold text-electric">
                {matches.filter((m) => m.league === league).length} {t("leagues.matches")}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ Quick Game Links ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Trophy,
              title: t("games.virtualFootball"),
              href: "/games/virtual-football",
              gradient: "from-emerald-500/20 to-green-600/10",
              iconClass: "text-neon-green animate-bounce-ball",
            },
            {
              icon: Plane,
              title: t("games.aviator"),
              href: "/games/aviator",
              gradient: "from-cyan-500/20 to-blue-600/10",
              iconClass: "text-electric animate-plane-fly",
            },
            {
              icon: Dice5,
              title: t("games.keno"),
              href: "/games/keno",
              gradient: "from-amber-500/20 to-yellow-600/10",
              iconClass: "text-gold animate-dice-roll",
            },
          ].map(({ icon: Icon, title, href, gradient, iconClass }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-4 rounded-2xl bg-gradient-to-r ${gradient} bg-bg-card p-5 border border-white/6 transition hover:border-white/15 hover:shadow-lg`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                <Icon className={`h-6 w-6 ${iconClass}`} />
              </div>
              <div className="flex-1">
                <div className="font-black text-text-primary">{title}</div>
                <div className="text-xs font-bold text-electric opacity-0 transition group-hover:opacity-100">
                  {t("games.playNow")} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ Feature cards ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-6 pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: t("features.safe"), desc: t("features.safeDesc"), color: "text-neon-green" },
            { icon: Activity, title: t("features.live"), desc: t("features.liveDesc"), color: "text-live" },
            { icon: Dice5, title: t("features.games"), desc: t("features.gamesDesc"), color: "text-gold" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <Card key={title} glow>
              <Icon className={`h-6 w-6 ${color}`} />
              <h3 className="mt-3 font-black text-text-primary">{title}</h3>
              <p className="mt-1 text-sm font-semibold text-text-muted">{desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </Shell>
  );
}
