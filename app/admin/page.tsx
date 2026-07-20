"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, Search, Shield, Plus, Power } from "lucide-react";
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

type DepositAccountData = {
  id: string; provider: string; accountName: string; accountNumber: string; isActive: boolean;
};

const fmt = (n: number) => `${n.toLocaleString(undefined, { maximumFractionDigits: 0 })} ETB`;

const selectClass = "mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-text-primary outline-none transition focus:border-electric/40 focus:ring-2 focus:ring-electric/20";
const inputClass = "mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 font-black text-text-primary outline-none transition focus:border-electric/40 focus:ring-2 focus:ring-electric/20 tabular";

export default function AdminPage() {
  const { t } = useI18n();
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [depositAccounts, setDepositAccounts] = useState<DepositAccountData[]>([]);
  
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [selectedMatch, setSelectedMatch] = useState("");
  const [selectedOdds, setSelectedOdds] = useState("");
  const [oddsValue, setOddsValue] = useState(2.25);
  const [message, setMessage] = useState("");

  const [newAccProvider, setNewAccProvider] = useState("CBE");
  const [newAccName, setNewAccName] = useState("");
  const [newAccNumber, setNewAccNumber] = useState("");

  const fetchData = () => {
    Promise.all([
      fetch("/api/admin/kpis").then((r) => r.json()),
      fetch("/api/admin/withdrawals/pending").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/matches").then((r) => r.json()),
      fetch("/api/admin/deposit-accounts").then((r) => r.json()),
    ]).then(([k, w, u, m, accs]) => {
      setKpis(k);
      setWithdrawals(Array.isArray(w) ? w : []);
      setUsers(Array.isArray(u) ? u : []);
      setMatches(Array.isArray(m) ? m : []);
      setDepositAccounts(Array.isArray(accs) ? accs : []);
      
      if (m && m.length > 0 && !selectedMatch) {
        setSelectedMatch(m[0].id);
        if (m[0].odds?.length > 0) setSelectedOdds(m[0].odds[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
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

  const addDepositAccount = async () => {
    if (!newAccName || !newAccNumber) return;
    const res = await fetch("/api/admin/deposit-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: newAccProvider, accountName: newAccName, accountNumber: newAccNumber }),
    });
    if (res.ok) {
      setNewAccName("");
      setNewAccNumber("");
      fetchData();
    }
  };

  const toggleDepositAccount = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/admin/deposit-accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentStatus }),
    });
    fetchData();
  };

  const currentMatch = matches.find((m) => m.id === selectedMatch);

  if (loading) return <Shell><div className="mx-auto max-w-7xl px-4 py-6"><SkeletonRow rows={6} /></div></Shell>;

  return (
    <div className="min-h-screen bg-bg-deep">
      <header className="bg-bg-deep/95 backdrop-blur-sm border-b border-white/5 sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-blue-600 shadow-lg shadow-electric/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            Admin <span className="text-electric">Panel</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* KPI Cards */}
        {kpis && (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {[
              [t("admin.signups"), `${kpis.todaySignups} / ${kpis.totalUsers}`, "text-electric"],
              [t("admin.stakes"), fmt(kpis.totalStakes), "text-gold"],
              [t("admin.payouts"), fmt(kpis.totalPayouts), "text-neon-green"],
              [t("admin.revenue"), fmt(kpis.netRevenue), "text-electric"],
              [t("admin.online"), String(kpis.onlineNow), "text-neon-green"],
            ].map(([label, value, color]) => (
              <Card key={label as string} glow>
                <div className="text-xs font-bold text-text-muted">{label}</div>
                <div className={`mt-2 text-xl font-black tabular ${color}`}>
                  {value}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {/* Agent Deposit Accounts */}
          <Card className="lg:col-span-3">
            <h2 className="font-black text-text-primary">Agent Deposit Accounts</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-[300px_1fr]">
              <div className="space-y-3 rounded-xl bg-white/5 p-4 border border-white/6">
                <h3 className="text-sm font-bold text-text-secondary">Add New Account</h3>
                <select
                  value={newAccProvider}
                  onChange={(e) => setNewAccProvider(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-bg-deep px-3 py-2 text-sm text-text-primary outline-none focus:border-electric"
                >
                  <option value="CBE">CBE (Commercial Bank)</option>
                  <option value="Telebirr">Telebirr</option>
                  <option value="Awash">Awash Bank</option>
                  <option value="Abyssinia">Abyssinia Bank</option>
                </select>
                <input
                  placeholder="Account Name"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-bg-deep px-3 py-2 text-sm text-text-primary outline-none focus:border-electric"
                />
                <input
                  placeholder="Account Number"
                  value={newAccNumber}
                  onChange={(e) => setNewAccNumber(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-bg-deep px-3 py-2 text-sm text-text-primary outline-none focus:border-electric tabular"
                />
                <Button className="w-full py-2 text-sm" onClick={addDepositAccount}>
                  <Plus className="h-4 w-4 mr-1" /> Add Account
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-bold text-text-muted">
                      <th className="pb-2">Provider</th>
                      <th className="pb-2">Account Name</th>
                      <th className="pb-2">Account Number</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depositAccounts.map((acc) => (
                      <tr key={acc.id} className="border-b border-white/5">
                        <td className="py-3 font-bold text-text-primary">{acc.provider}</td>
                        <td className="py-3 text-text-secondary">{acc.accountName}</td>
                        <td className="py-3 font-mono text-text-primary">{acc.accountNumber}</td>
                        <td className="py-3">
                          <span className={clsx(
                            "rounded-full px-2 py-1 text-xs font-black",
                            acc.isActive ? "bg-neon-green/10 text-neon-green" : "bg-live/10 text-live"
                          )}>
                            {acc.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => toggleDepositAccount(acc.id, acc.isActive)}
                            className="rounded-lg bg-white/5 p-2 text-text-muted transition hover:bg-white/10 hover:text-white"
                          >
                            <Power className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {depositAccounts.length === 0 && (
                      <tr><td colSpan={5} className="py-4 text-center text-text-muted">No accounts added.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Pending Withdrawals */}
          <Card>
            <h2 className="font-black text-text-primary">{t("admin.pendingWithdrawals")}</h2>
            <div className="mt-3 space-y-2">
              {withdrawals.map((w) => (
                <div key={w.id} className="rounded-xl bg-white/5 border border-white/6 p-3">
                  <div className="font-black text-text-primary tabular">
                    {Math.abs(Number(w.amount)).toLocaleString()} ETB
                  </div>
                  <div className="text-xs text-text-muted">{w.wallet?.user?.fullName}</div>
                  <div className="mt-2 flex gap-2">
                    <Button className="min-h-9 px-3 text-xs" onClick={() => handleApprove(w.id, "approve")}>
                      {t("admin.approve")}
                    </Button>
                    <Button className="min-h-9 px-3 text-xs" variant="danger" onClick={() => handleApprove(w.id, "reject")}>
                      {t("admin.reject")}
                    </Button>
                  </div>
                </div>
              ))}
              {withdrawals.length === 0 && (
                <p className="text-sm font-bold text-text-muted">No pending withdrawals.</p>
              )}
            </div>
          </Card>

          {/* Odds Override */}
          <Card>
            <h2 className="font-black text-text-primary">{t("admin.oddsOverride")}</h2>
            <select
              value={selectedMatch}
              onChange={(e) => {
                setSelectedMatch(e.target.value);
                const m = matches.find((x) => x.id === e.target.value);
                if (m?.odds?.[0]) setSelectedOdds(m.odds[0].id);
              }}
              className={selectClass}
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>{m.homeTeam} vs {m.awayTeam}</option>
              ))}
            </select>
            <select
              value={selectedOdds}
              onChange={(e) => setSelectedOdds(e.target.value)}
              className={selectClass}
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
              className={inputClass}
            />
            <Button className="mt-3 w-full" onClick={handleOddsOverride}>
              {t("admin.saveOverride")}
            </Button>
            {message && <div className="mt-2 rounded-xl bg-electric/10 border border-electric/20 p-3 text-sm font-bold text-electric">{message}</div>}
          </Card>

          {/* Users */}
          <Card>
            <h2 className="font-black text-text-primary">{t("admin.users")}</h2>
            <div className="mt-3 flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <Search className="h-4 w-4 text-text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                  className="flex-1 bg-transparent text-sm font-bold text-text-primary outline-none placeholder:text-text-dim"
                  placeholder={t("admin.searchUsers")}
                />
              </div>
            </div>
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {users.slice(0, 15).map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/6 p-3">
                  <div>
                    <span className="font-black text-sm text-text-primary">{u.fullName}</span>
                    <div className="text-xs text-text-muted">{u.phone}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      "rounded-full px-2 py-1 text-xs font-black",
                      u.selfExcluded ? "bg-live/10 text-live" : "bg-neon-green/10 text-neon-green",
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
      </main>
    </div>
  );
}
