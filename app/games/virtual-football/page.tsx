"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trophy, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Button, Card, TeamLogo } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { clsx } from "clsx";

type MatchData = {
  id: string; homeTeam: string; awayTeam: string; status: string;
  homeOdds: number; drawOdds: number; awayOdds: number; overOdds: number; underOdds: number;
  homeScore?: number; awayScore?: number; events?: string[];
};

/* Event icon mapping */
function eventIcon(event: string): string {
  if (event.toLowerCase().includes("goal")) return "⚽";
  if (event.toLowerCase().includes("yellow")) return "🟨";
  if (event.toLowerCase().includes("red")) return "🟥";
  if (event.toLowerCase().includes("corner")) return "🚩";
  if (event.toLowerCase().includes("foul")) return "⚠️";
  if (event.toLowerCase().includes("substitut")) return "🔄";
  return "📋";
}

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
  const [scoreFlash, setScoreFlash] = useState(false);

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
    setTicker([]);
    setDisplayScore("0 - 0");
    setElapsed(0);

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
            setTimeout(() => {
              fetch("/api/games/virtual-football").then((r) => r.json()).then((d) => setMatch(d));
            }, 3000);
            return 90;
          }
          // Show events at appropriate times
          if (eventIndex < events.length) {
            setTicker((t) => [...t, events[eventIndex]]);
            // Flash score on goals
            if (events[eventIndex]?.toLowerCase().includes("goal")) {
              setScoreFlash(true);
              setTimeout(() => setScoreFlash(false), 800);
            }
            eventIndex++;
          }
          return next;
        });
      }, 130);

    } catch {
      setMessage("Network error");
      setLoading(false);
    }
  };

  if (!match) {
    return (
      <Shell>
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <Trophy className="mx-auto h-12 w-12 text-electric animate-bounce-ball" />
          <div className="mt-4 font-bold text-text-muted">{t("common.loading")}</div>
        </div>
      </Shell>
    );
  }

  const markets = [
    { key: "home", label: `Home`, odds: match.homeOdds },
    { key: "draw", label: `Draw`, odds: match.drawOdds },
    { key: "away", label: `Away`, odds: match.awayOdds },
    { key: "over", label: `O 2.5`, odds: match.overOdds },
    { key: "under", label: `U 2.5`, odds: match.underOdds },
  ];

  const progressPercent = Math.min(100, (elapsed / 90) * 100);

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Card glow>
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-green/10">
              <Trophy className="h-6 w-6 text-neon-green animate-bounce-ball" />
            </div>
            <h1 className="text-2xl font-black text-text-primary md:text-3xl">
              {t("games.virtualFootball")}
            </h1>
          </div>

          {/* ──── Scoreboard ──── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bg-deep via-bg-surface to-bg-deep p-6 md:p-10">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/4 top-0 h-40 w-40 rounded-full bg-electric/5 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-neon-green/5 blur-3xl" />
            </div>

            <div className="relative flex items-center justify-center gap-6 md:gap-12">
              {/* Home team */}
              <div className="flex flex-col items-center gap-2">
                <TeamLogo name={match.homeTeam} size="lg" />
                <span className="max-w-20 text-center text-xs font-bold text-text-secondary truncate">
                  {match.homeTeam}
                </span>
              </div>

              {/* Score */}
              <div className="text-center">
                <motion.div
                  className={clsx(
                    "text-5xl font-black tabular md:text-7xl",
                    scoreFlash ? "text-gold animate-score-pop" : "text-text-primary",
                  )}
                  key={displayScore + (scoreFlash ? "-flash" : "")}
                >
                  {displayScore}
                </motion.div>
                {playing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm font-bold text-electric"
                  >
                    {elapsed}&apos; {elapsed < 45 ? "1st Half" : elapsed < 90 ? "2nd Half" : "Full Time"}
                  </motion.div>
                )}
              </div>

              {/* Away team */}
              <div className="flex flex-col items-center gap-2">
                <TeamLogo name={match.awayTeam} size="lg" />
                <span className="max-w-20 text-center text-xs font-bold text-text-secondary truncate">
                  {match.awayTeam}
                </span>
              </div>
            </div>

            {/* ── Match progress bar ── */}
            {playing && (
              <div className="relative mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-electric to-neon-green"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.13 }}
                />
              </div>
            )}
          </div>

          {/* ──── Event ticker ──── */}
          <AnimatePresence>
            {ticker.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-4 max-h-40 space-y-1.5 overflow-y-auto"
              >
                {ticker.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-bold text-text-secondary"
                  >
                    <span className="text-base">{eventIcon(event)}</span>
                    {event}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──── Markets ──── */}
          <div className="mt-5 grid grid-cols-3 gap-2 md:grid-cols-5">
            {markets.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelection(m.key)}
                className={clsx(
                  "rounded-xl p-3 text-center transition-all duration-200",
                  selection === m.key
                    ? "bg-electric/15 text-electric ring-1 ring-electric/40 shadow-lg shadow-electric/10"
                    : "bg-white/5 text-text-secondary hover:bg-white/8 hover:text-text-primary",
                )}
                style={{ fontVariantNumeric: "tabular-nums" }}
                disabled={playing}
              >
                <div className="text-xs font-medium">{m.label}</div>
                <div className="mt-1 text-lg font-black">{m.odds.toFixed(2)}</div>
              </button>
            ))}
          </div>

          {/* ──── Controls ──── */}
          <div className="mt-5 flex flex-wrap gap-3">
            <input
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              type="number"
              min={10}
              className="min-h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-black text-text-primary outline-none transition focus:border-electric/40 focus:ring-2 focus:ring-electric/20 tabular"
              disabled={playing}
            />
            <Button onClick={play} disabled={loading || playing} variant="gold">
              <Zap className="h-4 w-4" />
              {loading ? t("common.loading") : t("games.playMatch")}
            </Button>
          </div>

          {/* ──── Message ──── */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl bg-electric/10 p-4 font-black text-electric border border-electric/20"
            >
              {message}
            </motion.div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
