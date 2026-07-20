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
        "flex min-h-12 items-center justify-between rounded-xl px-3 py-2 text-sm font-black transition-all duration-200",
        selected
          ? "bg-electric/15 text-electric ring-1 ring-electric/40 shadow-lg shadow-electric/10"
          : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary border border-white/6",
        flash === "up" && "!bg-neon-green/15 !text-neon-green",
        flash === "down" && "!bg-live/15 !text-live",
      )}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      <span className="truncate text-left">{odd.selection}</span>
      <span>{value.toFixed(2)}</span>
    </button>
  );
}
