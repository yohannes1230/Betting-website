"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui";

const DEMO_GAMES: Record<string, { url: string; titleKey: string }> = {
  "sweet-bonanza": {
    url: "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitsw&websiteUrl=https%3A%2F%2Fpragmaticplay.com&jurisdiction=99&lang=en",
    titleKey: "sweetBonanza",
  },
  "gates-of-olympus": {
    url: "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate&websiteUrl=https%3A%2F%2Fpragmaticplay.com&jurisdiction=99&lang=en",
    titleKey: "gatesOfOlympus",
  },
  "sugar-rush": {
    url: "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20sugarrush&websiteUrl=https%3A%2F%2Fpragmaticplay.com&jurisdiction=99&lang=en",
    titleKey: "sugarRush",
  },
};

export default function VirtualGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();

  const game = DEMO_GAMES[id];
  if (!game) return notFound();

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/games"
            className="flex w-fit items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-text-secondary transition hover:bg-white/10 hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-text-primary">{t(`games.${game.titleKey}`)}</h1>
            <span className="rounded bg-gradient-to-r from-pink-500 to-rose-400 px-2 py-0.5 text-[10px] font-black text-white">
              DEMO MODE
            </span>
          </div>
        </div>

        <Card className="flex-1 w-full overflow-hidden border border-white/10 bg-black/50 shadow-2xl rounded-2xl relative">
          <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm font-bold z-0">
            {t("common.loading")}
          </div>
          <iframe
            src={game.url}
            className="relative z-10 w-full h-full border-none"
            allow="autoplay; fullscreen"
          />
        </Card>
      </div>
    </Shell>
  );
}
