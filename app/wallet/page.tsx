"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Wallet as WalletIcon, Landmark } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button, Card, SkeletonRow } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { clsx } from "clsx";

type TxData = { id: string; type: string; amount: string; status: string; note?: string; createdAt: string };

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<TxData[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState(500);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    fetchData();
  }, [status]);

  const fetchData = () => {
    fetch("/api/wallet/transactions")
      .then((r) => r.json())
      .then((d) => {
        setBalance(Number(d.balance));
        setTransactions(d.transactions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

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

  if (loading) return <Shell><div className="mx-auto max-w-5xl px-4 py-6"><SkeletonRow rows={4} /></div></Shell>;

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
        {/* Balance card */}
        <Card variant="dark">
          <WalletIcon className="h-7 w-7 text-electric-hover" />
          <div className="mt-3 text-sm font-bold text-white/70">{t("wallet.balance")}</div>
          <div className="mt-1 text-4xl font-black" style={{ fontVariantNumeric: "tabular-nums" }}>
            {balance?.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB-DEMO
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[500, 1000, 5000, 10000].map((amt) => (
              <Button key={amt} onClick={() => addFunds(amt)}>
                +{amt.toLocaleString()} ETB
              </Button>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          {/* Withdrawal */}
          <Card>
            <h2 className="font-black text-navy">{t("wallet.withdraw")}</h2>
            <input
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              type="number"
              className="mt-3 w-full rounded-xl border border-blue-tint px-3 py-3 font-black outline-none focus:ring-2 focus:ring-electric"
              style={{ fontVariantNumeric: "tabular-nums" }}
            />
            <Button className="mt-3 w-full" onClick={requestWithdrawal}>
              <Landmark className="h-4 w-4" />
              {t("wallet.submitRequest")}
            </Button>
            {message && (
              <div className="mt-3 rounded-xl bg-blue-tint p-3 text-sm font-bold text-navy">
                {message}
              </div>
            )}
          </Card>

          {/* Transaction history */}
          <Card>
            <h2 className="font-black text-navy">{t("wallet.history")}</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-bold text-muted">
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
                      <tr key={tx.id} className="border-t">
                        <td className="py-3 font-black">{tx.type}</td>
                        <td
                          className={clsx("py-3 font-black", amt >= 0 ? "text-win" : "text-live")}
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {amt >= 0 ? "+" : ""}{amt.toLocaleString()} ETB
                        </td>
                        <td className="py-3">
                          <span
                            className={clsx(
                              "rounded-full px-2 py-1 text-xs font-black",
                              tx.status === "COMPLETED" && "bg-win/10 text-win",
                              tx.status === "PENDING" && "bg-yellow-50 text-yellow-600",
                              tx.status === "APPROVED" && "bg-win/10 text-win",
                              tx.status === "REJECTED" && "bg-live/10 text-live",
                            )}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 text-muted">{tx.note}</td>
                        <td className="py-3 text-xs text-muted">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <p className="py-4 text-center text-sm text-muted">No transactions yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
