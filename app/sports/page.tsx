"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Button, Card, LiveBadge, SkeletonRow } from "@/components/ui";
import { BetSlipPanel } from "@/components/betslip/BetSlipPanel";
import { OddsButton } from "@/components/sportsbook/OddsButton";
import { useI18n } from "@/lib/i18n";

type OddsData = { id: string; matchId: string; marketName: string; selection: string; value: string };
type MatchData = {
  id: string; league: string; homeTeam: string; awayTeam: string; isLive: boolean;
  minute?: number; homeScore?: number; awayScore?: number; startTime: string; status: string;
  odds: OddsData[];
  events: Array<{ id: string; minute: number; type: string; description: string }>;
};

const LEAGUES = ["Ethiopian Premier League", "English Premier League", "La Liga", "CAF Champions League", "Serie A"];

function SportsContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const leagueFilter = searchParams.get("league");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"prematch" | "live">("prematch");

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
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* League chips */}
          <div className="no-scrollbar flex flex-wrap items-center gap-2 overflow-x-auto">
            <Link
              className={`rounded-full px-4 py-2 text-sm font-black transition ${!leagueFilter ? "bg-navy text-white" : "bg-white text-navy shadow-sm hover:bg-blue-tint"}`}
              href="/sports"
            >
              {t("sports.all")}
            </Link>
            {LEAGUES.map((league) => (
              <Link
                key={league}
                href={`/sports?league=${encodeURIComponent(league)}`}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${leagueFilter === league ? "bg-navy text-white" : "bg-white text-navy shadow-sm hover:bg-blue-tint"}`}
              >
                {league}
              </Link>
            ))}
          </div>

          {/* Pre-match / Live tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-2 text-center text-sm font-black shadow-sm md:w-80">
            <button
              onClick={() => setTab("prematch")}
              className={`rounded-lg py-2 transition ${tab === "prematch" ? "bg-electric text-white" : "bg-light-grey text-navy hover:bg-blue-tint"}`}
            >
              {t("sports.prematch")}
            </button>
            <button
              onClick={() => setTab("live")}
              className={`rounded-lg py-2 transition ${tab === "live" ? "bg-live text-white" : "bg-light-grey text-navy hover:bg-blue-tint"}`}
            >
              {t("sports.liveNow")}
            </button>
          </div>

          {/* Match list */}
          {loading ? (
            <SkeletonRow rows={5} />
          ) : filtered.length === 0 ? (
            <Card>
              <p className="py-8 text-center text-sm font-semibold text-muted">
                {tab === "live" ? t("sports.noLive") : "No matches found for this filter."}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((match) => (
                <Card key={match.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted">
                        <span>{match.league}</span>
                        {match.isLive ? (
                          <LiveBadge />
                        ) : (
                          <span className="rounded-full bg-light-grey px-2 py-1">
                            {new Date(match.startTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/sports/match/${match.id}`}
                        className="mt-2 block text-base font-black text-navy hover:text-electric"
                      >
                        {match.homeTeam} vs {match.awayTeam}
                      </Link>
                      <div className="mt-1 text-sm font-semibold text-muted">
                        {match.isLive
                          ? `${match.minute}' — ${match.homeScore ?? 0}-${match.awayScore ?? 0}`
                          : "Pre-match markets open"}
                      </div>
                    </div>
                    <Link
                      href={`/sports/match/${match.id}`}
                      className="rounded-full bg-light-grey p-2 transition hover:bg-blue-tint"
                    >
                      <span className="text-xs font-bold text-electric">
                        +{match.odds.length} {t("sports.markets")}
                      </span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {match.odds
                      .filter((o) => o.marketName === "Match Result")
                      .slice(0, 3)
                      .map((odd) => (
                        <OddsButton key={odd.id} odd={odd} match={match} />
                      ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Desktop bet slip */}
        <aside className="hidden lg:block">
          <BetSlipPanel />
        </aside>
      </div>

      {/* Mobile bet slip */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white p-3 shadow-2xl lg:hidden">
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
