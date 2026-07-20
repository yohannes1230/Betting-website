"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Card, SkeletonRow } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { clsx } from "clsx";

type BetData = { id: string; betType: string; stake: string; totalOdds: string; potentialWin: string; status: string; createdAt: string; items: Array<{ selection: string; marketName: string; odds: string }> };

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [bets, setBets] = useState<BetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    fetch("/api/bets").then((r) => r.json()).then((d) => { setBets(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, [status]);

  const user = session?.user as any;

  return (
    <Shell>
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[340px_1fr]">
        <Card glow>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric/10">
            <UserRound className="h-6 w-6 text-electric" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-text-primary">{user?.name ?? "Demo Player"}</h1>
          <div className="mt-1 text-sm font-semibold text-text-muted">{user?.phone ?? ""}</div>
          <div className="mt-3 inline-block rounded-full bg-gold/10 px-3 py-2 text-sm font-black text-gold ring-1 ring-gold/20">
            {user?.membershipLevel ?? "SILVER"} {t("profile.vipTier")}
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-electric to-gold" />
          </div>

          <div className="mt-5 space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-text-secondary">
              <input type="checkbox" defaultChecked={user?.selfExcluded} className="accent-electric" />
              {t("profile.selfExclusion")}
            </label>
            <label className="block text-sm font-black text-text-muted">{t("profile.depositLimit")}</label>
            <input
              type="number"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-text-primary outline-none transition focus:border-electric/40 focus:ring-2 focus:ring-electric/20 placeholder:text-text-dim"
              placeholder={t("profile.noLimit")}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-black text-text-primary">{t("profile.betHistory")}</h2>
          {loading ? <SkeletonRow rows={3} /> : (
            <div className="mt-3 space-y-3">
              {bets.length === 0 && <p className="py-4 text-center text-sm text-text-muted">No bets yet.</p>}
              {bets.map((bet) => (
                <div key={bet.id} className="rounded-xl bg-white/5 border border-white/6 p-3">
                  <div className="flex justify-between font-black">
                    <span className="text-sm text-text-primary">{bet.id.slice(0, 12)}</span>
                    <span className={clsx("text-sm capitalize", bet.status === "WON" && "text-neon-green", bet.status === "LOST" && "text-live", bet.status === "PENDING" && "text-electric")}>
                      {bet.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-text-muted">
                    {bet.betType} — {bet.items?.length ?? 0} legs — stake {Number(bet.stake).toLocaleString()} ETB — potential {Number(bet.potentialWin).toLocaleString()} ETB
                  </div>
                  <div className="mt-1 text-xs text-text-dim">{new Date(bet.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
