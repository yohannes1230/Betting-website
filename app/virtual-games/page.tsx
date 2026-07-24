"use client";

import React, { useState } from "react";
import { Shell } from "@/components/Shell";
import { VirtualGameLauncher, VirtualGameInfo } from "@/components/ui/VirtualGameLauncher";
import { Gamepad2, Search, Filter, Sparkles, Trophy, Flame } from "lucide-react";

export const VIRTUAL_GAMES_LIST: VirtualGameInfo[] = [
  {
    id: "v-football-league",
    name: "Virtual Football League",
    category: "Football",
    icon: "⚽",
    description: "Simulated 90-minute league matches compressed into 75-second rounds with real-time commentary and 3D highlights.",
  },
  {
    id: "v-champions-cup",
    name: "Virtual Champions Cup",
    category: "Football",
    icon: "🏆",
    description: "World class knockout football tournament format with group stages, quarter-finals, and instant payouts.",
  },
  {
    id: "v-horse-racing",
    name: "Virtual Horse Racing",
    category: "Racing",
    icon: "🐎",
    description: "Photorealistic 3D horse race simulation with win/place/show markets and dynamic track conditions.",
  },
  {
    id: "v-greyhound-racing",
    name: "Virtual Greyhound Racing",
    category: "Racing",
    icon: "🐕",
    description: "Rapid 6-dog track sprint every 60 seconds with live photo-finish camera angles.",
  },
  {
    id: "v-basketball",
    name: "Virtual Basketball",
    category: "Sports",
    icon: "🏀",
    description: "High-scoring 4-quarter basketball matchup simulation with point spreads and total over/under lines.",
  },
  {
    id: "v-tennis-open",
    name: "Virtual Tennis Open",
    category: "Sports",
    icon: "🎾",
    description: "Head-to-head tennis match game with set betting, game handicap, and tie-break simulation.",
  },
  {
    id: "v-motor-racing",
    name: "Virtual Motor Racing",
    category: "Racing",
    icon: "🏎️",
    description: "High-octane motor speedway racing featuring lap telemetry and podium betting markets.",
  },
  {
    id: "v-cycling",
    name: "Virtual Cycling",
    category: "Racing",
    icon: "🚴",
    description: "Indoor velodrome track sprint simulation with sprint finish photo verification.",
  },
  {
    id: "v-keno",
    name: "Fast Keno Draw",
    category: "Numbers",
    icon: "🎱",
    description: "80-ball quick draw Keno game. Pick 1 to 10 numbers and win up to 10,000x your stake.",
  },
  {
    id: "v-rocket-crash",
    name: "Rocket Crash",
    category: "Crash",
    icon: "🚀",
    description: "Real-time rising multiplier crash game. Watch the rocket ascend and cash out before it explodes!",
  },
  {
    id: "v-plinko",
    name: "Plinko Drop",
    category: "Instant",
    icon: "⚪",
    description: "Drop the ball through the pin pyramid and hit high multiplier outcome slots at the bottom.",
  },
  {
    id: "v-mines",
    name: "Mines Grid",
    category: "Instant",
    icon: "💣",
    description: "Uncover safe tiles on a 5x5 grid while avoiding hidden mines. Cash out after every step!",
  },
  {
    id: "v-dice",
    name: "Dice Roll",
    category: "Instant",
    icon: "🎲",
    description: "Set your risk ratio and roll under or over target thresholds with instant settlement.",
  },
  {
    id: "v-spin-wheel",
    name: "Wheel of Fortune",
    category: "Instant",
    icon: "🎡",
    description: "Spin the giant multi-colored wheel for instant multipliers, bonus rounds, and jackpot prizes.",
  },
  {
    id: "v-lottery",
    name: "Virtual Lottery Draw",
    category: "Numbers",
    icon: "🎟️",
    description: "Continuous 3-minute lottery draw with straight, box, and combo prize distributions.",
  },
  {
    id: "v-scratch-cards",
    name: "Instant Scratch Cards",
    category: "Instant",
    icon: "🏷️",
    description: "Scratch and reveal 3 matching symbols for instant cash payouts up to 5,000x.",
  },
  {
    id: "v-hilo",
    name: "HiLo Card Game",
    category: "Cards",
    icon: "🃏",
    description: "Predict whether the next card will be Higher or Lower than the current card to build streak multipliers.",
  },
  {
    id: "v-coin-flip",
    name: "Coin Flip Streak",
    category: "Instant",
    icon: "🪙",
    description: "Heads or Tails? Flip the golden coin and double your stake on consecutive wins.",
  },
  {
    id: "v-penalty-shootout",
    name: "Penalty Shootout",
    category: "Football",
    icon: "🥅",
    description: "Step up to the penalty spot! Choose your corner, beat the keeper, and score consecutive goals.",
  },
  {
    id: "v-combat-sim",
    name: "Virtual Boxing / Combat",
    category: "Sports",
    icon: "🥊",
    description: "Round-by-round virtual combat simulation with KO, decision, and round betting markets.",
  },
];

export default function VirtualGamesPage() {
  const [selectedGame, setSelectedGame] = useState<VirtualGameInfo | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Football", "Racing", "Sports", "Crash", "Instant", "Numbers", "Cards"];

  const filteredGames = VIRTUAL_GAMES_LIST.filter((game) => {
    const matchesCategory = activeCategory === "All" || game.category === activeCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-6 space-y-6">
        {/* Header Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/60 via-[#181C24] to-[#0B0E11] border border-cyan-500/20 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400 text-black px-3 py-1 text-[10px] font-black uppercase tracking-wider">
              <Gamepad2 className="h-3.5 w-3.5" /> 24/7 VIRTUAL SPORTS & INSTANT GAMES
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white mt-3 leading-tight">
              Virtual Games <span className="bg-gradient-to-r from-cyan-400 to-[#00E676] bg-clip-text text-transparent">Lobby</span>
            </h1>
            <p className="mt-3 text-xs sm:text-sm font-semibold text-text-secondary">
              Choose from 20 simulated virtual sports leagues, instant draws, crash multipliers, and mini-games running continuous rounds every minute.
            </p>
          </div>
        </div>

        {/* Category Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Horizontal Filter Chips */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-black transition shrink-0 ${
                  activeCategory === cat
                    ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/30"
                    : "bg-[#181C24] text-text-secondary border border-white/8 hover:border-white/20 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 bg-[#181C24] rounded-xl px-3.5 py-2 border border-white/10 w-full sm:w-64">
            <Search className="h-4 w-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search virtual game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-text-muted focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Virtual Games 20 Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="group rounded-2xl bg-[#181C24] border border-white/8 p-5 shadow-xl hover:border-cyan-400/40 hover:shadow-2xl transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-2xl group-hover:scale-110 transition">
                    {game.icon}
                  </div>
                  <span className="rounded bg-cyan-400/10 text-cyan-400 px-2 py-0.5 text-[9px] font-black uppercase">
                    {game.category}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-black text-white group-hover:text-cyan-400 transition">
                  {game.name}
                </h3>
                <p className="mt-1 text-xs text-text-muted line-clamp-2 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-muted">Instant Play</span>
                <button
                  onClick={() => setSelectedGame(game)}
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-black text-black shadow-md hover:bg-cyan-300 transition"
                >
                  Play Game
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Launcher Modal */}
        <VirtualGameLauncher game={selectedGame} onClose={() => setSelectedGame(null)} />
      </div>
    </Shell>
  );
}
