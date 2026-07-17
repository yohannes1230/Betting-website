"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Lock } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("DemoPass123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        phone: `+251${phone}`,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid phone or password");
      } else {
        router.push("/sports");
        router.refresh();
      }
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
          <h1 className="mt-3 text-2xl font-black text-navy">{t("auth.login")}</h1>

          <div className="mt-5 space-y-3">
            <div className="flex rounded-xl border border-blue-tint bg-white">
              <span className="px-4 py-3 font-black text-muted">+251</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                className="w-full rounded-r-xl px-3 py-3 outline-none"
                placeholder="900000000"
              />
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-blue-tint px-4 py-3 outline-none focus:ring-2 focus:ring-electric"
              placeholder={t("auth.password")}
            />

            <div className="rounded-xl bg-blue-tint p-3 text-sm font-bold text-navy">
              💡 Demo login: any seeded user phone (e.g. +251900000000) with password &quot;DemoPass123!&quot;
            </div>

            {error && (
              <div className="rounded-xl bg-live/10 p-3 text-sm font-bold text-live">{error}</div>
            )}

            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? t("common.loading") : t("auth.login")}
            </Button>

            <p className="text-center text-sm font-semibold text-muted">
              {t("auth.noAccount")}{" "}
              <Link href="/register" className="font-bold text-electric hover:underline">
                {t("auth.register")}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
