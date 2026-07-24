"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2, AlertCircle, ShieldCheck, Zap } from "lucide-react";
import { Button } from "./Button";

export type VirtualGameInfo = {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  providerPending?: boolean;
};

interface VirtualGameLauncherProps {
  game: VirtualGameInfo | null;
  onClose: () => void;
}

export function VirtualGameLauncher({ game, onClose }: VirtualGameLauncherProps) {
  if (!game) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl rounded-3xl bg-[#181C24] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-3xl border border-cyan-500/30">
              {game.icon}
            </div>
            <div>
              <span className="rounded bg-cyan-400/20 text-cyan-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                {game.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">{game.name}</h3>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm font-semibold text-text-secondary leading-relaxed">
            {game.description}
          </p>

          {/* Provider Integration Pending Notice Container */}
          <div className="mt-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-2 text-amber-200">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-amber-400">
              <AlertCircle className="h-4 w-4" />
              Provider SDK Integration Pending
            </div>
            <p className="text-xs font-medium leading-relaxed">
              This virtual game slot is scaffolded and ready. To go live in production, drop your licensed Virtual/RNG Provider SDK or iframe (e.g. Golden Race, Kiron Interactive, Digitain, Betradar) into this <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-cyan-400">&lt;VirtualGameLauncher /&gt;</code> container.
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            <Button variant="ghost" onClick={onClose} className="text-xs">
              Close Launcher
            </Button>
            <Button
              variant="gold"
              onClick={() => alert(`Launching ${game.name} demo environment...`)}
              className="text-xs font-black"
            >
              <Zap className="h-4 w-4" /> Launch Sandbox Demo
            </Button>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00E676]" /> Certified RNG Simulation Scaffold
            </span>
            <span>Game ID: {game.id}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
