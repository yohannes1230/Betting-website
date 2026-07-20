"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Landmark, CircleDollarSign, ArrowDownToLine, Copy } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button, Card, SkeletonRow } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { clsx } from "clsx";

type TxData = { id: string; type: string; amount: string; status: string; note?: string; createdAt: string };
type DepositAccountData = { id: string; provider: string; accountName: string; accountNumber: string; isActive: boolean; };

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<TxData[]>([]);
  const [depositAccounts, setDepositAccounts] = useState<DepositAccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState(500);
  const [message, setMessage] = useState("");

  const fetchData = useCallback(() => {
    Promise.all([
      fetch("/api/wallet/transactions").then(r => r.json()),
      fetch("/api/wallet/deposit-accounts").then(r => r.json())
    ]).then(([d, accs]) => {
      setBalance(Number(d.balance));
      setTransactions(d.transactions || []);
      setDepositAccounts(Array.isArray(accs) ? accs : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    fetchData();
  }, [status, router, fetchData]);

  const addFunds = async (amount: number) => {
    setMessage("");
    const res = await fetch("/api/wallet/demo-deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) fetchData();
  };

  const requestWithdrawal = async () => {
    setMessage("");
    const res = await fetch("/api/wallet/withdraw-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: withdrawAmount }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) fetchData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) return <Shell><div className="mx-auto max-w-5xl px-4 py-6"><SkeletonRow rows={4} /></div></Shell>;

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
        {/* Balance card */}
        <Card variant="dark" glow>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
              <CircleDollarSign className="h-7 w-7 text-gold" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-muted">{t("wallet.balance")}</div>
              <div className="text-3xl font-black text-gold tabular md:text-4xl">
                {balance?.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-lg text-text-muted">ETB</span>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[500, 1000, 5000, 10000].map((amt) => (
              <Button key={amt} onClick={() => addFunds(amt)} variant="gold">
                +{amt.toLocaleString()} ETB
              </Button>
            ))}
          </div>
        </Card>

        {/* Deposit Methods & Instructions */}
        {depositAccounts.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ArrowDownToLine className="h-5 w-5 text-neon-green" />
              <h2 className="font-black text-text-primary text-lg">Deposit Funds</h2>
            </div>
            <p className="text-sm text-text-muted mb-4">
              To add funds to your wallet, please transfer money to one of the following agent accounts.
              Once transferred, contact support with your transaction reference.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {depositAccounts.map(acc => (
                <div key={acc.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-text-primary">{acc.provider}</span>
                    <span className="text-xs bg-neon-green/10 text-neon-green px-2 py-1 rounded-full font-bold">Active</span>
                  </div>
                  <div className="text-sm font-medium text-text-secondary">{acc.accountName}</div>
                  <div className="flex items-center justify-between mt-1 p-2 bg-bg-deep rounded-lg border border-white/5">
                    <span className="font-mono text-text-primary tabular">{acc.accountNumber}</span>
                    <button 
                      onClick={() => copyToClipboard(acc.accountNumber)}
                      className="text-text-muted hover:text-white transition"
                      title="Copy Account Number"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          {/* Withdrawal */}
          <Card glow>
            <h2 className="font-black text-text-primary">{t("wallet.withdraw")}</h2>
            <input
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              type="number"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-black text-text-primary outline-none transition focus:border-electric/40 focus:ring-2 focus:ring-electric/20 tabular"
            />
            <Button className="mt-3 w-full" onClick={requestWithdrawal}>
              <Landmark className="h-4 w-4" />
              {t("wallet.submitRequest")}
            </Button>
            {message && (
              <div className="mt-3 rounded-xl bg-electric/10 border border-electric/20 p-3 text-sm font-bold text-electric">
                {message}
              </div>
            )}
          </Card>

          {/* Transaction history */}
          <Card>
            <h2 className="font-black text-text-primary">{t("wallet.history")}</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold text-text-muted">
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Note</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const amt = Number(tx.amount);
                    return (
                      <tr key={tx.id} className="border-t border-white/5">
                        <td className="py-3 font-black text-text-primary">{tx.type}</td>
                        <td
                          className={clsx("py-3 font-black tabular", amt >= 0 ? "text-neon-green" : "text-live")}
                        >
                          {amt >= 0 ? "+" : ""}{amt.toLocaleString()} ETB
                        </td>
                        <td className="py-3">
                          <span
                            className={clsx(
                              "rounded-full px-2 py-1 text-xs font-black",
                              tx.status === "COMPLETED" && "bg-neon-green/10 text-neon-green",
                              tx.status === "PENDING" && "bg-gold/10 text-gold",
                              tx.status === "APPROVED" && "bg-neon-green/10 text-neon-green",
                              tx.status === "REJECTED" && "bg-live/10 text-live",
                            )}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 text-text-muted">{tx.note}</td>
                        <td className="py-3 text-xs text-text-dim">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <p className="py-4 text-center text-sm text-text-muted">No transactions yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
