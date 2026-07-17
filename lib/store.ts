"use client";

import { create } from "zustand";

export type SlipItem = {
  oddsId: string;
  matchId: string;
  marketName: string;
  selection: string;
  value: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
};

type BetSlipStore = {
  slip: SlipItem[];
  addSelection: (item: SlipItem) => void;
  removeSelection: (oddsId: string) => void;
  clearSlip: () => void;
  updateOdds: (oddsId: string, newValue: number) => void;
};

export const useBetSlipStore = create<BetSlipStore>((set) => ({
  slip: [],
  addSelection: (item) =>
    set((state) => {
      // Remove same odds ID if already present (toggle behavior)
      const filtered = state.slip.filter((s) => s.oddsId !== item.oddsId);
      return { slip: [...filtered, item] };
    }),
  removeSelection: (oddsId) =>
    set((state) => ({ slip: state.slip.filter((s) => s.oddsId !== oddsId) })),
  clearSlip: () => set({ slip: [] }),
  updateOdds: (oddsId, newValue) =>
    set((state) => ({
      slip: state.slip.map((s) =>
        s.oddsId === oddsId ? { ...s, value: newValue } : s,
      ),
    })),
}));
