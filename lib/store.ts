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
      // True toggle: if the exact same oddsId is already selected, remove it (deselect)
      const alreadySelected = state.slip.some((s) => s.oddsId === item.oddsId);
      if (alreadySelected) {
        return { slip: state.slip.filter((s) => s.oddsId !== item.oddsId) };
      }
      // Replace any existing selection on the same match + same market (e.g. swap Home→Away)
      const filtered = state.slip.filter(
        (s) => !(s.matchId === item.matchId && s.marketName === item.marketName),
      );
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
