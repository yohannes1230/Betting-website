"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Activity,
  Gamepad2,
  Dice5,
  Flame,
  Gift,
  Award,
  Search,
  Wallet,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Home,
  ReceiptText,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { TipplayLogo } from "@/components/ui/TipplayLogo";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { useI18n } from "@/lib/i18n";
import { useBetSlipStore } from "@/lib/store";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { locale, setLocale, t } = useI18n();
  const { slip } = useBetSlipStore();

  const [mobileNav, setMobileNav] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [sportsMegaMenu, setSportsMegaMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveCount, setLiveCount] = useState<number>(8);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Fetch live match count dynamically if available
    fetch("/api/matches?live=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLiveCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const updateBalance = (balanceValue: number | string | null | undefined) => {
      if (balanceValue == null || balanceValue === "") {
        setBalance(null);
        return;
      }
      setBalance(Number(balanceValue).toLocaleString(undefined, { maximumFractionDigits: 2 }));
    };

    const refreshBalance = async () => {
      if (!session?.user) {
        setBalance(null);
        return;
      }

      try {
        const res = await fetch("/api/wallet/transactions", { cache: "no-store" });
        const data = await res.json();
        if (data?.balance != null) {
          updateBalance(data.balance);
        } else {
          setBalance(null);
        }
      } catch {
        setBalance(null);
      }
    };

    const handleWalletUpdate = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.balance != null) {
        updateBalance(detail.balance);
      } else {
        void refreshBalance();
      }
    };

    if (session?.user) {
      void refreshBalance();
      window.addEventListener("walletBalanceUpdated", handleWalletUpdate);
    } else {
      setBalance(null);
    }

    return () => {
      window.removeEventListener("walletBalanceUpdated", handleWalletUpdate);
    };
  }, [session]);

  // Modern African Sportsbook Navigation Structure
  const primaryNavItems = [
    {
      href: "/sports",
      label: t("nav.sports") || "Sports",
      icon: Trophy,
      hasMegaMenu: true,
    },
    {
      href: "/sports?live=true",
      label: "Live Betting",
      icon: Activity,
      badge: liveCount > 0 ? liveCount : undefined,
      isLive: true,
    },
    {
      href: "/virtual-games",
      label: "Virtual Games",
      icon: Gamepad2,
      isNew: true,
    },
    {
      href: "/games",
      label: "Casino / Slots",
      icon: Dice5,
    },
    {
      href: "/games/aviator",
      label: "Crash Games",
      icon: Flame,
      badgeText: "HOT",
    },
    {
      href: "/#promotions",
      label: "Promotions",
      icon: Gift,
    },
    {
      href: "/games#jackpot",
      label: "Jackpot",
      icon: Award,
    },
  ];

  const sportsCategories = [
    { name: "Football / Soccer", icon: "⚽", count: "120+" },
    { name: "Basketball", icon: "🏀", count: "45" },
    { name: "Tennis", icon: "🎾", count: "28" },
    { name: "Esports", icon: "🎮", count: "30" },
    { name: "MMA / Boxing", icon: "🥊", count: "12" },
    { name: "Table Tennis", icon: "🏓", count: "18" },
  ];

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary pb-16 md:pb-0">
      {/* ───── Top Navigation Header ───── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#12151C]/90 backdrop-blur-md shadow-xl border-b border-white/10"
            : "bg-[#0B0E11]/95 backdrop-blur-sm border-b border-white/5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5 lg:px-4">
          {/* Brand Logo */}
          <TipplayLogo size="md" />

          {/* Desktop Primary Nav Bar */}
          <nav className="ml-4 hidden flex-1 items-center gap-1 text-xs font-bold lg:flex">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

              if (item.hasMegaMenu) {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setSportsMegaMenu(true)}
                    onMouseLeave={() => setSportsMegaMenu(false)}
                  >
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition ${
                        isActive
                          ? "bg-electric/10 text-electric font-black"
                          : "text-text-secondary hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-electric" />
                      <span>{item.label}</span>
                      <ChevronDown className="h-3 w-3 opacity-60 group-hover:rotate-180 transition-transform" />
                    </Link>

                    {/* Mega-menu dropdown */}
                    <AnimatePresence>
                      {sportsMegaMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full pt-2 w-64 z-50"
                        >
                          <div className="rounded-xl bg-[#181C24] border border-white/10 p-2 shadow-2xl backdrop-blur-xl">
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted px-3 py-1.5">
                              Top Sports
                            </div>
                            {sportsCategories.map((cat) => (
                              <Link
                                key={cat.name}
                                href={`/sports?category=${encodeURIComponent(cat.name)}`}
                                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-white/10 hover:text-white transition"
                              >
                                <span className="flex items-center gap-2">
                                  <span>{cat.icon}</span>
                                  <span>{cat.name}</span>
                                </span>
                                <span className="text-[10px] font-bold text-electric/80 bg-electric/10 px-1.5 py-0.5 rounded">
                                  {cat.count}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition ${
                    isActive
                      ? "bg-electric/10 text-electric font-black"
                      : "text-text-secondary hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      item.isLive ? "text-live animate-pulse" : "text-text-muted group-hover:text-electric"
                    }`}
                  />
                  <span>{item.label}</span>

                  {item.badge && (
                    <span className="flex items-center justify-center rounded-full bg-live px-1.5 py-0.2 text-[10px] font-black text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeText && (
                    <span className="rounded bg-gradient-to-r from-amber-500 to-red-500 px-1.5 py-0.2 text-[9px] font-black text-white uppercase tracking-wider">
                      {item.badgeText}
                    </span>
                  )}
                  {item.isNew && (
                    <span className="rounded bg-electric px-1.5 py-0.2 text-[9px] font-black text-black uppercase tracking-wider">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search Toggle */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white transition"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-11 w-72 rounded-xl bg-[#181C24] border border-white/10 p-2 shadow-2xl z-50"
                  >
                    <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2 border border-white/10">
                      <Search className="h-4 w-4 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Search teams, leagues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-xs text-white placeholder-text-muted focus:outline-none w-full"
                        autoFocus
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Switcher */}
            <button
              className="flex items-center gap-1 rounded-xl bg-white/5 px-2.5 py-2 text-xs font-bold text-text-secondary hover:bg-white/10 hover:text-white transition"
              onClick={() => setLocale(locale === "en" ? "am" : "en")}
              aria-label="Switch language"
            >
              <span className="text-sm">{locale === "en" ? "🇪🇹" : "🇬🇧"}</span>
              <span className="hidden sm:inline">{locale === "en" ? "አማ" : "EN"}</span>
            </button>

            {/* User Balance Display */}
            {session?.user && balance !== null && (
              <Link
                href="/wallet"
                className="flex items-center gap-1.5 rounded-xl bg-gold/15 px-3 py-2 text-xs font-black text-gold border border-gold/30 hover:border-gold/60 transition tabular"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>{balance} ETB</span>
              </Link>
            )}

            {/* Deposit CTA Button (Always High-Contrast) */}
            {session?.user ? (
              <Link
                href="/wallet"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00E676] to-[#10B981] px-3.5 py-2 text-xs font-black text-black shadow-lg shadow-electric/25 hover:brightness-110 transition transform active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Deposit</span>
              </Link>
            ) : null}

            {/* Auth Action Buttons */}
            {session?.user ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-xl bg-white/5 p-2 text-text-muted hover:bg-white/10 hover:text-white transition"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10 transition"
                >
                  {t("nav.login") || "Login"}
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-electric px-3.5 py-2 text-xs font-black text-black shadow-md shadow-electric/20 hover:bg-electric-hover transition"
                >
                  {t("nav.join") || "Join"}
                </Link>
              </div>
            )}

            {/* Mobile Navigation Drawer Toggle */}
            <button
              className="rounded-xl bg-white/5 p-2 text-text-secondary lg:hidden"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Toggle Navigation"
            >
              {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Slide-Down Drawer */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/5 bg-[#12151C] lg:hidden"
            >
              <div className="px-4 py-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {primaryNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNav(false)}
                        className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3.5 py-3 text-xs font-bold text-text-secondary hover:bg-white/10 hover:text-white transition"
                      >
                        <Icon className="h-4 w-4 text-electric" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-white/5">
                  <DemoBadge />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ───── Main Content Container ───── */}
      <main>{children}</main>

      {/* ───── Sticky Bottom Mobile Nav Bar (Modern African Sportsbook UX) ───── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-white/10 bg-[#12151C]/95 backdrop-blur-lg px-2 lg:hidden">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            pathname === "/" ? "text-electric" : "text-text-muted hover:text-white"
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/sports?live=true"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold relative ${
            pathname?.includes("live") ? "text-electric" : "text-text-muted hover:text-white"
          }`}
        >
          <Activity className="h-5 w-5 text-live animate-pulse" />
          <span>Live</span>
          {liveCount > 0 && (
            <span className="absolute -top-1 right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-live text-[9px] font-black text-white">
              {liveCount}
            </span>
          )}
        </Link>

        {/* Sticky Bet Slip Button with Selection Counter Badge */}
        <Link
          href="/sports"
          className="relative -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#00E676] to-[#10B981] text-black shadow-lg shadow-electric/40 active:scale-90 transition transform"
          title="Bet Slip"
        >
          <ReceiptText className="h-6 w-6" />
          {slip.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-live text-[10px] font-black text-white ring-2 ring-[#12151C]">
              {slip.length}
            </span>
          )}
        </Link>

        <Link
          href="/games"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            pathname?.startsWith("/games") ? "text-electric" : "text-text-muted hover:text-white"
          }`}
        >
          <Dice5 className="h-5 w-5" />
          <span>Casino</span>
        </Link>

        <Link
          href={session?.user ? "/profile" : "/login"}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            pathname === "/profile" || pathname === "/login" ? "text-electric" : "text-text-muted hover:text-white"
          }`}
        >
          <User className="h-5 w-5" />
          <span>Account</span>
        </Link>
      </nav>

      {/* ───── Footer ───── */}
      <footer className="mt-14 border-t border-white/10 bg-[#12151C] px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <TipplayLogo size="lg" />
              <p className="mt-4 text-xs text-text-muted leading-relaxed">
                Tipplay is Ethiopia's premier sports betting & instant casino gaming platform. Play responsibly, bet smart, and enjoy real-time entertainment.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-xs font-semibold text-text-secondary">
                <li><Link href="/sports" className="hover:text-electric transition">Sportsbook</Link></li>
                <li><Link href="/sports?live=true" className="hover:text-electric transition">Live Betting</Link></li>
                <li><Link href="/virtual-games" className="hover:text-electric transition">Virtual Sports</Link></li>
                <li><Link href="/games/aviator" className="hover:text-electric transition">Aviator Crash</Link></li>
                <li><Link href="/games" className="hover:text-electric transition">Casino & Slots</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Support & Legal</h4>
              <ul className="mt-3 space-y-2 text-xs font-semibold text-text-secondary">
                <li><a href="#" className="hover:text-electric transition">Responsible Gambling (18+)</a></li>
                <li><a href="#" className="hover:text-electric transition">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-electric transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-electric transition">24/7 Customer Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Payment Methods</h4>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-text-muted">
                <span className="rounded-lg bg-white/5 px-2.5 py-1.5 border border-white/5">Telebirr</span>
                <span className="rounded-lg bg-white/5 px-2.5 py-1.5 border border-white/5">CBE Birr</span>
                <span className="rounded-lg bg-white/5 px-2.5 py-1.5 border border-white/5">Chapa</span>
                <span className="rounded-lg bg-white/5 px-2.5 py-1.5 border border-white/5">Awash Bank</span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-text-muted">
              © {new Date().getFullYear()} Tipplay. All rights reserved. 18+ Only.
            </div>
            <div className="flex items-center gap-3">
              <DemoBadge />
              <button
                className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-white/10"
                onClick={() => setLocale(locale === "en" ? "am" : "en")}
              >
                <span>{locale === "en" ? "🇪🇹 አማርኛ" : "🇬🇧 English"}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
