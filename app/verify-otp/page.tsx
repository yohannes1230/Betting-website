"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ShieldCheck } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [otp, setOtp] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const phone = sessionStorage.getItem("pendingPhone") || "";
      const storedPassword = sessionStorage.getItem("pendingPassword") || "DemoPass123!";
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }
      // Auto-login after verification
      await signIn("credentials", {
        phone,
        password: storedPassword,
        redirect: false,
      });
      sessionStorage.removeItem("pendingPhone");
      sessionStorage.removeItem("pendingPassword");
      router.push("/sports");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCooldown(30);
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <Shell>
      <div className="mx-auto max-w-lg px-4 py-10">
        <Card>
          <ShieldCheck className="h-8 w-8 text-electric" />
          <h1 className="mt-3 text-2xl font-black text-navy">{t("auth.verifyOtp")}</h1>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-blue-tint p-4 text-center font-black text-navy">
              {t("auth.demoOtp")}
            </div>

            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-xl border border-blue-tint px-4 py-4 text-center text-2xl font-black outline-none focus:ring-2 focus:ring-electric"
              style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.5em" }}
              maxLength={6}
              placeholder="000000"
            />

            {error && (
              <div className="rounded-xl bg-live/10 p-3 text-sm font-bold text-live">{error}</div>
            )}

            <Button className="w-full" onClick={handleVerify} disabled={loading}>
              {loading ? t("common.loading") : t("auth.verify")}
            </Button>

            <button
              className="w-full text-center text-sm font-bold text-electric hover:underline disabled:opacity-50"
              onClick={handleResend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `${t("auth.resendOtp")} (${cooldown}s)` : t("auth.resendOtp")}
            </button>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
