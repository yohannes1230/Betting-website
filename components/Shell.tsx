"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { CircleDollarSign, Languages, LogOut, Menu, X } from "lucide-react";
import { DemoBadge } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";

export function Shell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { locale, setLocale, t } = useI18n();
  const [mobileNav, setMobileNav] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/wallet/transactions")
        .then((r) => r.json())
        .then((d) => {
          if (d.balance != null) setBalance(Number(d.balance).toLocaleString(undefined, { maximumFractionDigits: 2 }));
        })
        .catch(() => {});
    }
  }, [session]);

  const navItems = [
    { href: "/sports", label: t("nav.sports") },
    { href: "/games", label: t("nav.games") },
    { href: "/wallet", label: t("nav.wallet") },
    { href: "/profile", label: t("nav.profile") },
    { href: "/admin", label: t("nav.admin") },
  ];

  return (
    <div className="min-h-screen bg-light-grey">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-black text-lg">
            <CircleDollarSign className="h-7 w-7 text-electric-hover" />
            AddisBet
          </Link>

          <nav className="ml-4 hidden flex-1 items-center gap-1 text-sm font-semibold md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="rounded-full px-3 py-2 transition hover:bg-white/10"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:block">
              <DemoBadge />
            </div>

            <button
              className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
              onClick={() => setLocale(locale === "en" ? "am" : "en")}
              aria-label="Switch language"
            >
              <Languages className="h-4 w-4" />
            </button>

            {session?.user && balance !== null && (
              <Link
                href="/wallet"
                className="rounded-full bg-white px-3 py-2 text-xs font-black text-navy"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {balance} ETB
              </Link>
            )}

            {session?.user ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/register"
                className="rounded-full bg-electric px-4 py-2 text-xs font-black transition hover:bg-electric-hover"
              >
                {t("nav.join")}
              </Link>
            )}

            <button
              className="rounded-full bg-white/10 p-2 md:hidden"
              onClick={() => setMobileNav(!mobileNav)}
            >
              {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNav && (
          <div className="border-t border-white/10 px-4 pb-4 md:hidden">
            <div className="mt-2 flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNav(false)}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-3">
              <DemoBadge />
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-10 bg-navy px-4 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-black">AddisBet Demo MVP</div>
            <div className="mt-1 text-sm font-semibold text-white/60">
              {t("footer.responsible")}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold transition hover:bg-white/20"
              onClick={() => setLocale(locale === "en" ? "am" : "en")}
            >
              {locale === "en" ? "አማርኛ" : "English"}
            </button>
            <DemoBadge />
          </div>
        </div>
      </footer>
    </div>
  );
}
