"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button, Card, SkeletonRow } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { clsx } from "clsx";

type KpiData = {
  totalUsers: number; todaySignups: number; totalBets: number;
  totalStakes: number; totalPayouts: number; netRevenue: number;
  pendingWithdrawals: number; onlineNow: number;
};

type WithdrawalData = {
  id: string; amount: string; createdAt: string; status: string;
  wallet: { user: { fullName: string; phone: string } };
};

type UserData = {
  id: string; fullName: string; phone: string; membershipLevel: string;
  selfExcluded: boolean; totalWagered: string; createdAt: string;
};

type MatchData = {
  id: string; homeTeam: string; awayTeam: string;
  odds: Array<{ id: string; marketName: string; selection: string; value: string }>;
};

const fmt = (n: number) => `${n.toLocaleString(undefined, { maximumFractionDigits: 0 })} ETB`;

export default function AdminPage() {
  const { t } = useI18n();
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState("");
  const [selectedOdds, setSelectedOdds] = useState("");
  const [oddsValue, setOddsValue] = useState(2.25);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/kpis").then((r) => r.json()),
      fetch("/api/admin/withdrawals/pending").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/matches").then((r) => r.json()),
    ]).then(([k, w, u, m]) => {
      setKpis(k);
      setWithdrawals(Array.isArray(w) ? w : []);
      setUsers(Array.isArray(u) ? u : []);
      setMatches(Array.isArray(m) ? m : []);
      if (m.length > 0) {
        setSelectedMatch(m[0].id);
        if (m[0].odds?.length > 0) setSelectedOdds(m[0].odds[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string, action: "approve" | "reject") => {
    const res = await fetch(`/api/admin/withdrawals/${id}/${action}`, { method: "POST" });
    if (res.ok) {
      setWithdrawals((w) => w.filter((x) => x.id !== id));
    }
  };

  const handleOddsOverride = async () => {
    const res = await fetch("/api/admin/odds/override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: selectedMatch, oddsId: selectedOdds, value: oddsValue }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  const handleSuspend = async (userId: string) => {
    await fetch(`/api/admin/users/${userId}/suspend`, { method: "POST" });
    setUsers((u) => u.map((x) => x.id === userId ? { ...x, selfExcluded: !x.selfExcluded } : x));
  };

  const searchUsers = async () => {
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  const currentMatch = matches.find((m) => m.id === selectedMatch);

  if (loading) return <Shell><div className="mx-auto max-w-7xl px-4 py-6"><SkeletonRow rows={6} /></div></Shell>;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-8 w-8 text-electric" />
          <h1 className="text-3xl font-black text-navy">{t("admin.title")}</h1>
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="mt-5 grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {[
              [t("admin.signups"), `${kpis.todaySignups} today / ${kpis.totalUsers} total`],
              [t("admin.stakes"), fmt(kpis.totalStakes)],
              [t("admin.payouts"), fmt(kpis.totalPayouts)],
              [t("admin.revenue"), fmt(kpis.netRevenue)],
              [t("admin.online"), String(kpis.onlineNow)],
            ].map(([label, value]) => (
              <Card key={label}>
                <div className="text-xs font-bold text-muted">{label}</div>
                <div className="mt-2 text-xl font-black text-navy" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {value}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {/* Pending Withdrawals */}
          <Card>
            <h2 className="font-black text-navy">{t("admin.pendingWithdrawals")}</h2>
            <div className="mt-3 space-y-2">
              {withdrawals.map((w) => (
                <div key={w.id} className="rounded-xl bg-light-grey p-3">
                  <div className="font-black" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {Math.abs(Number(w.amount)).toLocaleString()} ETB
                  </div>
                  <div className="text-xs text-muted">{w.wallet?.user?.fullName}</div>
                  <div className="mt-2 flex gap-2">
                    <Button className="min-h-9 px-3 text-xs" onClick={() => handleApprove(w.id, "approve")}>
                      {t("admin.approve")}
                    </Button>
                    <Button className="min-h-9 px-3 text-xs" variant="soft" onClick={() => handleApprove(w.id, "reject")}>
                      {t("admin.reject")}
                    </Button>
                  </div>
                </div>
              ))}
              {withdrawals.length === 0 && (
                <p className="text-sm font-bold text-muted">No pending withdrawals.</p>
              )}
            </div>
          </Card>

          {/* Odds Override */}
          <Card>
            <h2 className="font-black text-navy">{t("admin.oddsOverride")}</h2>
            <select
              value={selectedMatch}
              onChange={(e) => {
                setSelectedMatch(e.target.value);
                const m = matches.find((x) => x.id === e.target.value);
                if (m?.odds?.[0]) setSelectedOdds(m.odds[0].id);
              }}
              className="mt-3 w-full rounded-xl border border-blue-tint px-3 py-3 outline-none"
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>{m.homeTeam} vs {m.awayTeam}</option>
              ))}
            </select>
            <select
              value={selectedOdds}
              onChange={(e) => setSelectedOdds(e.target.value)}
              className="mt-3 w-full rounded-xl border border-blue-tint px-3 py-3 outline-none"
            >
              {currentMatch?.odds?.map((o) => (
                <option key={o.id} value={o.id}>{o.marketName} — {o.selection} ({Number(o.value).toFixed(2)})</option>
              ))}
            </select>
            <input
              value={oddsValue}
              onChange={(e) => setOddsValue(Number(e.target.value))}
              type="number"
              step="0.01"
              className="mt-3 w-full rounded-xl border border-blue-tint px-3 py-3 font-black outline-none"
              style={{ fontVariantNumeric: "tabular-nums" }}
            />
            <Button className="mt-3 w-full" onClick={handleOddsOverride}>
              {t("admin.saveOverride")}
            </Button>
            {message && <div className="mt-2 rounded-xl bg-blue-tint p-3 text-sm font-bold text-navy">{message}</div>}
          </Card>

          {/* Users */}
          <Card>
            <h2 className="font-black text-navy">{t("admin.users")}</h2>
            <div className="mt-3 flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-light-grey px-3 py-2">
                <Search className="h-4 w-4 text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                  className="flex-1 bg-transparent text-sm font-bold outline-none"
                  placeholder={t("admin.searchUsers")}
                />
              </div>
            </div>
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {users.slice(0, 15).map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-light-grey p-3">
                  <div>
                    <span className="font-black text-sm">{u.fullName}</span>
                    <div className="text-xs text-muted">{u.phone}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      "rounded-full px-2 py-1 text-xs font-black",
                      u.selfExcluded ? "bg-live/10 text-live" : "bg-win/10 text-win",
                    )}>
                      {u.selfExcluded ? "suspended" : "active"}
                    </span>
                    <button
                      onClick={() => handleSuspend(u.id)}
                      className="text-xs font-bold text-electric hover:underline"
                    >
                      {u.selfExcluded ? t("admin.unsuspend") : t("admin.suspend")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
