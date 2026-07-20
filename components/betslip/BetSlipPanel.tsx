"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Zap } from "lucide-react";
import { useBetSlipStore } from "@/lib/store";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { clsx } from "clsx";

export function BetSlipPanel({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const { data: session } = useSession();
  const router = useRouter();
  const { slip, removeSelection, clearSlip } = useBetSlipStore();
  const [stake, setStake] = useState(100);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState(false);

  const duplicateMatch =
    slip.length > 1 && new Set(slip.map((s) => s.matchId)).size !== slip.length;
  const totalOdds = slip.reduce((p, s) => p * s.value, 1);
  const potential = Math.min(500000, Math.round(stake * totalOdds * 100) / 100);

  const handlePlaceBet = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stake,
          selections: slip.map((s) => ({
            oddsId: s.oddsId,
            matchId: s.matchId,
            marketName: s.marketName,
            selection: s.selection,
            value: s.value,
          })),
        }),
      });
      const data = await res.json();
      if (res.status === 409 && data.changed) {
        // Odds changed — update slip values
        for (const ch of data.changed) {
          useBetSlipStore.getState().updateOdds(ch.oddsId, ch.current);
        }
        setMessage(t("betslip.oddsChanged"));
        setMessageType("error");
      } else if (!res.ok) {
        setMessage(data.error || "Bet failed");
        setMessageType("error");
      } else {
        setMessage(`${t("betslip.placed")} Ticket: ${data.ticketId}`);
        setMessageType("success");
        clearSlip();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("walletBalanceUpdated", {
            detail: { balance: data?.balance ?? null, source: "bet-placement" },
          }));
        }
      }
    } catch {
      setMessage("Network error");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (compact && slip.length === 0) return null;

  return (
    <Card className={clsx("space-y-3", compact && "max-h-64 overflow-auto")} glow={slip.length > 0}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-text-primary">
          {t("betslip.title")} {slip.length > 0 && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-electric text-[10px] text-white">
              {slip.length}
            </span>
          )}
        </h2>
        {slip.length > 0 && (
          <button onClick={clearSlip} className="text-xs font-bold text-text-muted hover:text-live transition">
            {t("betslip.clear")}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 rounded-xl bg-white/5 p-1 text-xs font-black">
        {[t("betslip.single"), t("betslip.multi"), t("betslip.system")].map((tab, i) => (
          <span
            key={tab}
            className={clsx(
              "rounded-lg px-2 py-2 text-center transition",
              i === (slip.length > 1 ? 1 : 0)
                ? "bg-electric/15 text-electric"
                : "text-text-muted",
            )}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Selections */}
      {slip.length === 0 ? (
        <div className="rounded-xl bg-white/5 p-4 text-sm font-semibold text-text-muted">
          {t("betslip.empty")}
        </div>
      ) : (
        <div className="space-y-2">
          {slip.map((item) => (
            <div key={item.oddsId} className="rounded-xl border border-white/8 bg-white/3 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-black text-text-primary">{item.selection}</div>
                  <div className="text-xs font-semibold text-text-muted">
                    {item.homeTeam} vs {item.awayTeam}
                  </div>
                  <div className="text-xs text-text-dim">{item.marketName}</div>
                </div>
                <button
                  onClick={() => removeSelection(item.oddsId)}
                  className="text-xs font-black text-live hover:underline"
                >
                  {t("betslip.remove")}
                </button>
              </div>
              <div
                className="mt-2 text-sm font-black text-electric"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {item.value.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Correlated warning */}
      {duplicateMatch && (
        <div className="rounded-xl bg-live/10 p-3 text-sm font-bold text-live border border-live/20">
          {t("betslip.correlated")}
        </div>
      )}

      {/* Stake & calculations */}
      {slip.length > 0 && (
        <>
          <label className="block text-xs font-black uppercase text-text-muted">
            {t("betslip.stake")}
          </label>
          <input
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            type="number"
            min={10}
            max={10000}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 font-black text-text-primary outline-none transition focus:border-electric/40 focus:ring-2 focus:ring-electric/20"
            style={{ fontVariantNumeric: "tabular-nums" }}
          />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-text-muted">{t("betslip.totalOdds")}</div>
              <div className="font-black text-text-primary" style={{ fontVariantNumeric: "tabular-nums" }}>
                {totalOdds.toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl bg-neon-green/10 p-3">
              <div className="text-neon-green/70">{t("betslip.potential")}</div>
              <div className="font-black text-neon-green" style={{ fontVariantNumeric: "tabular-nums" }}>
                {potential.toLocaleString()} ETB
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            variant="gold"
            disabled={duplicateMatch || slip.length === 0 || loading}
            onClick={handlePlaceBet}
          >
            <Zap className="h-4 w-4" />
            {loading ? t("common.loading") : t("betslip.place")}
          </Button>
        </>
      )}

      {/* Message */}
      {message && (
        <div
          className={clsx(
            "rounded-xl p-3 text-sm font-bold border",
            messageType === "success" && "bg-neon-green/10 text-neon-green border-neon-green/20",
            messageType === "error" && "bg-live/10 text-live border-live/20",
            messageType === "info" && "bg-electric/10 text-electric border-electric/20",
          )}
        >
          {message}
        </div>
      )}
    </Card>
  );
}
