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
  Play,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import {
  HeroVideoCarousel,
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
  "UEFA Champions League": "🏆",
  "UEFA Europa League": "🏆",
  "Serie A": "🇮🇹",
  "Bundesliga": "🇩🇪",
  "Ligue 1": "🇫🇷",
  "Primeira Liga": "🇵🇹",
  "Eredivisie": "🇳🇱",
  "Süper Lig": "🇹🇷",
  "Belgian Pro League": "🇧🇪",
  "Scottish Premiership": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Swiss Super League": "🇨🇭",
  "MLS": "🇺🇸",
  "Brasileirão Série A": "🇧🇷",
  "Argentine Primera": "🇦🇷",
  "Liga MX": "🇲🇽",
  "A-League": "🇦🇺",
  "J-League": "🇯🇵",
  "K-League": "🇰🇷",
  "League of Ireland": "🇮🇪",
  "Copa Libertadores": "🌎",
  "Copa Sudamericana": "🌎",
  "Saudi Pro League": "🇸🇦",
  "Danish Superliga": "🇩🇰",
  "Allsvenskan": "🇸🇪",
  "Eliteserien": "🇳🇴",
  "Veikkausliiga": "🇫🇮",
  "Ekstraklasa": "🇵🇱",
  "Greek Super League": "🇬🇷",
  "Austrian Bundesliga": "🇦🇹",
  "Czech First League": "🇨🇿",
  "Croatian HNL": "🇭🇷",
  "Chinese Super League": "🇨🇳",
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

  const defaultLeagues = [
    "English Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1",
    "UEFA Champions League", "UEFA Europa League", "CAF Champions League",
    "Primeira Liga", "Eredivisie", "Süper Lig", "Belgian Pro League",
    "Scottish Premiership", "Swiss Super League", "MLS",
    "Brasileirão Série A", "Argentine Primera", "Liga MX",
    "A-League", "J-League", "K-League", "Saudi Pro League",
    "Copa Libertadores", "Copa Sudamericana", "League of Ireland",
    "Danish Superliga", "Allsvenskan", "Eliteserien", "Veikkausliiga",
    "Ekstraklasa", "Greek Super League", "Austrian Bundesliga",
    "Czech First League", "Croatian HNL", "Chinese Super League",
  ];
  const dynamicLeagues = Array.from(new Set(matches.map((m) => m.league)))
    .filter((l) => l && l !== "Ethiopian Premier League" && !defaultLeagues.includes(l))
    .sort();
  const leaguesList = [...defaultLeagues, ...dynamicLeagues];

  // Pre-compute match counts per league for sidebar badges
  const leagueMatchCounts = new Map<string, number>();
  matches.forEach((m) => {
    leagueMatchCounts.set(m.league, (leagueMatchCounts.get(m.league) || 0) + 1);
  });

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
        {/* 1. Video-Driven Hero Banner Carousel */}
        <section>
          <HeroVideoCarousel />
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
        <section className="grid gap-6 lg:grid-cols-[240px_1fr] items-start">
          {/* Left Category Sidebar — sticky, scrollable, stretches to viewport */}
          <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5.5rem)]">
            <div className="rounded-2xl bg-[#181C24] border border-white/8 p-3 shadow-lg flex flex-col lg:max-h-[calc(100vh-6rem)]">
              {/* Header — fixed at top */}
              <div className="flex items-center justify-between px-2 py-1.5 mb-2 border-b border-white/5 pb-2 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-text-muted">
                  <Star className="h-3.5 w-3.5 text-gold" /> Leagues
                </div>
                <span className="text-[10px] font-mono font-bold text-electric bg-electric/10 px-2 py-0.5 rounded border border-electric/20">
                  {matches.length} total
                </span>
              </div>

              {/* Scrollable leagues list — visible thin scrollbar */}
              <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto flex-1 min-h-0 pr-1 thin-scrollbar">
                <button
                  onClick={() => setSelectedLeague("All")}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition shrink-0 w-full ${
                    selectedLeague === "All"
                      ? "bg-[#00E676] text-black font-black shadow-md shadow-emerald-500/20"
                      : "text-text-secondary hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🔥</span>
                    <span>All Leagues</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-70 bg-white/10 px-1.5 py-0.5 rounded">{matches.length}</span>
                </button>

                {/* Pinned Ethiopian Premier League */}
                <button
                  onClick={() => setSelectedLeague("Ethiopian Premier League")}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition shrink-0 w-full ${
                    selectedLeague === "Ethiopian Premier League"
                      ? "bg-[#00E676] text-black font-black shadow-md shadow-emerald-500/20"
                      : "text-[#00E676] bg-[#00E676]/8 border border-[#00E676]/20 hover:bg-[#00E676]/15"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🇪🇹</span>
                    <span className="font-extrabold">Ethiopia Premier</span>
                  </span>
                  <span className="rounded bg-gold/90 px-1.5 py-0.5 text-[9px] text-black font-black uppercase">
                    HOT
                  </span>
                </button>

                {/* Separator */}
                <div className="hidden lg:block border-t border-white/5 my-1 shrink-0" />

                {leaguesList.map((league) => {
                  const matchCount = leagueMatchCounts.get(league) || 0;
                  return (
                    <button
                      key={league}
                      onClick={() => setSelectedLeague(league)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition shrink-0 w-full ${
                        selectedLeague === league
                          ? "bg-[#00E676] text-black font-black shadow-md shadow-emerald-500/20"
                          : "text-text-secondary hover:bg-white/6 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate pr-1">
                        <span>{LEAGUE_ICONS[league] || "⚽"}</span>
                        <span className="truncate">{league}</span>
                      </span>
                      {matchCount > 0 && (
                        <span className="text-[10px] font-mono opacity-70 bg-white/10 px-1.5 py-0.5 rounded shrink-0">
                          {matchCount}
                        </span>
                      )}
                    </button>
                  );
                })}
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
                {featuredMatches.slice(0, 15).map((m) => (
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
              <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-cyan-400" />
                24/7 Virtual Games Lobby
              </h3>
            </div>
            <Link
              href="/virtual-games"
              className="rounded-xl bg-cyan-500/20 text-cyan-400 px-4 py-2 text-xs font-black hover:bg-cyan-500/30 transition flex items-center gap-1 border border-cyan-500/30"
            >
              Explore All 20 Virtuals <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: "v-football-league",
                name: "Virtual Football League",
                desc: "AI-simulated 90m matches in 75s with 3D highlights",
                category: "Football",
                badge: "POPULAR",
                badgeColor: "bg-cyan-400 text-black",
                coverImage: "/images/virtuals/v-football-league.png",
                href: "/virtual-games",
                multi: "3D MATCHES",
              },
              {
                id: "v-champions-cup",
                name: "Virtual Champions Cup",
                desc: "Knockout stage tournament mode with instant payouts",
                category: "Tournament",
                badge: "NEW",
                badgeColor: "bg-gold text-black",
                coverImage: "/images/virtuals/v-champions-cup.png",
                href: "/virtual-games",
                multi: "KNOCKOUT",
              },
              {
                id: "v-penalty-shootout",
                name: "Penalty Shootout 1v1",
                desc: "Pick target corners & score against AI goalkeeper",
                category: "Instant",
                badge: "HOT",
                badgeColor: "bg-[#00E676] text-black",
                coverImage: "/images/virtuals/v-penalty-shootout.png",
                href: "/virtual-games",
                multi: "50x WIN",
              },
              {
                id: "v-rocket-crash",
                name: "Rocket Crash",
                desc: "Watch multiplier rise & cash out before detonation!",
                category: "Crash",
                badge: "1000x MULTI",
                badgeColor: "bg-rose-500 text-white",
                coverImage: "/images/virtuals/v-rocket-crash.png",
                href: "/virtual-games",
                multi: "HIGH MULTI",
              },
              {
                id: "v-horse-racing",
                name: "Virtual Horse Racing",
                desc: "Photorealistic 3D track sprint & win/place betting",
                category: "Racing",
                badge: "3D TRACK",
                badgeColor: "bg-purple-500 text-white",
                coverImage: "/images/virtuals/v-horse-racing.png",
                href: "/virtual-games",
                multi: "24/7 STREAM",
              },
              {
                id: "v-spin-wheel",
                name: "Fortune Spin Wheel",
                desc: "Spin instant lucky wheel for up to 500x multipliers",
                category: "Instant",
                badge: "INSTANT WIN",
                badgeColor: "bg-amber-400 text-black",
                coverImage: "/images/virtuals/v-spin-wheel.png",
                href: "/virtual-games",
                multi: "500x BONUS",
              },
            ].map((vGame) => (
              <Link
                key={vGame.id}
                href={vGame.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#181C24] border border-white/10 hover:border-cyan-400/50 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10"
              >
                {/* Cover Image Container */}
                <div className="relative h-40 w-full overflow-hidden bg-black/40">
                  <img
                    src={vGame.coverImage}
                    alt={vGame.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181C24] via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="rounded-lg bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                      {vGame.category}
                    </span>
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md ${vGame.badgeColor}`}>
                      {vGame.badge}
                    </span>
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="flex items-center gap-1.5 bg-cyan-400 text-black font-black px-4 py-2 rounded-xl text-xs shadow-lg shadow-cyan-400/30 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Play className="h-3.5 w-3.5 fill-current" /> Play Virtual
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                        {vGame.name}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20 shrink-0">
                        {vGame.multi}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {vGame.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-black text-cyan-400">
                    <span className="text-[10px] text-text-muted font-normal">24/7 Instant Rounds</span>
                    <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Play Now <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. Casino & Slots Preview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="rounded bg-purple-500/20 text-purple-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border border-purple-500/30">
                SLOTS & LIVE DEALERS
              </span>
              <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                <Dice5 className="h-5 w-5 text-purple-400" />
                Casino & Slots Spotlight
              </h3>
            </div>
            <Link href="/games" className="rounded-xl bg-purple-500/20 text-purple-400 px-4 py-2 text-xs font-black hover:bg-purple-500/30 transition flex items-center gap-1 border border-purple-500/30">
              View All Games <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Aviator Crash Game",
                subtitle: "Fly high & cash out before plane explodes!",
                icon: Flame,
                href: "/games/aviator",
                coverImage: "/images/aviator.png",
                badge: "HOT 100x",
                badgeColor: "bg-[#00E676] text-black font-black",
                provider: "Spribe",
                category: "CRASH",
                multi: "100x MULTI",
              },
              {
                title: "Gates of Olympus",
                subtitle: "Zeus lightning multiplier drops up to 5,000x",
                icon: Sparkles,
                href: "/games/gates-of-olympus",
                coverImage: "/images/gates_of_olympus.png",
                badge: "5000x MAX",
                badgeColor: "bg-gold text-black font-black",
                provider: "Pragmatic Play",
                category: "SLOTS",
                multi: "5,000x MAX",
              },
              {
                title: "Sweet Bonanza",
                subtitle: "Tumbling candy reels with 100x bomb multipliers",
                icon: Sparkles,
                href: "/games/sweet-bonanza",
                coverImage: "/images/sweet_bonanza.png",
                badge: "POPULAR",
                badgeColor: "bg-pink-500 text-white font-black",
                provider: "Pragmatic Play",
                category: "SLOTS",
                multi: "TUMBLE WINS",
              },
              {
                title: "Fast Keno & Lucky Numbers",
                subtitle: "Instant number draws with payouts up to 10,000x",
                icon: Dice5,
                href: "/games/keno",
                coverImage: "/images/fast_keno.png",
                badge: "10,000x WIN",
                badgeColor: "bg-purple-500 text-white font-black",
                provider: "Tipplay Originals",
                category: "NUMBERS",
                multi: "10,000x TOP",
              },
              {
                title: "Live VIP Roulette",
                subtitle: "Real-time HD dealers, European & Lightning rules",
                icon: Dice5,
                href: "/games",
                coverImage: "/images/live_roulette.png",
                badge: "LIVE DEALER",
                badgeColor: "bg-red-500 text-white font-black",
                provider: "Evolution Live",
                category: "LIVE CASINO",
                multi: "HD STREAM",
              },
              {
                title: "Sugar Rush & Vegas Slots",
                subtitle: "Sticky multiplier spots on 7x7 tumbling slot grid",
                icon: Sparkles,
                href: "/games/sugar-rush",
                coverImage: "/images/sugar_rush.svg",
                badge: "DEMO AVAILABLE",
                badgeColor: "bg-cyan-400 text-black font-black",
                provider: "Pragmatic Play",
                category: "SLOTS",
                multi: "128x MULTI",
              },
            ].map((casino) => {
              const Icon = casino.icon;
              return (
                <Link
                  key={casino.title}
                  href={casino.href}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#181C24] border border-white/10 hover:border-purple-400/50 transition-all duration-300 shadow-xl hover:shadow-purple-500/10"
                >
                  {/* Cover Image Container */}
                  <div className="relative h-44 w-full overflow-hidden bg-black/40">
                    <img
                      src={casino.coverImage}
                      alt={casino.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181C24] via-transparent to-black/40" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="rounded-lg bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                        {casino.category}
                      </span>
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md ${casino.badgeColor}`}>
                        {casino.badge}
                      </span>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="flex items-center gap-1.5 bg-[#00E676] text-black font-black px-4 py-2 rounded-xl text-xs shadow-lg shadow-emerald-500/30 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Play className="h-3.5 w-3.5 fill-current" /> Play Now
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                          {casino.title}
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 shrink-0">
                          {casino.multi}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {casino.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-black text-purple-400">
                      <span className="text-[10px] text-text-muted font-normal">{casino.provider}</span>
                      <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform text-electric">
                        Enter Game <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
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
