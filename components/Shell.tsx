"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleDollarSign,
  LogOut,
  Menu,
  X,
  Zap,
  Trophy,
  Gamepad2,
  Wallet,
  User,
  Shield,
} from "lucide-react";
import { DemoBadge } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";

export function Shell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { locale, setLocale, t } = useI18n();
  const [mobileNav, setMobileNav] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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

  const navItems = [
    { href: "/sports", label: t("nav.sports"), icon: Trophy },
    { href: "/games", label: t("nav.games"), icon: Gamepad2 },
    { href: "/wallet", label: t("nav.wallet"), icon: Wallet },
    { href: "/profile", label: t("nav.profile"), icon: User },
  ];

  return (
    <div className="min-h-screen bg-bg-deep">
      {/* ───── Header ───── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${scrolled
          ? "glass-header shadow-lg shadow-black/20"
          : "bg-bg-deep/95 backdrop-blur-sm border-b border-white/5"
          }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-blue-600 shadow-lg shadow-electric/20 transition group-hover:shadow-electric/40">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight">
              <span className="gradient-text">Addis</span>
              <span className="text-text-primary">Bet</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-6 hidden flex-1 items-center gap-1 text-sm font-semibold md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  className="group flex items-center gap-2 rounded-xl px-3 py-2 text-text-secondary transition hover:bg-white/5 hover:text-text-primary"
                  href={item.href}
                >
                  <Icon className="h-4 w-4 text-text-muted transition group-hover:text-electric" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {/* Demo badge — desktop */}
            <div className="hidden lg:block">
              <DemoBadge />
            </div>

            {/* Language toggle */}
            <button
              className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-text-secondary transition hover:bg-white/10 hover:text-text-primary"
              onClick={() => setLocale(locale === "en" ? "am" : "en")}
              aria-label="Switch language"
            >
              {locale === "en" ? "🇪🇹" : "🇬🇧"}
              <span>{locale === "en" ? "አማ" : "EN"}</span>
            </button>

            {/* Balance */}
            {session?.user && balance !== null && (
              <Link
                href="/wallet"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold/20 to-amber-500/10 px-3 py-2 text-xs font-black text-gold ring-1 ring-gold/20 transition hover:ring-gold/40"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <CircleDollarSign className="h-3.5 w-3.5" />
                {balance} ETB
              </Link>
            )}

            {/* Auth buttons */}
            {session?.user ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-xl bg-white/5 p-2.5 text-text-muted transition hover:bg-white/10 hover:text-text-primary"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/register"
                className="rounded-xl bg-electric px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-electric/20 transition hover:bg-electric-hover hover:shadow-electric/30"
              >
                {t("nav.join")}
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="rounded-xl bg-white/5 p-2.5 text-text-secondary md:hidden"
              onClick={() => setMobileNav(!mobileNav)}
            >
              {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ───── Mobile nav ───── */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-white/5 md:hidden"
            >
              <div className="px-4 pb-4 pt-2">
                <div className="flex flex-wrap gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNav(false)}
                        className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-white/10 hover:text-text-primary"
                      >
                        <Icon className="h-4 w-4 text-electric" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <DemoBadge />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ───── Main ───── */}
      <main>{children}</main>

      {/* ───── Footer ───── */}
      <footer className="mt-10 border-t border-white/5 bg-bg-surface px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-blue-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-text-primary">
                <span className="gradient-text">Addis</span>Bet
              </span>
            </div>
            <div className="mt-2 text-sm font-medium text-text-muted">
              {t("footer.responsible")}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-text-secondary transition hover:bg-white/10"
              onClick={() => setLocale(locale === "en" ? "am" : "en")}
            >
              {locale === "en" ? "🇪🇹 አማርኛ" : "🇬🇧 English"}
            </button>
            <DemoBadge />
          </div>
        </div>
      </footer>
    </div>
  );
}
