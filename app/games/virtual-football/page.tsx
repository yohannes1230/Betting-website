"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { clsx } from "clsx";

type MatchData = {
  id: string; homeTeam: string; awayTeam: string; status: string;
  homeOdds: number; drawOdds: number; awayOdds: number; overOdds: number; underOdds: number;
  homeScore?: number; awayScore?: number; events?: string[];
};

export default function VirtualFootballPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [stake, setStake] = useState(50);
  const [selection, setSelection] = useState<string>("home");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ticker, setTicker] = useState<string[]>([]);
  const [displayScore, setDisplayScore] = useState("0 - 0");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetch("/api/games/virtual-football")
      .then((r) => r.json())
      .then((d) => setMatch(d))
      .catch(() => {});
  }, []);

  const play = async () => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (!match) return;
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/games/virtual-football", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id, selection, stake }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error); setLoading(false); return; }

      // Animate the match over ~12 seconds
      setPlaying(true);
      setLoading(false);
      const events = data.events || [];
      const finalScore = `${data.homeScore} - ${data.awayScore}`;

      let eventIndex = 0;
      const interval = setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          if (next > 90) {
            clearInterval(interval);
            setPlaying(false);
            setDisplayScore(finalScore);
            setMessage(data.message);
            // Fetch new match
            setTimeout(() => {
              fetch("/api/games/virtual-football").then((r) => r.json()).then((d) => setMatch(d));
            }, 3000);
            return 90;
          }
          // Show events at appropriate times
          if (eventIndex < events.length) {
            setTicker((t) => [...t, events[eventIndex]]);
            eventIndex++;
          }
          return next;
        });
      }, 130); // 90 "minutes" in ~12 seconds

    } catch {
      setMessage("Network error");
      setLoading(false);
    }
  };

  if (!match) return <Shell><div className="mx-auto max-w-5xl px-4 py-10 text-center font-bold text-muted">Loading match...</div></Shell>;

  const markets = [
    { key: "home", label: `Home ${match.homeOdds.toFixed(2)}`, odds: match.homeOdds },
    { key: "draw", label: `Draw ${match.drawOdds.toFixed(2)}`, odds: match.drawOdds },
    { key: "away", label: `Away ${match.awayOdds.toFixed(2)}`, odds: match.awayOdds },
    { key: "over", label: `Over 2.5 ${match.overOdds.toFixed(2)}`, odds: match.overOdds },
    { key: "under", label: `Under 2.5 ${match.underOdds.toFixed(2)}`, odds: match.underOdds },
  ];

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-electric" />
            <h1 className="text-3xl font-black text-navy">{t("games.virtualFootball")}</h1>
          </div>

          {/* Scoreboard */}
          <div className="rounded-xl bg-navy p-8 text-center text-white">
            <div className="text-sm font-bold text-white/60">
              {match.homeTeam} vs {match.awayTeam}
            </div>
            <div className="mt-4 text-6xl font-black" style={{ fontVariantNumeric: "tabular-nums" }}>
              {displayScore}
            </div>
            {playing && (
              <div className="mt-2 text-sm font-bold text-electric-hover">
                {elapsed}&apos; {elapsed < 45 ? "1st Half" : elapsed < 90 ? "2nd Half" : "Full Time"}
              </div>
            )}
          </div>

          {/* Ticker */}
          {ticker.length > 0 && (
            <div className="mt-3 max-h-40 overflow-y-auto space-y-1">
              {ticker.map((event, i) => (
                <div key={i} className="rounded-lg bg-light-grey px-3 py-2 text-sm font-bold text-muted">
                  {event}
                </div>
              ))}
            </div>
          )}

          {/* Markets */}
          <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-5">
            {markets.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelection(m.key)}
                className={clsx(
                  "rounded-full p-3 text-center text-sm font-black transition",
                  selection === m.key
                    ? "bg-electric text-white shadow-md"
                    : "bg-blue-tint text-navy hover:bg-electric/10",
                )}
                style={{ fontVariantNumeric: "tabular-nums" }}
                disabled={playing}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap gap-3">
            <input
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              type="number"
              min={10}
              className="min-h-11 flex-1 rounded-xl border border-blue-tint px-3 py-2 font-black outline-none focus:ring-2 focus:ring-electric"
              style={{ fontVariantNumeric: "tabular-nums" }}
              disabled={playing}
            />
            <Button onClick={play} disabled={loading || playing}>
              {loading ? t("common.loading") : t("games.playMatch")}
            </Button>
          </div>

          {message && (
            <div className="mt-3 rounded-xl bg-blue-tint p-4 font-black text-navy">{message}</div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
