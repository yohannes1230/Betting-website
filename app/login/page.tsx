"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Lock, Zap, Eye, EyeOff } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, "");
    if (digits.startsWith("251")) digits = digits.slice(3);
    else if (digits.startsWith("0")) digits = digits.slice(1);
    setPhone(digits.slice(0, 9));
  };

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
        <Card glow>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric/10">
            <Lock className="h-6 w-6 text-electric" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-text-primary">{t("auth.login")}</h1>

          <div className="mt-5 space-y-3">
            <div className="flex rounded-xl border border-white/10 bg-white/5">
              <span className="px-4 py-3 font-black text-text-muted">+251</span>
              <input
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full rounded-r-xl bg-transparent px-3 py-3 text-text-primary outline-none placeholder:text-text-dim tabular-nums"
                placeholder="900000000"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-text-primary outline-none transition focus:border-electric/40 focus:ring-2 focus:ring-electric/20 placeholder:text-text-dim"
                placeholder={t("auth.password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="rounded-xl bg-electric/10 border border-electric/20 p-3 text-sm font-bold text-electric">
              💡 Demo login: Phone <span className="font-black">900000000</span> — Password <span className="font-black">DemoPass123!</span>
            </div>

            {error && (
              <div className="rounded-xl bg-live/10 border border-live/20 p-3 text-sm font-bold text-live">{error}</div>
            )}

            <Button className="w-full" onClick={handleLogin} disabled={loading} variant="gold">
              <Zap className="h-4 w-4" />
              {loading ? t("common.loading") : t("auth.login")}
            </Button>

            <p className="text-center text-sm font-semibold text-text-muted">
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
