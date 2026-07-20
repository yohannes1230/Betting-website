"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plane, Zap } from "lucide-react";
import { motion } from "framer-motion";
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

  // Enhanced canvas animation with dark theme
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Star field
    const stars: Array<{ x: number; y: number; r: number; a: number }> = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark background with gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "#050a18");
      bgGrad.addColorStop(1, "#0a0e1a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw stars
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.a})`;
        ctx.fill();
      });

      // Grid lines (subtle)
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      // Determine curve color based on multiplier
      let curveColor: string;
      if (crashed) {
        curveColor = "#ef4444";
      } else if (multiplier >= 5) {
        curveColor = "#fbbf24"; // gold
      } else if (multiplier >= 2) {
        curveColor = "#22c55e"; // green
      } else {
        curveColor = "#00d4ff"; // electric blue
      }

      // Draw curve with gradient trail
      const points = Math.min(200, Math.floor((multiplier - 1) * 60));
      
      // Glow trail
      ctx.shadowBlur = 15;
      ctx.shadowColor = curveColor;
      ctx.strokeStyle = curveColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, h - 40);

      for (let i = 0; i <= points; i++) {
        const progress = i / 200;
        const x = 40 + progress * (w - 80);
        const yVal = h - 40 - Math.pow(progress, 1.5) * (h - 80);
        ctx.lineTo(x, yVal);
      }
      ctx.stroke();

      // Filled area under curve (subtle)
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(40, h - 40);
      for (let i = 0; i <= points; i++) {
        const progress = i / 200;
        const x = 40 + progress * (w - 80);
        const yVal = h - 40 - Math.pow(progress, 1.5) * (h - 80);
        ctx.lineTo(x, yVal);
      }
      const lastX = 40 + (points / 200) * (w - 80);
      ctx.lineTo(lastX, h - 40);
      ctx.closePath();
      const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
      fillGrad.addColorStop(0, curveColor + "15");
      fillGrad.addColorStop(1, curveColor + "02");
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Plane at end of curve
      const endX = 40 + (points / 200) * (w - 80);
      const endY = h - 40 - Math.pow(points / 200, 1.5) * (h - 80);
      
      // Plane glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = curveColor;
      ctx.font = "28px serif";
      ctx.fillText("✈️", endX - 14, endY - 5);
      ctx.shadowBlur = 0;

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

  // Multiplier color class
  const multiplierColor = crashed
    ? "text-live"
    : multiplier >= 5
    ? "text-gold"
    : multiplier >= 2
    ? "text-neon-green"
    : "text-electric";

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Card glow>
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/10">
              <Plane className="h-6 w-6 text-electric animate-plane-fly" />
            </div>
            <h1 className="text-2xl font-black text-text-primary md:text-3xl">
              {t("games.aviator")}
            </h1>
          </div>

          {/* Game canvas */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5">
            <canvas ref={canvasRef} width={800} height={400} className="w-full rounded-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  className={`text-6xl font-black drop-shadow-2xl tabular ${multiplierColor}`}
                  key={multiplier.toFixed(2)}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {multiplier.toFixed(2)}x
                </motion.div>
                {crashed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 rounded-full bg-live/20 px-4 py-1 text-lg font-black text-live"
                  >
                    💥 CRASHED!
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* History pills */}
          <div className="mt-4 no-scrollbar flex gap-2 overflow-x-auto">
            {history.map((h, i) => (
              <motion.span
                key={h.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-black tabular ${
                  h.crashPoint >= 2
                    ? "bg-neon-green/10 text-neon-green ring-1 ring-neon-green/20"
                    : "bg-live/10 text-live ring-1 ring-live/20"
                }`}
              >
                {h.crashPoint.toFixed(2)}x
              </motion.span>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-5 flex flex-wrap gap-3">
            <input
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              type="number"
              min={10}
              className="min-h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-black text-text-primary outline-none transition focus:border-electric/40 focus:ring-2 focus:ring-electric/20 tabular"
              disabled={hasBet}
            />
            {crashed ? (
              <Button onClick={newRound} variant="gold">
                <Zap className="h-4 w-4" />
                {t("games.startRound")}
              </Button>
            ) : hasBet ? (
              <Button variant="danger" onClick={cashOut} disabled={loading}>
                {t("games.cashOut")} ({multiplier.toFixed(2)}x)
              </Button>
            ) : (
              <Button onClick={placeBet} disabled={loading} variant="gold">
                <Plane className="h-4 w-4" />
                {loading ? t("common.loading") : t("games.startRound")}
              </Button>
            )}
          </div>

          {/* Message */}
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
