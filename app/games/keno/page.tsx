"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dice5 } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { clsx } from "clsx";

export default function KenoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [picked, setPicked] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [stake, setStake] = useState(50);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawId, setDrawId] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Fetch current draw
  useEffect(() => {
    fetch("/api/games/keno")
      .then((r) => r.json())
      .then((d) => {
        setDrawId(d.drawId);
        if (d.closesAt) {
          const remaining = Math.max(0, Math.floor((new Date(d.closesAt).getTime() - Date.now()) / 1000));
          setCountdown(remaining);
        }
      })
      .catch(() => {});
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const toggleNumber = (n: number) => {
    setPicked((p) => p.includes(n) ? p.filter((x) => x !== n) : p.length < 10 ? [...p, n] : p);
  };

  const play = async () => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/games/keno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawId, picks: picked, stake }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error); return; }
      setDrawn(data.drawnNumbers);
      setMessage(data.message);
      // Fetch new draw
      setTimeout(() => {
        fetch("/api/games/keno").then((r) => r.json()).then((d) => {
          setDrawId(d.drawId);
          setCountdown(75);
        });
      }, 3000);
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <Dice5 className="h-8 w-8 text-electric" />
            <h1 className="text-3xl font-black text-navy">{t("games.keno")}</h1>
            {countdown > 0 && (
              <span className="ml-auto rounded-full bg-electric px-3 py-1 text-sm font-black text-white">
                {countdown}s
              </span>
            )}
          </div>

          {/* Number grid */}
          <div className="grid grid-cols-8 gap-2 md:grid-cols-10">
            {Array.from({ length: 80 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => toggleNumber(n)}
                className={clsx(
                  "aspect-square rounded-xl text-sm font-black transition",
                  picked.includes(n)
                    ? "bg-electric text-white shadow-md"
                    : drawn.includes(n)
                    ? picked.includes(n)
                      ? "bg-win text-white ring-2 ring-win"
                      : "bg-win/20 text-win"
                    : "bg-blue-tint text-navy hover:bg-electric/10",
                )}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <input
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              type="number"
              min={10}
              className="min-h-11 flex-1 rounded-xl border border-blue-tint px-3 py-2 font-black outline-none focus:ring-2 focus:ring-electric"
              style={{ fontVariantNumeric: "tabular-nums" }}
            />
            <Button onClick={play} disabled={loading || picked.length === 0}>
              {loading ? t("common.loading") : t("games.startDraw")}
            </Button>
          </div>

          <p className="mt-3 text-sm font-bold text-muted">
            {t("games.pickNumbers")} Selected: {picked.length}/10
          </p>

          {message && (
            <div className="mt-3 rounded-xl bg-blue-tint p-4 font-black text-navy">{message}</div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
