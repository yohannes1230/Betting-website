"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, TrendingUp, Sparkles } from "lucide-react";
import { TipplayLogo } from "./TipplayLogo";

export function SplashIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("tipplay-splash-seen");
    if (!hasSeen) {
      setVisible(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("tipplay-splash-seen", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0E11] p-4"
      >
        {/* Skip button */}
        <button
          onClick={handleDismiss}
          className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white/80 hover:bg-white/20 hover:text-white backdrop-blur-md transition"
        >
          <span>Skip</span>
          <X className="h-4 w-4" />
        </button>

        {/* Animated Brand Identity Motif */}
        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <TipplayLogo size="lg" />
          </motion.div>

          {/* Animated Rising Odds Graph Trail */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "180px", opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-6 h-1 rounded-full bg-gradient-to-r from-[#00E676] via-[#FFD700] to-[#00E676] shadow-lg shadow-electric/50"
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-4 text-xs font-black uppercase tracking-widest text-electric flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 animate-spin-slow" />
            Premier Sportsbook & Casino Experience
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
