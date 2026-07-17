"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { Card, LiveBadge, SkeletonRow } from "@/components/ui";
import { BetSlipPanel } from "@/components/betslip/BetSlipPanel";
import { OddsButton } from "@/components/sportsbook/OddsButton";
import { useI18n } from "@/lib/i18n";

type OddsData = { id: string; matchId: string; marketName: string; selection: string; value: string };
type EventData = { id: string; minute: number; type: string; description: string };
type MatchData = {
  id: string; league: string; homeTeam: string; awayTeam: string; isLive: boolean;
  minute?: number; homeScore?: number; awayScore?: number; startTime: string;
  odds: OddsData[]; events: EventData[];
};

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatch = useCallback(() => {
    fetch(`/api/matches/${id}`)
      .then((r) => r.json())
      .then((data) => { setMatch(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchMatch(); }, [fetchMatch]);

  // Live polling
  useEffect(() => {
    if (!match?.isLive) return;
    const interval = setInterval(fetchMatch, 4000);
    return () => clearInterval(interval);
  }, [match?.isLive, fetchMatch]);

  if (loading) return <Shell><div className="mx-auto max-w-7xl px-4 py-6"><SkeletonRow rows={6} /></div></Shell>;
  if (!match) return <Shell><div className="mx-auto max-w-7xl px-4 py-10 text-center font-bold text-muted">Match not found</div></Shell>;

  const marketGroups = [...new Set(match.odds.map((o) => o.marketName))];

  return (
    <Shell>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Match header */}
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              {match.isLive && <LiveBadge />}
              <span className="font-bold text-muted">{match.league}</span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-navy">
              {match.homeTeam} vs {match.awayTeam}
            </h1>
            <div className="mt-1 font-bold text-muted">
              {match.isLive
                ? `${match.minute}' — Score: ${match.homeScore ?? 0}-${match.awayScore ?? 0}`
                : new Date(match.startTime).toLocaleString()}
            </div>
          </Card>

          {/* Markets */}
          {marketGroups.map((group) => (
            <Card key={group}>
              <h2 className="mb-3 font-black text-navy">{group}</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {match.odds
                  .filter((o) => o.marketName === group)
                  .map((odd) => (
                    <OddsButton key={odd.id} odd={odd} match={match} />
                  ))}
              </div>
            </Card>
          ))}

          {/* Live event timeline */}
          {match.events.length > 0 && (
            <Card>
              <h2 className="font-black text-navy">{t("sports.timeline")}</h2>
              <div className="mt-3 space-y-2">
                {match.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-3 rounded-xl bg-light-grey p-3 text-sm"
                  >
                    <span className="min-w-10 font-black text-electric" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {event.minute}&apos;
                    </span>
                    <span className="font-bold text-muted">{event.description}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Link href="/sports" className="inline-block text-sm font-bold text-electric hover:underline">
            ← {t("common.back")} to Sportsbook
          </Link>
        </div>

        <aside className="hidden lg:block">
          <BetSlipPanel />
        </aside>
      </div>
    </Shell>
  );
}
