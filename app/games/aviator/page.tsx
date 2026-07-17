"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plane } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function AviatorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [stake, setStake] = useState(50);
  const [roundId, setRoundId] = useState("");
  const [multiplier, setMultiplier] = useState(1);
  const [crashed, setCrashed] = useState(false);
  const [hasBet, setHasBet] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; crashPoint: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Fetch current round
  const fetchRound = useCallback(() => {
    fetch("/api/games/aviator")
      .then((r) => r.json())
      .then((d) => {
        setRoundId(d.roundId);
        setMultiplier(d.currentMultiplier);
        setCrashed(d.crashed);
        if (d.history) setHistory(d.history);
        if (!d.crashed) startTimeRef.current = new Date(d.startedAt).getTime();
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchRound(); }, [fetchRound]);

  // Poll for updates when round is active
  useEffect(() => {
    if (crashed || !hasBet) return;
    const id = setInterval(fetchRound, 500);
    return () => clearInterval(id);
  }, [crashed, hasBet, fetchRound]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = "#0b1f3a";
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Curve
      ctx.strokeStyle = crashed ? "#e11d2e" : "#0066ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, h - 40);

      const points = Math.min(200, Math.floor((multiplier - 1) * 60));
      for (let i = 0; i <= points; i++) {
        const progress = i / 200;
        const x = 40 + progress * (w - 80);
        const yVal = h - 40 - Math.pow(progress, 1.5) * (h - 80);
        ctx.lineTo(x, yVal);
      }
      ctx.stroke();

      // Plane emoji at end of curve
      const endX = 40 + (points / 200) * (w - 80);
      const endY = h - 40 - Math.pow(points / 200, 1.5) * (h - 80);
      ctx.font = "24px serif";
      ctx.fillText("✈️", endX - 12, endY - 5);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [multiplier, crashed]);

  const placeBet = async () => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/games/aviator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundId, stake, action: "bet" }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error); return; }
      setHasBet(true);
      setMessage(data.message);
    } catch { setMessage("Network error"); }
    finally { setLoading(false); }
  };

  const cashOut = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/games/aviator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundId, action: "cashout" }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      setHasBet(false);
    } catch { setMessage("Network error"); }
    finally { setLoading(false); }
  };

  const newRound = () => {
    setCrashed(false);
    setHasBet(false);
    setMessage("");
    setMultiplier(1);
    fetchRound();
  };

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <Plane className="h-8 w-8 text-electric" />
            <h1 className="text-3xl font-black text-navy">{t("games.aviator")}</h1>
          </div>

          {/* Game canvas */}
          <div className="relative overflow-hidden rounded-xl">
            <canvas ref={canvasRef} width={800} height={400} className="w-full rounded-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="text-6xl font-black text-white drop-shadow-2xl"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {multiplier.toFixed(2)}x
                </div>
                {crashed && (
                  <div className="mt-2 text-lg font-black text-live">CRASHED!</div>
                )}
              </div>
            </div>
          </div>

          {/* History */}
          <div className="mt-3 no-scrollbar flex gap-2 overflow-x-auto">
            {history.map((h) => (
              <span
                key={h.id}
                className={`rounded-full px-3 py-1 text-xs font-black ${h.crashPoint >= 2 ? "bg-win/10 text-win" : "bg-live/10 text-live"}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {h.crashPoint.toFixed(2)}x
              </span>
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
              disabled={hasBet}
            />
            {crashed ? (
              <Button onClick={newRound}>{t("games.startRound")}</Button>
            ) : hasBet ? (
              <Button variant="danger" onClick={cashOut} disabled={loading}>
                {t("games.cashOut")} ({multiplier.toFixed(2)}x)
              </Button>
            ) : (
              <Button onClick={placeBet} disabled={loading}>
                {loading ? t("common.loading") : t("games.startRound")}
              </Button>
            )}
          </div>

          {message && (
            <div className="mt-3 rounded-xl bg-blue-tint p-4 font-black text-navy">{message}</div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
