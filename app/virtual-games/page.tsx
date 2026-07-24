"use client";

import React, { useState } from "react";
import { Shell } from "@/components/Shell";
import { VirtualGameLauncher, VirtualGameInfo } from "@/components/ui/VirtualGameLauncher";
import { Gamepad2, Search, Zap, Play, Sparkles, Trophy, Flame } from "lucide-react";

export const VIRTUAL_GAMES_LIST: VirtualGameInfo[] = [
  {
    id: "v-football-league",
    name: "Virtual Football League",
    category: "Football",
    icon: "⚽",
    description: "Simulated 90-minute league matches compressed into 75-second rounds with real-time commentary and 3D highlights.",
    coverImage: "/images/virtuals/v-football-league.png",
  },
  {
    id: "v-champions-cup",
    name: "Virtual Champions Cup",
    category: "Football",
    icon: "🏆",
    description: "World class knockout football tournament format with group stages, quarter-finals, and instant payouts.",
    coverImage: "/images/virtuals/v-champions-cup.png",
  },
  {
    id: "v-horse-racing",
    name: "Virtual Horse Racing",
    category: "Racing",
    icon: "🐎",
    description: "Photorealistic 3D horse race simulation with win/place/show markets and dynamic track conditions.",
    coverImage: "/images/virtuals/v-horse-racing.png",
  },
  {
    id: "v-greyhound-racing",
    name: "Virtual Greyhound Racing",
    category: "Racing",
    icon: "🐕",
    description: "Rapid 6-dog track sprint every 60 seconds with live photo-finish camera angles.",
    coverImage: "/images/virtuals/v-horse-racing.png",
  },
  {
    id: "v-basketball",
    name: "Virtual Basketball",
    category: "Sports",
    icon: "🏀",
    description: "High-scoring 4-quarter basketball matchup simulation with point spreads and total over/under lines.",
    coverImage: "/images/virtual_football.png",
  },
  {
    id: "v-tennis-open",
    name: "Virtual Tennis Open",
    category: "Sports",
    icon: "🎾",
    description: "Head-to-head tennis match game with set betting, game handicap, and tie-break simulation.",
    coverImage: "/images/virtual_football.png",
  },
  {
    id: "v-motor-racing",
    name: "Virtual Motor Racing",
    category: "Racing",
    icon: "🏎️",
    description: "High-octane motor speedway racing featuring lap telemetry and podium betting markets.",
    coverImage: "/images/virtuals/v-horse-racing.png",
  },
  {
    id: "v-cycling",
    name: "Virtual Cycling",
    category: "Racing",
    icon: "🚴",
    description: "Indoor velodrome track sprint simulation with sprint finish photo verification.",
    coverImage: "/images/virtuals/v-horse-racing.png",
  },
  {
    id: "v-keno",
    name: "Fast Keno Draw",
    category: "Numbers",
    icon: "🎱",
    description: "80-ball quick draw Keno game. Pick 1 to 10 numbers and win up to 10,000x your stake.",
    coverImage: "/images/fast_keno.png",
  },
  {
    id: "v-rocket-crash",
    name: "Rocket Crash",
    category: "Crash",
    icon: "🚀",
    description: "Real-time rising multiplier crash game. Watch the rocket ascend and cash out before it explodes!",
    coverImage: "/images/virtuals/v-rocket-crash.png",
  },
  {
    id: "v-plinko",
    name: "Plinko Drop",
    category: "Instant",
    icon: "⚪",
    description: "Drop the ball through the pin pyramid and hit high multiplier outcome slots at the bottom.",
    coverImage: "/images/virtuals/v-plinko.png",
  },
  {
    id: "v-mines",
    name: "Mines Grid",
    category: "Instant",
    icon: "💣",
    description: "Uncover safe tiles on a 5x5 grid while avoiding hidden mines. Cash out after every step!",
    coverImage: "/images/virtuals/v-rocket-crash.png",
  },
  {
    id: "v-dice",
    name: "Dice Roll",
    category: "Instant",
    icon: "🎲",
    description: "Set your risk ratio and roll under or over target thresholds with instant settlement.",
    coverImage: "/images/fast_keno.png",
  },
  {
    id: "v-spin-wheel",
    name: "Wheel of Fortune",
    category: "Instant",
    icon: "🎡",
    description: "Spin the giant multi-colored wheel for instant multipliers, bonus rounds, and jackpot prizes.",
    coverImage: "/images/virtuals/v-spin-wheel.png",
  },
  {
    id: "v-lottery",
    name: "Virtual Lottery Draw",
    category: "Numbers",
    icon: "🎟️",
    description: "Continuous 3-minute lottery draw with straight, box, and combo prize distributions.",
    coverImage: "/images/fast_keno.png",
  },
  {
    id: "v-scratch-cards",
    name: "Instant Scratch Cards",
    category: "Instant",
    icon: "🏷️",
    description: "Scratch and reveal 3 matching symbols for instant cash payouts up to 5,000x.",
    coverImage: "/images/slots.png",
  },
  {
    id: "v-hilo",
    name: "HiLo Card Game",
    category: "Cards",
    icon: "🃏",
    description: "Predict whether the next card will be Higher or Lower than the current card to build streak multipliers.",
    coverImage: "/images/slots.png",
  },
  {
    id: "v-coin-flip",
    name: "Coin Flip Streak",
    category: "Instant",
    icon: "🪙",
    description: "Heads or Tails? Flip the golden coin and double your stake on consecutive wins.",
    coverImage: "/images/slots.png",
  },
  {
    id: "v-penalty-shootout",
    name: "Penalty Shootout",
    category: "Football",
    icon: "⚽",
    description: "Step up to the penalty spot! Choose your corner, beat the keeper, and score consecutive goals.",
    coverImage: "/images/virtuals/v-penalty-shootout.png",
  },
  {
    id: "v-combat-sim",
    name: "Virtual Boxing / Combat",
    category: "Sports",
    icon: "🥊",
    description: "Round-by-round virtual combat simulation with KO, decision, and round betting markets.",
    coverImage: "/images/virtuals/v-combat-sim.png",
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
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/70 via-[#181C24] to-[#0B0E11] border border-cyan-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400 text-black px-3.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-cyan-400/20">
              <Gamepad2 className="h-3.5 w-3.5" /> 24/7 VIRTUAL SPORTS & INSTANT GAMES
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white mt-3 leading-tight tracking-tight">
              Virtual Games <span className="bg-gradient-to-r from-cyan-400 via-[#00E676] to-gold bg-clip-text text-transparent">Lobby</span>
            </h1>
            <p className="mt-3 text-xs sm:text-sm font-semibold text-text-secondary leading-relaxed">
              Explore 20 vibrant virtual games with 3D graphic simulations, instant multiplier payouts, and round draws every 60 seconds.
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
                    ? "bg-gradient-to-r from-cyan-400 to-[#00E676] text-black shadow-lg shadow-cyan-400/30"
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

        {/* Virtual Games 20 Grid with Attractive Covers */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className="group cursor-pointer rounded-2xl bg-[#181C24] border border-white/10 overflow-hidden shadow-xl hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/10 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Cover Image Container */}
              <div className="relative h-44 w-full overflow-hidden bg-black/40">
                {game.coverImage ? (
                  <img
                    src={game.coverImage}
                    alt={game.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl bg-gradient-to-br from-cyan-950 to-[#181C24]">
                    {game.icon}
                  </div>
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#181C24] via-black/20 to-transparent" />

                {/* Category Badge & Icon */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="rounded-full bg-black/60 backdrop-blur-md text-cyan-400 border border-cyan-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    {game.category}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-lg border border-white/10">
                    {game.icon}
                  </div>
                </div>

                {/* Play Button Overlay on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                  <span className="flex items-center gap-2 rounded-full bg-[#00E676] text-black px-4 py-2 text-xs font-black shadow-xl shadow-[#00E676]/40 transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="h-4 w-4 fill-black" /> PLAY NOW
                  </span>
                </div>
              </div>

              {/* Game Info Body */}
              <div className="p-4 space-y-2">
                <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition">
                  {game.name}
                </h3>
                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed font-semibold">
                  {game.description}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <span className="text-[10px] font-bold text-electric flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Instant Play 24/7
                  </span>
                  <span className="text-xs font-black text-cyan-400 group-hover:underline">
                    Play Demo →
                  </span>
                </div>
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
