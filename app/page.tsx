"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Activity,
  Gamepad2,
  Dice5,
  Flame,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap,
  Star,
  Sparkles,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import {
  PromoCarousel,
  LiveTicker,
  Card,
  DemoBadge,
  LiveBadge,
  SkeletonRow,
  TeamLogo,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useBetSlipStore, SlipItem } from "@/lib/store";

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

const LEAGUE_ICONS: Record<string, string> = {
  "Ethiopian Premier League": "🇪🇹",
  "English Premier League": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "La Liga": "🇪🇸",
  "CAF Champions League": "🌍",
  "Serie A": "🇮🇹",
};

export default function HomePage() {
  const { t } = useI18n();
  const { slip, addSelection } = useBetSlipStore();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((data) => {
        setMatches(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const liveMatches = matches.filter((m) => m.isLive);
  const featuredMatches = selectedLeague === "All"
    ? matches
    : matches.filter((m) => m.league === selectedLeague);

  const quickCategories = [
    { label: "Sports", icon: Trophy, href: "/sports", badge: "Live", color: "from-[#00E676]/20 to-emerald-600/10 text-[#00E676]" },
    { label: "Live Betting", icon: Activity, href: "/sports?live=true", badge: "HOT", color: "from-red-500/20 to-rose-600/10 text-live" },
    { label: "Virtual Games", icon: Gamepad2, href: "/virtual-games", badge: "NEW", color: "from-blue-500/20 to-cyan-600/10 text-cyan-400" },
    { label: "Casino & Slots", icon: Dice5, href: "/games", badge: "Popular", color: "from-purple-500/20 to-indigo-600/10 text-purple-400" },
    { label: "Crash Games", icon: Flame, href: "/games/aviator", badge: "100x", color: "from-amber-500/20 to-yellow-600/10 text-gold" },
    { label: "Jackpots", icon: Award, href: "/games#jackpot", badge: "500K", color: "from-emerald-500/20 to-teal-600/10 text-[#00E676]" },
  ];

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 space-y-6">
        {/* 1. Hero Banner Carousel */}
        <section>
          <PromoCarousel />
        </section>

        {/* 2. Quick-Access Game Category Icons Row */}
        <section>
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto py-1">
            {quickCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className={`group shrink-0 flex items-center gap-3 rounded-2xl bg-gradient-to-r ${cat.color} bg-[#181C24] p-3 border border-white/8 hover:border-white/20 transition shadow-lg min-w-[155px]`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:scale-110 transition">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white group-hover:text-electric transition">
                      {cat.label}
                    </div>
                    {cat.badge && (
                      <span className="text-[9px] font-black uppercase tracking-wider text-text-muted">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 3. Live Now Ticker Strip */}
        <section>
          <LiveTicker matches={liveMatches} loading={loading} />
        </section>

        {/* 4. Main Sportsbook Grid with Sidebar Filters */}
        <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Left Category Sidebar (Desktop) & Filter Chips (Mobile) */}
          <aside className="space-y-4">
            <div className="rounded-2xl bg-[#181C24] border border-white/8 p-3 shadow-lg">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-text-muted px-2 py-1 mb-2">
                <Star className="h-3.5 w-3.5 text-gold" /> Pinned Leagues
              </div>

              <div className="no-scrollbar flex lg:flex-col gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setSelectedLeague("All")}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition shrink-0 ${
                    selectedLeague === "All"
                      ? "bg-[#00E676] text-black font-black"
                      : "text-text-secondary hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🔥</span>
                    <span>All Leagues</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-80">{matches.length}</span>
                </button>

                {/* Pinned Ethiopian Premier League */}
                <button
                  onClick={() => setSelectedLeague("Ethiopian Premier League")}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition shrink-0 ${
                    selectedLeague === "Ethiopian Premier League"
                      ? "bg-[#00E676] text-black font-black"
                      : "text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30 hover:bg-[#00E676]/20"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🇪🇹</span>
                    <span className="font-extrabold">Ethiopia Premier</span>
                  </span>
                  <span className="rounded bg-gold px-1 py-0.2 text-[9px] text-black font-black uppercase">
                    HOT
                  </span>
                </button>

                {["English Premier League", "La Liga", "CAF Champions League", "Serie A"].map((league) => (
                  <button
                    key={league}
                    onClick={() => setSelectedLeague(league)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition shrink-0 ${
                      selectedLeague === league
                        ? "bg-[#00E676] text-black font-black"
                        : "text-text-secondary hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{LEAGUE_ICONS[league] || "⚽"}</span>
                      <span>{league}</span>
                    </span>
                    <span className="text-[10px] font-mono opacity-80">
                      {matches.filter((m) => m.league === league).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Center Featured Matches Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-electric" />
                Featured Matches ({featuredMatches.length})
              </h3>
              <Link href="/sports" className="text-xs font-bold text-electric hover:underline flex items-center gap-0.5">
                View Sportsbook <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <SkeletonRow rows={3} />
            ) : featuredMatches.length === 0 ? (
              <div className="rounded-2xl bg-[#181C24] p-8 text-center text-xs font-semibold text-text-muted">
                No matches available for this league.
              </div>
            ) : (
              <div className="space-y-3">
                {featuredMatches.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="group rounded-2xl bg-[#181C24] border border-white/8 p-4 shadow-lg hover:border-electric/30 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <TeamLogo name={m.homeTeam} size="sm" />
                          <TeamLogo name={m.awayTeam} size="sm" />
                        </div>

                        <div>
                          <div className="text-xs font-bold text-electric flex items-center gap-1">
                            <span>{LEAGUE_ICONS[m.league] || "⚽"}</span>
                            <span>{m.league}</span>
                            {m.isLive ? (
                              <span className="ml-2 flex items-center gap-1 text-[10px] font-black text-live bg-live/10 px-1.5 py-0.5 rounded">
                                <Activity className="h-3 w-3 animate-pulse" /> {m.minute}'
                              </span>
                            ) : (
                              <span className="ml-2 text-[10px] text-text-muted">
                                {new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 text-sm font-black text-white group-hover:text-electric transition flex items-center gap-3">
                            <span>{m.homeTeam}</span>
                            <span className="text-text-muted">vs</span>
                            <span>{m.awayTeam}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Odds Buttons Grid */}
                      <div className="flex items-center gap-2 sm:w-auto w-full">
                        {m.odds
                          .filter((o) => o.marketName === "Match Result")
                          .slice(0, 3)
                          .map((o) => {
                            const isSelected = slip.some((s) => s.oddsId === o.id);

                            const handleSelect = () => {
                              const item: SlipItem = {
                                oddsId: o.id,
                                matchId: m.id,
                                marketName: o.marketName,
                                selection: o.selection,
                                value: o.value,
                                homeTeam: m.homeTeam,
                                awayTeam: m.awayTeam,
                                league: m.league,
                              };
                              addSelection(item);
                            };

                            return (
                              <button
                                key={o.id}
                                onClick={handleSelect}
                                className={`flex-1 sm:w-20 rounded-xl px-3 py-2 flex flex-col items-center justify-center text-xs font-black transition ${
                                  isSelected
                                    ? "bg-[#00E676] text-black shadow-lg shadow-electric/30 font-black scale-105"
                                    : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                <span className="text-[10px] text-text-muted uppercase">{o.selection}</span>
                                <span className="font-mono text-electric group-hover:text-white tabular">
                                  {Number(o.value).toFixed(2)}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 5. Virtual Games Lobby Preview */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-950/40 via-[#181C24] to-[#12151C] border border-white/10 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="rounded bg-cyan-400 text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                VIRTUAL SPORTS
              </span>
              <h3 className="text-lg font-black text-white mt-1">24/7 Virtual Games Lobby</h3>
            </div>
            <Link
              href="/virtual-games"
              className="rounded-xl bg-cyan-500/20 text-cyan-400 px-4 py-2 text-xs font-black hover:bg-cyan-500/30 transition flex items-center gap-1"
            >
              Explore All 20 Virtuals <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Virtual Football League", desc: "AI-simulated matches every 75s", icon: "⚽", badge: "POPULAR" },
              { name: "Virtual Champions Cup", desc: "Knockout tournament mode", icon: "🏆", badge: "NEW" },
              { name: "Virtual Greyhound Racing", desc: "Fast-paced track racing", icon: "🐕", badge: "HOT" },
              { name: "Rocket Crash", desc: "Multiplier rocket launch", icon: "🚀", badge: "HIGH MULTI" },
            ].map((vGame) => (
              <Link
                key={vGame.name}
                href="/virtual-games"
                className="group rounded-2xl bg-[#181C24] border border-white/8 p-4 hover:border-cyan-400/40 transition shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{vGame.icon}</span>
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-black text-cyan-400">
                      {vGame.badge}
                    </span>
                  </div>
                  <h4 className="mt-3 text-sm font-black text-white group-hover:text-cyan-400 transition">
                    {vGame.name}
                  </h4>
                  <p className="mt-1 text-xs text-text-muted">{vGame.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-end text-xs font-black text-cyan-400">
                  Play Demo →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. Casino & Slots Preview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Dice5 className="h-4 w-4 text-purple-400" />
              Casino & Slots Spotlight
            </h3>
            <Link href="/games" className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-0.5">
              View All Games <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { title: "Aviator Crash Game", subtitle: "Fly high & cash out before crash", icon: Flame, href: "/games/aviator", color: "from-amber-500/20 to-red-600/10 text-gold" },
              { title: "Fast Keno & Lucky Numbers", subtitle: "Instant draw numbers up to 10,000x", icon: Dice5, href: "/games/keno", color: "from-purple-500/20 to-pink-600/10 text-purple-400" },
              { title: "Sweet Bonanza & Slots", subtitle: "Tumbling reels with scatter multipliers", icon: Sparkles, href: "/games", color: "from-emerald-500/20 to-teal-600/10 text-[#00E676]" },
            ].map((casino) => {
              const Icon = casino.icon;
              return (
                <Link
                  key={casino.title}
                  href={casino.href}
                  className={`group rounded-2xl bg-gradient-to-r ${casino.color} bg-[#181C24] p-5 border border-white/8 hover:border-white/20 transition shadow-xl`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:scale-110 transition">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="mt-4 text-base font-black text-white group-hover:text-electric transition">
                    {casino.title}
                  </h4>
                  <p className="mt-1 text-xs font-semibold text-text-muted">{casino.subtitle}</p>
                  <div className="mt-4 flex items-center justify-end text-xs font-black text-electric">
                    Play Now →
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 7. Responsible Gaming & Trust Banner */}
        <section className="rounded-2xl bg-[#181C24] border border-white/8 p-6 text-center space-y-2">
          <div className="flex justify-center">
            <ShieldCheck className="h-8 w-8 text-[#00E676]" />
          </div>
          <h4 className="text-sm font-black text-white">Safe, Licensed & Responsible Sports Betting</h4>
          <p className="text-xs text-text-muted max-w-xl mx-auto">
            Tipplay operates in full compliance with local regulatory guidelines. Betting should be fun and entertaining — set limits and play responsibly. 18+ Only.
          </p>
        </section>
      </div>
    </Shell>
  );
}
