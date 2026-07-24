"use client";

import { useBetSlipStore, type SlipItem } from "@/lib/store";
import { clsx } from "clsx";
import { useState, useEffect, useRef } from "react";

type OddsButtonProps = {
  odd: { id: string; matchId: string; marketName: string; selection: string; value: string | number };
  match: { id: string; homeTeam: string; awayTeam: string; league: string };
};

export function OddsButton({ odd, match }: OddsButtonProps) {
  const { slip, addSelection, removeSelection } = useBetSlipStore();
  const selected = slip.some((s) => s.oddsId === odd.id);
  const value = typeof odd.value === "string" ? parseFloat(odd.value) : odd.value;

  // Flash animation on odds change
  const prevValue = useRef(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (prevValue.current !== value) {
      setFlash(value > prevValue.current ? "up" : "down");
      prevValue.current = value;
      const timer = setTimeout(() => setFlash(null), 400);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const handleClick = () => {
    if (selected) {
      removeSelection(odd.id);
    } else {
      const item: SlipItem = {
        oddsId: odd.id,
        matchId: match.id,
        marketName: odd.marketName,
        selection: odd.selection,
        value,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
      };
      addSelection(item);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "flex min-h-12 items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-black transition-all duration-150 transform active:scale-95",
        selected
          ? "bg-[#00E676] text-black shadow-lg shadow-electric/30 font-black scale-[1.02]"
          : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary border border-white/6",
        flash === "up" && "!bg-[#00E676]/30 !text-[#00E676] animate-pulse",
        flash === "down" && "!bg-live/30 !text-live animate-pulse",
      )}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      <span className="truncate text-left text-xs opacity-90">{odd.selection}</span>
      <span className="font-mono text-electric group-hover:text-white tabular font-extrabold">{value.toFixed(2)}</span>
    </button>
  );
}
