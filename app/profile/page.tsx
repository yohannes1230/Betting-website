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
        <Card>
          <UserRound className="h-8 w-8 text-electric" />
          <h1 className="mt-3 text-2xl font-black text-navy">{user?.name ?? "Demo Player"}</h1>
          <div className="mt-1 text-sm font-semibold text-muted">{user?.phone ?? ""}</div>
          <div className="mt-3 rounded-full bg-blue-tint px-3 py-2 text-sm font-black text-electric inline-block">
            {user?.membershipLevel ?? "SILVER"} {t("profile.vipTier")}
          </div>
          <div className="mt-4 h-3 rounded-full bg-light-grey">
            <div className="h-3 w-2/3 rounded-full bg-electric" />
          </div>

          <div className="mt-5 space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" defaultChecked={user?.selfExcluded} />
              {t("profile.selfExclusion")}
            </label>
            <label className="block text-sm font-black text-muted">{t("profile.depositLimit")}</label>
            <input
              type="number"
              className="w-full rounded-xl border border-blue-tint px-3 py-3 outline-none focus:ring-2 focus:ring-electric"
              placeholder={t("profile.noLimit")}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-black text-navy">{t("profile.betHistory")}</h2>
          {loading ? <SkeletonRow rows={3} /> : (
            <div className="mt-3 space-y-3">
              {bets.length === 0 && <p className="py-4 text-center text-sm text-muted">No bets yet.</p>}
              {bets.map((bet) => (
                <div key={bet.id} className="rounded-xl bg-light-grey p-3">
                  <div className="flex justify-between font-black">
                    <span className="text-sm">{bet.id.slice(0, 12)}</span>
                    <span className={clsx("text-sm capitalize", bet.status === "WON" && "text-win", bet.status === "LOST" && "text-live", bet.status === "PENDING" && "text-electric")}>
                      {bet.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-muted">
                    {bet.betType} — {bet.items?.length ?? 0} legs — stake {Number(bet.stake).toLocaleString()} ETB — potential {Number(bet.potentialWin).toLocaleString()} ETB
                  </div>
                  <div className="mt-1 text-xs text-muted">{new Date(bet.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
