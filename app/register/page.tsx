"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
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

  return (
    <Shell>
      <div className="mx-auto max-w-lg px-4 py-10">
        <Card>
          <Lock className="h-8 w-8 text-electric" />
          <h1 className="mt-3 text-2xl font-black text-navy">{t("auth.register")}</h1>

          <div className="mt-5 space-y-3">
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full rounded-xl border border-blue-tint px-4 py-3 outline-none focus:ring-2 focus:ring-electric"
              placeholder={t("auth.fullName")}
            />

            <div className="flex rounded-xl border border-blue-tint bg-white">
              <span className="px-4 py-3 font-black text-muted">+251</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                className="w-full rounded-r-xl px-3 py-3 outline-none"
                placeholder="900000000"
              />
            </div>

            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-blue-tint px-4 py-3 outline-none focus:ring-2 focus:ring-electric"
              placeholder={t("auth.password")}
            />

            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full rounded-xl border border-blue-tint px-4 py-3 outline-none focus:ring-2 focus:ring-electric"
              placeholder={t("auth.confirmPassword")}
            />

            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full rounded-xl border border-blue-tint px-4 py-3 outline-none focus:ring-2 focus:ring-electric"
            />

            <label className="flex items-start gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
                className="mt-0.5"
              />
              {t("auth.acceptTerms")}
            </label>

            {error && (
              <div className="rounded-xl bg-live/10 p-3 text-sm font-bold text-live">{error}</div>
            )}

            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? t("common.loading") : t("auth.register")}
            </Button>

            <p className="text-center text-sm font-semibold text-muted">
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
