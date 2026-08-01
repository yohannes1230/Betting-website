"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/Shell";
import { Card, LiveBadge, SkeletonRow, TeamLogo } from "@/components/ui";
import { BetSlipPanel } from "@/components/betslip/BetSlipPanel";
import { OddsButton } from "@/components/sportsbook/OddsButton";
import { useI18n } from "@/lib/i18n";
import { Trophy, ChevronRight, Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { Sport } from "@/lib/the-odds-api";

type OddsData = { id: string; matchId: string; marketName: string; selection: string; value: string };
type MatchData = {
  id: string; league: string; homeTeam: string; awayTeam: string; isLive: boolean;
  minute?: number; homeScore?: number; awayScore?: number; startTime: string; status: string;
  odds: OddsData[];
  events: Array<{ id: string; minute: number; type: string; description: string }>;
};

// ─── Country → League mapping (static, covers all DEFAULT_SPORT_KEYS) ────────
type CountryGroup = {
  country: string;
  flag: string;
  sportKeys: string[];   // matches sport.key values from the API
  pinned?: boolean;
};

const FOOTBALL_COUNTRIES: CountryGroup[] = [
  { country: "Ethiopia",       flag: "🇪🇹", sportKeys: ["soccer_ethiopia", "Ethiopian Premier League"], pinned: true },
  { country: "England",        flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", sportKeys: ["soccer_epl"] },
  { country: "Spain",          flag: "🇪🇸", sportKeys: ["soccer_spain_la_liga"] },
  { country: "Germany",        flag: "🇩🇪", sportKeys: ["soccer_germany_bundesliga", "soccer_austria_bundesliga"].filter(k => k === "soccer_germany_bundesliga") },
  { country: "Italy",          flag: "🇮🇹", sportKeys: ["soccer_italy_serie_a"] },
  { country: "France",         flag: "🇫🇷", sportKeys: ["soccer_france_ligue_one"] },
  { country: "Portugal",       flag: "🇵🇹", sportKeys: ["soccer_portugal_primeira_liga"] },
  { country: "Netherlands",    flag: "🇳🇱", sportKeys: ["soccer_netherlands_eredivisie"] },
  { country: "Turkey",         flag: "🇹🇷", sportKeys: ["soccer_turkey_super_league"] },
  { country: "Belgium",        flag: "🇧🇪", sportKeys: ["soccer_belgium_first_div"] },
  { country: "Scotland",       flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", sportKeys: ["soccer_scotland_premiership"] },
  { country: "Switzerland",    flag: "🇨🇭", sportKeys: ["soccer_switzerland_superleague"] },
  { country: "Austria",        flag: "🇦🇹", sportKeys: ["soccer_austria_bundesliga"] },
  { country: "Greece",         flag: "🇬🇷", sportKeys: ["soccer_greece_super_league"] },
  { country: "Poland",         flag: "🇵🇱", sportKeys: ["soccer_poland_ekstraklasa"] },
  { country: "Czech Republic", flag: "🇨🇿", sportKeys: ["soccer_czech_football_league"] },
  { country: "Croatia",        flag: "🇭🇷", sportKeys: ["soccer_croatia_hnl"] },
  { country: "Denmark",        flag: "🇩🇰", sportKeys: ["soccer_denmark_superliga"] },
  { country: "Sweden",         flag: "🇸🇪", sportKeys: ["soccer_sweden_allsvenskan"] },
  { country: "Norway",         flag: "🇳🇴", sportKeys: ["soccer_norway_eliteserien"] },
  { country: "Finland",        flag: "🇫🇮", sportKeys: ["soccer_finland_veikkausliiga"] },
  { country: "USA",            flag: "🇺🇸", sportKeys: ["soccer_usa_mls"] },
  { country: "Brazil",         flag: "🇧🇷", sportKeys: ["soccer_brazil_serie_a"] },
  { country: "Argentina",      flag: "🇦🇷", sportKeys: ["soccer_argentina_primera_division"] },
  { country: "Mexico",         flag: "🇲🇽", sportKeys: ["soccer_mexico_ligamx"] },
  { country: "Saudi Arabia",   flag: "🇸🇦", sportKeys: ["soccer_spl"] },
  { country: "China",          flag: "🇨🇳", sportKeys: ["soccer_china_superleague"] },
  { country: "Japan",          flag: "🇯🇵", sportKeys: ["soccer_japan_j_league"] },
  { country: "South Korea",    flag: "🇰🇷", sportKeys: ["soccer_korea_kleague1"] },
  { country: "Australia",      flag: "🇦🇺", sportKeys: ["soccer_australia_aleague"] },
  { country: "Ireland",        flag: "🇮🇪", sportKeys: ["soccer_league_of_ireland"] },
  { country: "International",  flag: "🌍", sportKeys: ["soccer_uefa_champs_league", "soccer_uefa_europa_league", "soccer_conmebol_libertadores", "soccer_conmebol_copa_sudamericana"] },
  { country: "Africa",         flag: "🌍", sportKeys: ["soccer_caf_champions_league"] },
];

// Pretty names for sport keys
const SPORT_KEY_LABELS: Record<string, string> = {
  "soccer_epl":                           "Premier League",
  "soccer_spain_la_liga":                 "La Liga",
  "soccer_germany_bundesliga":            "Bundesliga",
  "soccer_italy_serie_a":                 "Serie A",
  "soccer_france_ligue_one":              "Ligue 1",
  "soccer_uefa_champs_league":            "Champions League",
  "soccer_uefa_europa_league":            "Europa League",
  "soccer_portugal_primeira_liga":        "Primeira Liga",
  "soccer_netherlands_eredivisie":        "Eredivisie",
  "soccer_turkey_super_league":           "Süper Lig",
  "soccer_belgium_first_div":             "Pro League",
  "soccer_scotland_premiership":          "Premiership",
  "soccer_switzerland_superleague":       "Super League",
  "soccer_austria_bundesliga":            "Bundesliga",
  "soccer_greece_super_league":           "Super League",
  "soccer_poland_ekstraklasa":            "Ekstraklasa",
  "soccer_czech_football_league":         "First League",
  "soccer_croatia_hnl":                   "HNL",
  "soccer_denmark_superliga":             "Superliga",
  "soccer_sweden_allsvenskan":            "Allsvenskan",
  "soccer_norway_eliteserien":            "Eliteserien",
  "soccer_finland_veikkausliiga":         "Veikkausliiga",
  "soccer_usa_mls":                       "MLS",
  "soccer_brazil_serie_a":               "Série A",
  "soccer_argentina_primera_division":    "Primera División",
  "soccer_mexico_ligamx":                "Liga MX",
  "soccer_spl":                           "Pro League",
  "soccer_china_superleague":            "Super League",
  "soccer_japan_j_league":               "J-League",
  "soccer_korea_kleague1":               "K-League",
  "soccer_australia_aleague":            "A-League",
  "soccer_league_of_ireland":            "League of Ireland",
  "soccer_conmebol_libertadores":        "Copa Libertadores",
  "soccer_conmebol_copa_sudamericana":   "Copa Sudamericana",
  "soccer_caf_champions_league":         "CAF Champions League",
};

const LEAGUE_ICONS: Record<string, string> = {
  "Ethiopia": "🇪🇹",
  "EPL": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "English Premier": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "La Liga": "🇪🇸",
  "Serie A": "🇮🇹",
  "Bundesliga": "🇩🇪",
  "Ligue 1": "🇫🇷",
  "MLS": "🇺🇸",
  "Champions League": "🌍",
};

function getLeagueIcon(title: string) {
  for (const [key, icon] of Object.entries(LEAGUE_ICONS)) {
    if (title.includes(key)) return icon;
  }
  return "⚽";
}

// ─── Country Accordion Item ────────────────────────────────────────────────
function CountryAccordionItem({
  group,
  sportsInGroup,
  leagueFilter,
  onSelect,
  defaultOpen,
}: {
  group: CountryGroup;
  sportsInGroup: Sport[];
  leagueFilter: string | null;
  onSelect?: () => void;
  defaultOpen?: boolean;
}) {
  const isActiveInGroup = sportsInGroup.some((s) => s.key === leagueFilter);
  const [open, setOpen] = useState(defaultOpen || isActiveInGroup);

  if (sportsInGroup.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden">
      {/* Country header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-bold transition text-left min-h-[48px] ${
          isActiveInGroup
            ? "bg-electric/15 text-white"
            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
        }`}
      >
        <span className="text-base leading-none shrink-0">{group.flag}</span>
        <span className="flex-1 font-bold">{group.country}</span>
        {sportsInGroup.length > 1 && (
          <span className="text-[10px] font-mono text-text-muted bg-white/8 px-1.5 py-0.5 rounded shrink-0">
            {sportsInGroup.length}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform opacity-50 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* League list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pl-6 pb-1 flex flex-col gap-0.5">
              {sportsInGroup.map((sport) => {
                const isActive = leagueFilter === sport.key;
                const label = SPORT_KEY_LABELS[sport.key] || sport.title;
                return (
                  <Link
                    key={sport.key}
                    href={`/sports?league=${encodeURIComponent(sport.key)}`}
                    onClick={onSelect}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition min-h-[44px] ${
                      isActive
                        ? "bg-electric text-white shadow-md shadow-electric/20 font-bold"
                        : "text-text-secondary hover:bg-white/8 hover:text-text-primary"
                    }`}
                  >
                    {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
                    <span className="flex-1 leading-tight">{label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sports Nav Panel (shared by mobile drawer + desktop sidebar) ───────────
function SportsNavPanel({
  sports,
  leagueFilter,
  selectedGroup,
  groups,
  onGroupChange,
  onLeagueSelect,
}: {
  sports: Sport[];
  leagueFilter: string | null;
  selectedGroup: string;
  groups: string[];
  onGroupChange: (g: string) => void;
  onLeagueSelect?: () => void;
}) {
  const isSoccer = selectedGroup === "Soccer" || selectedGroup === "soccer" || groups.length === 0 || selectedGroup === groups[0];

  // Build the list of sports in the current group
  const activeSports = sports.filter((s) => s.group === selectedGroup);

  // For soccer: build country-grouped structure
  const countryGroupsWithSports = isSoccer
    ? FOOTBALL_COUNTRIES.map((cg) => ({
        group: cg,
        sports: activeSports.filter((s) => cg.sportKeys.includes(s.key)),
      })).filter((item) => item.sports.length > 0)
    : [];

  // Sports not assigned to any country group
  const assignedKeys = new Set(FOOTBALL_COUNTRIES.flatMap((cg) => cg.sportKeys));
  const ungroupedSports = activeSports.filter((s) => !assignedKeys.has(s.key));

  return (
    <div className="flex flex-col gap-1 h-full">
      {/* Sport type tabs */}
      {groups.length > 1 && (
        <div className="flex gap-1.5 flex-wrap mb-3 pb-3 border-b border-white/8">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => onGroupChange(g)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition min-h-[40px] ${
                selectedGroup === g
                  ? "bg-electric text-white shadow-md shadow-electric/20"
                  : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white"
              }`}
            >
              {g === "Soccer" || g === "soccer" ? "⚽" : g === "Basketball" ? "🏀" : g === "Tennis" ? "🎾" : "🏅"} {g}
            </button>
          ))}
        </div>
      )}

      {/* All leagues link */}
      <Link
        href="/sports"
        onClick={onLeagueSelect}
        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition min-h-[48px] ${
          !leagueFilter
            ? "bg-electric text-white shadow-md shadow-electric/20"
            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
        }`}
      >
        <span className="text-base leading-none">🔥</span>
        <span className="flex-1">All Leagues</span>
        {!leagueFilter && <Check className="h-4 w-4 shrink-0" />}
      </Link>

      {/* Country accordion groups (football) */}
      {isSoccer && countryGroupsWithSports.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {countryGroupsWithSports.map(({ group, sports: sportsInGroup }) => (
            <CountryAccordionItem
              key={group.country}
              group={group}
              sportsInGroup={sportsInGroup}
              leagueFilter={leagueFilter}
              onSelect={onLeagueSelect}
              defaultOpen={group.pinned}
            />
          ))}
        </div>
      )}

      {/* Non-soccer or ungrouped sports: flat list */}
      {(!isSoccer || ungroupedSports.length > 0) && (
        <div className="flex flex-col gap-0.5 mt-1">
          {(isSoccer ? ungroupedSports : activeSports).map((sport) => {
            const isActive = leagueFilter === sport.key;
            return (
              <Link
                key={sport.key}
                href={`/sports?league=${encodeURIComponent(sport.key)}`}
                onClick={onLeagueSelect}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition min-h-[48px] ${
                  isActive
                    ? "bg-electric text-white shadow-md shadow-electric/20 font-bold"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs shrink-0">
                  {getLeagueIcon(sport.title)}
                </div>
                <span className="flex-1 truncate" title={sport.title}>{sport.title}</span>
                {isActive && <Check className="h-4 w-4 shrink-0" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Mobile League Drawer ──────────────────────────────────────────────────
function MobileLeagueDrawer({
  open,
  onClose,
  sports,
  leagueFilter,
  selectedGroup,
  groups,
  onGroupChange,
}: {
  open: boolean;
  onClose: () => void;
  sports: Sport[];
  leagueFilter: string | null;
  selectedGroup: string;
  groups: string[];
  onGroupChange: (g: string) => void;
}) {
  // Get selected league label for display
  const selectedSport = sports.find((s) => s.key === leagueFilter);
  const selectedCountry = leagueFilter
    ? FOOTBALL_COUNTRIES.find((cg) => cg.sportKeys.includes(leagueFilter))
    : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
            style={{ maxHeight: "82dvh" }}
          >
            <div className="bg-[#12151C] rounded-t-2xl border-t border-white/10 flex flex-col overflow-hidden" style={{ maxHeight: "82dvh" }}>
              {/* Drawer handle + header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-1 rounded-full bg-white/20 absolute left-1/2 -translate-x-1/2 top-2" />
                  <Trophy className="h-4 w-4 text-electric" />
                  <span className="text-sm font-black text-white">Select League</span>
                  {selectedSport && selectedCountry && (
                    <span className="flex items-center gap-1 rounded-full bg-electric/20 text-electric px-2 py-0.5 text-xs font-bold">
                      {selectedCountry.flag} {SPORT_KEY_LABELS[selectedSport.key] || selectedSport.title}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/8 text-text-muted hover:bg-white/15 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 px-3 py-3 pb-safe">
                <SportsNavPanel
                  sports={sports}
                  leagueFilter={leagueFilter}
                  selectedGroup={selectedGroup}
                  groups={groups}
                  onGroupChange={onGroupChange}
                  onLeagueSelect={onClose}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main sports content ────────────────────────────────────────────────────
function SportsContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leagueFilter = searchParams.get("league");
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("Soccer");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"prematch" | "live">("prematch");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/sports")
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setSports(arr);
        if (arr.length > 0 && !arr.some((s: Sport) => s.group === selectedGroup)) {
          setSelectedGroup(arr[0].group);
        }
      })
      .catch(console.error);
  }, []);

  const groups = Array.from(new Set(sports.map((s) => s.group))).sort();

  const fetchMatches = useCallback(() => {
    const params = new URLSearchParams();
    if (leagueFilter) params.set("league", leagueFilter);
    fetch(`/api/matches?${params}`)
      .then((r) => r.json())
      .then((data) => { setMatches(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [leagueFilter]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  useEffect(() => {
    const id = setInterval(fetchMatches, 4000);
    return () => clearInterval(id);
  }, [fetchMatches]);

  const filtered = matches.filter((m) =>
    tab === "live" ? m.isLive : !m.isLive,
  );

  // Derive selected league display label for mobile button
  const selectedSport = sports.find((s) => s.key === leagueFilter);
  const selectedCountry = leagueFilter
    ? FOOTBALL_COUNTRIES.find((cg) => cg.sportKeys.includes(leagueFilter))
    : null;
  const activeLeagueLabel = selectedSport
    ? `${selectedCountry?.flag ?? "⚽"} ${SPORT_KEY_LABELS[selectedSport.key] || selectedSport.title}`
    : "⚽ All Leagues";

  return (
    <>
      <div className="mx-auto grid max-w-[1400px] gap-4 px-4 py-5 lg:grid-cols-[260px_1fr_320px]">

        {/* ── Desktop Left Sidebar ─────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-4 sticky top-20 max-h-[calc(100vh-6rem)]">
          <Card className="p-3 overflow-y-auto flex-1 no-scrollbar">
            <h3 className="mb-3 px-3 text-xs font-black uppercase text-text-muted tracking-wider">
              Sports &amp; Leagues
            </h3>
            <SportsNavPanel
              sports={sports}
              leagueFilter={leagueFilter}
              selectedGroup={selectedGroup}
              groups={groups}
              onGroupChange={setSelectedGroup}
            />
          </Card>
          <Card className="p-4 bg-gradient-to-br from-gold/20 to-bg-card border-gold/10 flex flex-col items-center justify-center text-center shrink-0">
            <Trophy className="h-8 w-8 text-gold mb-2" />
            <h4 className="font-black text-text-primary">Tournament</h4>
            <p className="text-xs text-text-muted mt-1">Join the weekly leaderboard!</p>
          </Card>
        </aside>

        {/* ── Center Content ───────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* ── Mobile: League Selector Button + active league badge ───── */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2.5 flex-1 rounded-xl bg-[#181C24] border border-white/10 px-4 py-3 text-sm font-bold text-text-primary hover:bg-white/8 hover:border-white/20 transition active:scale-[0.98] min-h-[48px]"
            >
              <SlidersHorizontal className="h-4 w-4 text-electric shrink-0" />
              <span className="flex-1 text-left truncate">{activeLeagueLabel}</span>
              <ChevronDown className="h-4 w-4 text-text-muted shrink-0" />
            </button>

            {leagueFilter && (
              <Link
                href="/sports"
                className="flex items-center justify-center h-[48px] w-[48px] rounded-xl bg-white/5 border border-white/10 text-text-muted hover:bg-white/10 hover:text-white transition shrink-0"
                title="Clear filter"
              >
                <X className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* ── Pre-match / Live tabs ────────────────────────────────── */}
          <div className="flex gap-2 border-b border-white/10 pb-4">
            <button
              onClick={() => setTab("prematch")}
              className={`rounded-full px-6 py-2 text-sm font-black transition ${
                tab === "prematch"
                  ? "bg-white text-bg-deep"
                  : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary"
              }`}
            >
              {t("sports.prematch")}
            </button>
            <button
              onClick={() => setTab("live")}
              className={`rounded-full px-6 py-2 text-sm font-black transition ${
                tab === "live"
                  ? "bg-live text-white shadow-lg shadow-live/20"
                  : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
                </span>
                {t("sports.liveNow")}
              </span>
            </button>
          </div>

          {/* ── Match list ──────────────────────────────────────────── */}
          {loading ? (
            <SkeletonRow rows={5} />
          ) : filtered.length === 0 ? (
            <Card>
              <p className="py-8 text-center text-sm font-semibold text-text-muted">
                {tab === "live" ? t("sports.noLive") : "No matches found for this filter."}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((match, i) => {
                const matchOdds = match.odds.filter((o) => o.marketName === "Match Result").slice(0, 3);
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Card className="flex flex-col gap-3 p-3 sm:p-4 transition-all hover:bg-white/5 border-l-4 border-l-transparent hover:border-l-electric" glow={match.isLive}>
                      <div className="flex-1 min-w-0 flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-center gap-2 w-10 shrink-0">
                          <TeamLogo name={match.homeTeam} size="sm" />
                          <TeamLogo name={match.awayTeam} size="sm" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-text-muted mb-1">
                            <span className="flex items-center gap-1 text-electric truncate">
                              <span>{getLeagueIcon(match.league)}</span>
                              {match.league}
                            </span>
                            <span className="text-white/20">•</span>
                            {match.isLive ? (
                              <LiveBadge />
                            ) : (
                              <span className="text-text-dim">
                                {new Date(match.startTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          <Link href={`/sports/match/${match.id}`} className="group block">
                            <div className="flex items-center justify-between text-sm md:text-base font-black text-text-primary group-hover:text-electric transition">
                              <span>{match.homeTeam}</span>
                              {match.isLive && <span className="text-gold tabular">{match.homeScore ?? 0}</span>}
                            </div>
                            <div className="flex items-center justify-between text-sm md:text-base font-black text-text-primary mt-1 group-hover:text-electric transition">
                              <span>{match.awayTeam}</span>
                              {match.isLive && <span className="text-gold tabular">{match.awayScore ?? 0}</span>}
                            </div>
                          </Link>
                          {match.isLive && (
                            <div className="mt-1 text-xs font-semibold text-live">
                              {match.minute}&apos;
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 flex-1 lg:flex-none">
                          {matchOdds.map((odd) => (
                            <div key={odd.id} className="min-w-0">
                              <OddsButton odd={odd} match={match} />
                            </div>
                          ))}
                        </div>
                        <Link
                          href={`/sports/match/${match.id}`}
                          className="hidden lg:flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-white/5 transition hover:bg-white/10 shrink-0"
                          title={`+${match.odds.length} markets`}
                        >
                          <ChevronRight className="h-4 w-4 text-text-muted" />
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Desktop bet slip ─────────────────────────────────────────── */}
        <aside className="hidden lg:block relative">
          <div className="sticky top-[88px]">
            <BetSlipPanel />
          </div>
        </aside>
      </div>

      {/* ── Mobile bet slip — above bottom nav ──────────────────────────── */}
      <div className="fixed inset-x-0 bottom-[4.5rem] z-30 border-t border-white/5 bg-bg-card/95 backdrop-blur-lg p-3 shadow-2xl lg:hidden">
        <BetSlipPanel compact />
      </div>

      {/* ── Mobile league drawer ─────────────────────────────────────────── */}
      <MobileLeagueDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sports={sports}
        leagueFilter={leagueFilter}
        selectedGroup={selectedGroup}
        groups={groups}
        onGroupChange={setSelectedGroup}
      />
    </>
  );
}

export default function SportsPage() {
  return (
    <Shell>
      <Suspense fallback={<div className="p-8"><SkeletonRow rows={5} /></div>}>
        <SportsContent />
      </Suspense>
    </Shell>
  );
}
