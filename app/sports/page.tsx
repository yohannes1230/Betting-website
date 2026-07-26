"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Card, LiveBadge, SkeletonRow, TeamLogo } from "@/components/ui";
import { BetSlipPanel } from "@/components/betslip/BetSlipPanel";
import { OddsButton } from "@/components/sportsbook/OddsButton";
import { useI18n } from "@/lib/i18n";
import { Trophy, ChevronRight, Check } from "lucide-react";
import type { Sport } from "@/lib/the-odds-api";

type OddsData = { id: string; matchId: string; marketName: string; selection: string; value: string };
type MatchData = {
  id: string; league: string; homeTeam: string; awayTeam: string; isLive: boolean;
  minute?: number; homeScore?: number; awayScore?: number; startTime: string; status: string;
  odds: OddsData[];
  events: Array<{ id: string; minute: number; type: string; description: string }>;
};

const LEAGUE_ICONS: Record<string, string> = {
  "Ethiopia": "🇪🇹",
  "EPL": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "English Premier": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "La Liga": "🇪🇸",
  "Serie A": "🇮🇹",
  "Bundesliga": "🇩🇪",
  "Ligue 1": "🇫🇷",
  "MLS": "🇺🇸",
  "Champions League": "🌍",
};

function getLeagueIcon(title: string) {
  for (const [key, icon] of Object.entries(LEAGUE_ICONS)) {
    if (title.includes(key)) return icon;
  }
  return "⚽";
}

function SportsContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const leagueFilter = searchParams.get("league");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("Soccer");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"prematch" | "live">("prematch");

  useEffect(() => {
    fetch("/api/sports")
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setSports(arr);
        if (arr.length > 0 && !arr.some(s => s.group === selectedGroup)) {
          setSelectedGroup(arr[0].group);
        }
      })
      .catch(console.error);
  }, []);

  const groups = Array.from(new Set(sports.map(s => s.group))).sort();
  const activeSports = sports.filter(s => s.group === selectedGroup);

  const fetchMatches = useCallback(() => {
    const params = new URLSearchParams();
    if (leagueFilter) params.set("league", leagueFilter);
    fetch(`/api/matches?${params}`)
      .then((r) => r.json())
      .then((data) => { setMatches(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [leagueFilter]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  // Live odds polling — nudge every 4 seconds
  useEffect(() => {
    const id = setInterval(fetchMatches, 4000);
    return () => clearInterval(id);
  }, [fetchMatches]);

  const filtered = matches.filter((m) =>
    tab === "live" ? m.isLive : !m.isLive,
  );

  return (
    <>
      <div className="mx-auto grid max-w-[1400px] gap-4 px-4 py-5 lg:grid-cols-[240px_1fr_320px]">
        {/* Left Sidebar - Navigation (Desktop only, mobile will use chips) */}
        <aside className="hidden lg:flex flex-col gap-4 sticky top-20 max-h-[calc(100vh-6rem)]">
          <Card className="p-3">
            <h3 className="mb-2 px-3 text-xs font-black uppercase text-text-muted">Sports</h3>
            <div className="flex flex-col gap-1 mb-4 border-b border-white/5 pb-2">
              {groups.map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition text-left ${
                    selectedGroup === group
                      ? "bg-white/10 text-white"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                  }`}
                >
                  <span className="flex-1 truncate">{group}</span>
                </button>
              ))}
            </div>

            <h3 className="mb-2 px-3 text-xs font-black uppercase text-text-muted">Leagues</h3>
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[400px] no-scrollbar">
              <Link
                href="/sports"
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                  !leagueFilter
                    ? "bg-electric text-white shadow-md shadow-electric/20"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs">⚽</div>
                <span className="flex-1 truncate">{t("sports.all")}</span>
                {!leagueFilter && <Check className="h-4 w-4" />}
              </Link>
              {activeSports.map((sport) => (
                <Link
                  key={sport.key}
                  href={`/sports?league=${encodeURIComponent(sport.key)}`}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                    leagueFilter === sport.key
                      ? "bg-electric text-white shadow-md shadow-electric/20"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                  }`}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs">
                    {getLeagueIcon(sport.title)}
                  </div>
                  <span className="flex-1 truncate" title={sport.title}>{sport.title}</span>
                  {leagueFilter === sport.key && <Check className="h-4 w-4" />}
                </Link>
              ))}
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-gold/20 to-bg-card border-gold/10 flex flex-col items-center justify-center text-center">
            <Trophy className="h-8 w-8 text-gold mb-2" />
            <h4 className="font-black text-text-primary">Tournament</h4>
            <p className="text-xs text-text-muted mt-1">Join the weekly leaderboard!</p>
          </Card>
        </aside>

        {/* Center Content */}
        <div className="space-y-4">
          {/* Mobile Sport Category Chips */}
          <div className="no-scrollbar flex flex-wrap items-center gap-2 overflow-x-auto lg:hidden">
            {groups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-black transition whitespace-nowrap ${
                  selectedGroup === group
                    ? "bg-white/10 text-white"
                    : "bg-bg-card text-text-secondary border border-white/6 hover:bg-bg-card-hover hover:text-text-primary"
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Mobile League Chips (hidden on desktop) */}
          <div className="no-scrollbar flex flex-wrap items-center gap-2 overflow-x-auto lg:hidden">
            <Link
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                !leagueFilter
                  ? "bg-electric text-white shadow-lg shadow-electric/20"
                  : "bg-bg-card text-text-secondary border border-white/6 hover:bg-bg-card-hover hover:text-text-primary"
              }`}
              href="/sports"
            >
              ⚽ {t("sports.all")}
            </Link>
            {activeSports.map((sport) => (
              <Link
                key={sport.key}
                href={`/sports?league=${encodeURIComponent(sport.key)}`}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-black transition whitespace-nowrap ${
                  leagueFilter === sport.key
                    ? "bg-electric text-white shadow-lg shadow-electric/20"
                    : "bg-bg-card text-text-secondary border border-white/6 hover:bg-bg-card-hover hover:text-text-primary"
                }`}
              >
                <span>{getLeagueIcon(sport.title)}</span>
                {sport.title}
              </Link>
            ))}
          </div>

          {/* Pre-match / Live tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-4">
            <button
              onClick={() => setTab("prematch")}
              className={`rounded-full px-6 py-2 text-sm font-black transition ${
                tab === "prematch"
                  ? "bg-white text-bg-deep"
                  : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary"
              }`}
            >
              {t("sports.prematch")}
            </button>
            <button
              onClick={() => setTab("live")}
              className={`rounded-full px-6 py-2 text-sm font-black transition ${
                tab === "live"
                  ? "bg-live text-white shadow-lg shadow-live/20"
                  : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
                </span>
                {t("sports.liveNow")}
              </span>
            </button>
          </div>

          {/* Match list */}
          {loading ? (
            <SkeletonRow rows={5} />
          ) : filtered.length === 0 ? (
            <Card>
              <p className="py-8 text-center text-sm font-semibold text-text-muted">
                {tab === "live" ? t("sports.noLive") : "No matches found for this filter."}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((match, i) => {
                const matchOdds = match.odds.filter((o) => o.marketName === "Match Result").slice(0, 3);
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Card className="flex flex-col gap-3 p-3 sm:p-4 transition-all hover:bg-white/5 border-l-4 border-l-transparent hover:border-l-electric" glow={match.isLive}>
                      {/* Left: Match Info */}
                      <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-center gap-2 w-10 shrink-0">
                          <TeamLogo name={match.homeTeam} size="sm" />
                          <TeamLogo name={match.awayTeam} size="sm" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-text-muted mb-1">
                            <span className="flex items-center gap-1 text-electric truncate">
                              <span>{getLeagueIcon(match.league)}</span>
                              {match.league}
                            </span>
                            <span className="text-white/20">•</span>
                            {match.isLive ? (
                              <LiveBadge />
                            ) : (
                              <span className="text-text-dim">
                                {new Date(match.startTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          <Link href={`/sports/match/${match.id}`} className="group block">
                            <div className="flex items-center justify-between text-sm md:text-base font-black text-text-primary group-hover:text-electric transition">
                              <span>{match.homeTeam}</span>
                              {match.isLive && <span className="text-gold tabular">{match.homeScore ?? 0}</span>}
                            </div>
                            <div className="flex items-center justify-between text-sm md:text-base font-black text-text-primary mt-1 group-hover:text-electric transition">
                              <span>{match.awayTeam}</span>
                              {match.isLive && <span className="text-gold tabular">{match.awayScore ?? 0}</span>}
                            </div>
                          </Link>
                          {match.isLive && (
                            <div className="mt-1 text-xs font-semibold text-live">
                              {match.minute}'
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Odds */}
                      <div className="flex items-center gap-2">
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 flex-1 lg:flex-none">
                          {matchOdds.map((odd) => (
                            <div key={odd.id} className="min-w-0">
                              <OddsButton odd={odd} match={match} />
                            </div>
                          ))}
                        </div>
                        <Link
                          href={`/sports/match/${match.id}`}
                          className="hidden lg:flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-white/5 transition hover:bg-white/10 shrink-0"
                          title={`+${match.odds.length} markets`}
                        >
                          <ChevronRight className="h-4 w-4 text-text-muted" />
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop bet slip */}
        <aside className="hidden lg:block relative">
          <div className="sticky top-[88px]">
            <BetSlipPanel />
          </div>
        </aside>
      </div>

      {/* Mobile bet slip — positioned above the bottom nav bar */}
      <div className="fixed inset-x-0 bottom-[4.5rem] z-30 border-t border-white/5 bg-bg-card/95 backdrop-blur-lg p-3 shadow-2xl lg:hidden">
        <BetSlipPanel compact />
      </div>
    </>
  );
}

export default function SportsPage() {
  return (
    <Shell>
      <Suspense fallback={<div className="p-8"><SkeletonRow rows={5} /></div>}>
        <SportsContent />
      </Suspense>
    </Shell>
  );
}
