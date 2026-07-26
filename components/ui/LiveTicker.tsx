"use client";

import React from "react";
import Link from "next/link";
import { Activity, Flame, ChevronRight } from "lucide-react";
import { useBetSlipStore } from "@/lib/store";

export type LiveTickerMatch = {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  isLive: boolean;
  odds: Array<{ id: string; marketName: string; selection: string; value: number }>;
};

interface LiveTickerProps {
  matches: LiveTickerMatch[];
  loading?: boolean;
}

export function LiveTicker({ matches, loading }: LiveTickerProps) {
  const { slip, addSelection, removeSelection } = useBetSlipStore();

  if (loading) {
    return (
      <div className="flex items-center gap-3 overflow-hidden py-2 px-1">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-16 w-64 shrink-0 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-live animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-live" />
            Live Now Ticker
          </span>
        </div>
        <Link href="/sports?live=true" className="text-xs font-bold text-electric hover:underline flex items-center gap-0.5">
          View All Live <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 pt-1">
        {matches.map((m) => {
          const mainOdds = m.odds.filter((o) => o.marketName === "Match Result").slice(0, 3);

          return (
            <div
              key={m.id}
              className="shrink-0 w-72 rounded-2xl bg-[#181C24] border border-white/8 p-3 shadow-lg hover:border-electric/30 transition"
            >
              {/* Header: League & Minute */}
              <div className="flex items-center justify-between text-[10px] font-bold text-text-muted mb-2">
                <span className="truncate max-w-[170px] text-electric">{m.league}</span>
                <span className="flex items-center gap-1 text-live font-black bg-live/10 px-1.5 py-0.5 rounded">
                  <Flame className="h-3 w-3" /> {m.minute ?? 45}'
                </span>
              </div>

              {/* Teams & Scores */}
              <Link href={`/sports/match/${m.id}`} className="block group">
                <div className="flex items-center justify-between text-xs font-black text-white group-hover:text-electric transition">
                  <span className="truncate">{m.homeTeam}</span>
                  <span className="text-gold tabular font-mono">{m.homeScore ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-black text-white mt-1 group-hover:text-electric transition">
                  <span className="truncate">{m.awayTeam}</span>
                  <span className="text-gold tabular font-mono">{m.awayScore ?? 0}</span>
                </div>
              </Link>

              {/* Quick Odds Buttons */}
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {mainOdds.map((o) => {
                  const isSelected = slip.some((s) => s.oddsId === o.id);

                  const handleSelect = (e: React.MouseEvent) => {
                    e.preventDefault();
                    // Toggle: addSelection now handles deselect internally
                    addSelection({
                      oddsId: o.id,
                      matchId: m.id,
                      marketName: o.marketName,
                      selection: o.selection,
                      value: o.value,
                      homeTeam: m.homeTeam,
                      awayTeam: m.awayTeam,
                      league: m.league,
                    });
                  };

                  return (
                    <button
                      key={o.id}
                      onClick={handleSelect}
                      className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-black transition ${
                        isSelected
                          ? "bg-electric text-black shadow-md shadow-electric/30 scale-105"
                          : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="text-[10px] text-text-muted">{o.selection}</span>
                      <span className="font-mono text-electric group-hover:text-white tabular">
                        {Number(o.value).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
