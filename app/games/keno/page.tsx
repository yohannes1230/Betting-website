"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/Shell";
import { useI18n } from "@/lib/i18n";
import { clsx } from "clsx";
import { Play, RotateCcw, Check, BarChart2 } from "lucide-react";

type Tab = "GAME" | "HISTORY" | "RESULTS" | "STATISTICS";

// Mock history for visual demonstration matching the screenshot
const MOCK_HISTORY = [
  { id: "6***5", picks: [78, 8, 18], stake: 160, status: "Waiting" },
  { id: "6***5", picks: [9, 19, 79], stake: 160, status: "Waiting" },
  { id: "6***5", picks: [80, 10, 20], stake: 160, status: "Waiting" },
  { id: "6***f", picks: [7, 12, 37], stake: 100, status: "Waiting" },
];

export default function FastKenoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();

  const [picked, setPicked] = useState<number[]>([]);
  const [stake, setStake] = useState(2);
  const [countdown, setCountdown] = useState(60);
  const [activeTab, setActiveTab] = useState<Tab>("GAME");
  const [loading, setLoading] = useState(false);

  // Countdown timer loop
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => (c <= 0 ? 60 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const toggleNumber = (n: number) => {
    setPicked((p) =>
      p.includes(n) ? p.filter((x) => x !== n) : p.length < 10 ? [...p, n] : p
    );
  };

  const handleBet = async () => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (picked.length === 0) return;
    setLoading(true);
    // Simulate network request
    setTimeout(() => {
      setLoading(false);
      setPicked([]);
      setActiveTab("HISTORY");
    }, 800);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#1A212A] text-white font-sans selection:bg-[#4CAF50]/30 pb-24">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#11161C] border-b border-white/5 shadow-md">
        <div className="flex items-center gap-2">
          <div className="leading-none text-[#4CAF50] font-black italic text-xl tracking-tighter">
            <span className="text-white">FAST</span><br/>KENO
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-black/40 rounded-full px-3 py-1 text-sm font-bold text-amber-500 border border-white/10">
            0 ETB
          </div>
          <div className="bg-black/40 rounded-full px-3 py-1 text-xs font-medium text-white/70 flex items-center gap-1.5 border border-white/10">
            ID: 884537067 <div className="w-4 h-4 rounded-full bg-[#4CAF50] flex items-center justify-center text-black"><Check className="w-3 h-3" /></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto relative pt-4 px-2">
        {/* Timer */}
        <div className="text-center mb-4">
          <div className="inline-block relative">
            <div className="text-2xl font-mono font-black text-[#4CAF50] drop-shadow-[0_0_8px_rgba(76,175,80,0.8)] tabular-nums tracking-widest">
              {formatTime(countdown)}
            </div>
            {/* Subtle glow behind timer */}
            <div className="absolute inset-0 bg-[#4CAF50] blur-xl opacity-20 z-[-1]" />
          </div>
        </div>

        {/* Info Box */}
        {activeTab === "GAME" && (
          <div className="bg-[#242D38] rounded-2xl p-4 mb-4 relative overflow-hidden flex items-center justify-between border border-white/5 shadow-lg">
            <div className="relative z-10 flex items-center gap-4">
               {/* Decorative lottery balls */}
               <div className="relative w-16 h-16 shrink-0">
                 <div className="absolute top-2 left-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] flex items-center justify-center text-black font-black text-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.5)]">
                   1
                 </div>
                 <div className="absolute -top-2 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-black text-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.5)]">
                   10
                 </div>
                 <div className="absolute top-1 -right-4 w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white/80 font-black text-xs shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)]">
                   80
                 </div>
               </div>
               <div>
                 <h2 className="text-xl font-bold text-white tracking-tight">Choose 10 numbers</h2>
                 <p className="text-[#4CAF50] font-medium text-sm mt-0.5">From 1 to 80</p>
               </div>
            </div>
            <button className="w-6 h-6 rounded-full border border-[#4CAF50] text-[#4CAF50] flex items-center justify-center text-xs font-bold hover:bg-[#4CAF50] hover:text-black transition">
              ?
            </button>
            <div className="absolute inset-0 border-[40px] border-white/[0.02] rounded-full blur-3xl translate-x-1/2" />
          </div>
        )}

        {/* Content Area */}
        <div className="mb-24">
          {activeTab === "GAME" ? (
            <div className="grid grid-cols-10 gap-[1px] bg-[#11161C] border border-[#11161C] p-[1px] rounded-lg overflow-hidden shadow-2xl">
              {Array.from({ length: 80 }, (_, i) => i + 1).map((n) => {
                const isPicked = picked.includes(n);
                // Just for visual flair matching the screenshot, some dots
                const hasBlueDot = [3, 25, 32, 75, 79].includes(n);
                const hasRedDot = [17, 26, 39, 54, 78].includes(n);

                return (
                  <button
                    key={n}
                    onClick={() => toggleNumber(n)}
                    className={clsx(
                      "relative aspect-square flex items-center justify-center text-xs md:text-sm font-black transition-all",
                      isPicked
                        ? "bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] text-black z-10 scale-105 shadow-[0_0_10px_rgba(76,175,80,0.5)]"
                        : "bg-[#2A3441] text-white/80 hover:bg-[#344050]"
                    )}
                  >
                    {n}
                    {!isPicked && hasBlueDot && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#2196F3] rounded-full shadow-[0_0_4px_#2196F3]" />}
                    {!isPicked && hasRedDot && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#F44336] rounded-full shadow-[0_0_4px_#F44336]" />}
                  </button>
                );
              })}
            </div>
          ) : activeTab === "HISTORY" ? (
             <div className="space-y-2">
               {/* Sub-tabs for History */}
               <div className="flex items-center justify-between text-xs font-medium text-white/50 px-2 pb-2">
                  <span className="text-white">All 829</span>
                  <span>My Tickets 0</span>
                  <span>My Bets 0</span>
               </div>
               
               {MOCK_HISTORY.map((item, i) => (
                 <div key={i} className="bg-[#242D38] rounded-xl p-3 border border-white/5">
                   <div className="text-[#4CAF50] font-bold text-xs mb-2">{item.id}</div>
                   <div className="flex gap-1 mb-3">
                     {item.picks.map(p => (
                       <div key={p} className="w-8 h-8 rounded-lg bg-[#344050] flex items-center justify-center text-sm font-bold shadow-inner">
                         {p}
                       </div>
                     ))}
                     {/* Empty slots to show 10 spots */}
                     {Array.from({length: 10 - item.picks.length}).map((_, j) => (
                        <div key={`empty-${j}`} className="w-8 h-8 rounded-lg bg-[#1A212A] border border-white/5 shadow-inner" />
                     ))}
                   </div>
                   <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                     <span className="text-white/60 font-medium">Bet {item.stake}</span>
                     <span className="text-amber-400 font-bold">{item.status}</span>
                   </div>
                 </div>
               ))}
             </div>
          ) : (
            <div className="text-center py-12 text-white/50 font-medium">
              {activeTab} data not available in demo.
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Controls */}
      <div className="fixed bottom-0 inset-x-0 bg-[#1A212A] border-t border-white/10 p-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50">
        <div className="max-w-md mx-auto">
          {/* Tabs */}
          <div className="flex items-center justify-between px-2 mb-3">
            {(["GAME", "HISTORY", "RESULTS", "STATISTICS"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={clsx(
                  "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors pb-1 border-b-2",
                  activeTab === t ? "text-[#4CAF50] border-[#4CAF50]" : "text-white/50 border-transparent hover:text-white"
                )}
              >
                {t === "GAME" && <Play className="w-3.5 h-3.5" />}
                {t === "HISTORY" && <RotateCcw className="w-3.5 h-3.5" />}
                {t === "RESULTS" && <Check className="w-3.5 h-3.5" />}
                {t === "STATISTICS" && <BarChart2 className="w-3.5 h-3.5" />}
                {t}
              </button>
            ))}
          </div>

          {/* Bet Controls (Only show on GAME tab) */}
          {activeTab === "GAME" && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="flex-1 bg-[#242D38] rounded-xl flex items-center justify-between p-1 border border-white/5">
                  <button onClick={() => setStake(Math.max(1, stake - 1))} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition text-xl font-bold">
                    -
                  </button>
                  <div className="font-black text-xl">{stake}</div>
                  <button onClick={() => setStake(stake + 1)} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition text-xl font-bold">
                    +
                  </button>
                </div>
                <button onClick={() => setStake(stake * 2)} className="w-16 rounded-xl bg-[#242D38] border border-white/5 text-[#4CAF50] font-black hover:bg-white/5 transition">
                  X2
                </button>
                <button onClick={() => setStake(100)} className="w-16 rounded-xl bg-[#242D38] border border-white/5 text-[#4CAF50] font-black hover:bg-white/5 transition">
                  MAX
                </button>
              </div>

              <button 
                onClick={handleBet}
                disabled={picked.length === 0 || loading}
                className="w-full bg-[#388E3C] hover:bg-[#4CAF50] disabled:bg-[#1B431D] disabled:text-white/30 text-white text-xl font-black rounded-xl py-3.5 shadow-[0_4px_15px_rgba(76,175,80,0.3)] transition transform active:scale-[0.98]"
              >
                {loading ? "PROCESSING..." : "BET"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
