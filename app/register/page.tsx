"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Zap } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [form, setForm] = useState({
    fullName: "", phone: "", password: "", confirmPassword: "", dob: "1995-01-01", acceptTerms: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: `+251${form.phone}` }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Registration failed");
        return;
      }
      // Store phone for OTP page
      sessionStorage.setItem("pendingPhone", `+251${form.phone}`);
      router.push("/verify-otp");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-text-primary outline-none transition focus:border-electric/40 focus:ring-2 focus:ring-electric/20 placeholder:text-text-dim";

  return (
    <Shell>
      <div className="mx-auto max-w-lg px-4 py-10">
        <Card glow>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric/10">
            <Lock className="h-6 w-6 text-electric" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-text-primary">{t("auth.register")}</h1>

          <div className="mt-5 space-y-3">
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={inputClass}
              placeholder={t("auth.fullName")}
            />

            <div className="flex rounded-xl border border-white/10 bg-white/5">
              <span className="px-4 py-3 font-black text-text-muted">+251</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                className="w-full rounded-r-xl bg-transparent px-3 py-3 text-text-primary outline-none placeholder:text-text-dim"
                placeholder="900000000"
              />
            </div>

            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
              placeholder={t("auth.password")}
            />

            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className={inputClass}
              placeholder={t("auth.confirmPassword")}
            />

            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className={inputClass}
            />

            <label className="flex items-start gap-2 text-sm font-bold text-text-secondary">
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
                className="mt-0.5 accent-electric"
              />
              {t("auth.acceptTerms")}
            </label>

            {error && (
              <div className="rounded-xl bg-live/10 border border-live/20 p-3 text-sm font-bold text-live">{error}</div>
            )}

            <Button className="w-full" onClick={handleSubmit} disabled={loading} variant="gold">
              <Zap className="h-4 w-4" />
              {loading ? t("common.loading") : t("auth.register")}
            </Button>

            <p className="text-center text-sm font-semibold text-text-muted">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link href="/login" className="font-bold text-electric hover:underline">
                {t("auth.login")}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
