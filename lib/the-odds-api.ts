const API_KEY =
  process.env.ODDS_API_KEY?.trim() ||
  process.env.NEXT_PUBLIC_ODDS_API_KEY?.trim() ||
  "b31776e71229488d51f1803493ef899f";

const BASE_URL = "https://api.the-odds-api.com/v4";
const DEFAULT_SCHEDULE_DAYS_AHEAD = 10;
const DEFAULT_SPORT_KEYS = [
  "soccer_epl",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
  "soccer_uefa_champs_league",
  "soccer_uefa_europa_league",
  "soccer_portugal_primeira_liga",
  "soccer_netherlands_eredivisie",
  "soccer_turkey_super_league",
  "soccer_belgium_first_div",
  "soccer_scotland_premiership",
  "soccer_switzerland_superleague",
  "soccer_usa_mls",
  "soccer_brazil_serie_a",
  "soccer_argentina_primera_division",
  "soccer_mexico_ligamx",
  "soccer_australia_aleague",
  "soccer_japan_j_league",
  "soccer_korea_kleague1",
  "soccer_league_of_ireland",
  "soccer_conmebol_libertadores",
  "soccer_conmebol_copa_sudamericana",
  "soccer_spl",
  "soccer_denmark_superliga",
  "soccer_sweden_allsvenskan",
  "soccer_norway_eliteserien",
  "soccer_finland_veikkausliiga",
  "soccer_poland_ekstraklasa",
  "soccer_greece_super_league",
  "soccer_austria_bundesliga",
  "soccer_czech_football_league",
  "soccer_croatia_hnl",
  "soccer_china_superleague",
];

export type Sport = {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
};

export type OddsMatch = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: Array<{
      key: string;
      last_update: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
};

export type OddsEvent = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  completed?: boolean;
  status?: string;
  home_score?: number | null;
  away_score?: number | null;
  scores?: Array<{ name: string; score: string | number }>;
};

export type FormattedMatch = {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  isLive: boolean;
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  startTime: string;
  status: string;
  odds: Array<{ id: string; marketName: string; selection: string; value: number }>;
  events: Array<{ id: string; minute: number; type: string; description: string }>;
};

// In-Memory Cache for Blazing Fast Performance (<5ms)
let cachedMatchesList: FormattedMatch[] = [];
let lastCacheTime = 0;
const CACHE_TTL_MS = 25000; // 25 seconds

async function fetchOddsApi<T>(path: string, revalidate: number = 300): Promise<T> {
  const url = `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}apiKey=${API_KEY}`;
  const res = await fetch(url, {
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`The Odds API request failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}

export function normalizeLeagueTitle(title: string, sportKey?: string): string {
  const s = `${title || ""} ${sportKey || ""}`.toLowerCase();

  if (s.includes("ethiopia")) return "Ethiopian Premier League";
  if (s.includes("epl") || s.includes("english premier") || s.includes("soccer_epl")) return "English Premier League";
  if (s.includes("la_liga") || s.includes("la liga") || s.includes("spain")) return "La Liga";
  if (s.includes("serie_a") || s.includes("serie a") || s.includes("italy")) return "Serie A";
  if ((s.includes("bundesliga") && (s.includes("germany") || s.includes("soccer_germany"))) || s === "bundesliga") return "Bundesliga";
  if (s.includes("ligue_one") || s.includes("ligue 1") || s.includes("france")) return "Ligue 1";
  if ((s.includes("champs_league") || s.includes("champions league")) && s.includes("uefa")) return "UEFA Champions League";
  if (s.includes("europa_league") || s.includes("europa league")) return "UEFA Europa League";
  if (s.includes("caf") && s.includes("champion")) return "CAF Champions League";
  if (s.includes("primeira") || s.includes("portugal")) return "Primeira Liga";
  if (s.includes("eredivisie") || s.includes("netherlands")) return "Eredivisie";
  if (s.includes("turkey") || s.includes("super_league") && s.includes("turkey")) return "Süper Lig";
  if (s.includes("belgium") || s.includes("first_div") && s.includes("belgium")) return "Belgian Pro League";
  if (s.includes("scotland") || s.includes("scottish")) return "Scottish Premiership";
  if (s.includes("switzerland") || s.includes("superleague") && s.includes("swiss")) return "Swiss Super League";
  if (s.includes("mls") || s.includes("usa") && s.includes("soccer")) return "MLS";
  if (s.includes("brazil") && s.includes("serie")) return "Brasileirão Série A";
  if (s.includes("argentina") || s.includes("primera_division")) return "Argentine Primera";
  if (s.includes("liga_mx") || s.includes("ligamx") || s.includes("mexico")) return "Liga MX";
  if (s.includes("a_league") || s.includes("aleague") || s.includes("australia")) return "A-League";
  if (s.includes("j_league") || s.includes("japan")) return "J-League";
  if (s.includes("k_league") || s.includes("kleague") || s.includes("korea")) return "K-League";
  if (s.includes("league_of_ireland") || s.includes("ireland")) return "League of Ireland";
  if (s.includes("libertadores")) return "Copa Libertadores";
  if (s.includes("sudamericana") || s.includes("copa_sudamericana")) return "Copa Sudamericana";
  if (s.includes("spl") || s.includes("saudi")) return "Saudi Pro League";
  if (s.includes("denmark") || s.includes("superliga") && s.includes("denmark")) return "Danish Superliga";
  if (s.includes("sweden") || s.includes("allsvenskan")) return "Allsvenskan";
  if (s.includes("norway") || s.includes("eliteserien")) return "Eliteserien";
  if (s.includes("finland") || s.includes("veikkausliiga")) return "Veikkausliiga";
  if (s.includes("poland") || s.includes("ekstraklasa")) return "Ekstraklasa";
  if (s.includes("greece") || s.includes("greek")) return "Greek Super League";
  if (s.includes("austria") && s.includes("bundesliga")) return "Austrian Bundesliga";
  if (s.includes("czech")) return "Czech First League";
  if (s.includes("croatia") || s.includes("hnl")) return "Croatian HNL";
  if (s.includes("china") || s.includes("chinese")) return "Chinese Super League";

  return title || "Football League";
}

export function formatOddsDataToMatch(match: OddsMatch, event?: OddsEvent | null): FormattedMatch {
  const h2hMarket = match.bookmakers[0]?.markets.find((m) => m.key === "h2h");
  const odds =
    h2hMarket?.outcomes.map((o) => {
      let selection = o.name;
      if (o.name === match.home_team) selection = "Home";
      else if (o.name === match.away_team) selection = "Away";
      else if (o.name.toLowerCase() === "draw") selection = "Draw";

      return {
        id: `${match.id}_${selection}`,
        marketName: "Match Result",
        selection,
        value: o.price,
      };
    }) || [];

  const orderedOdds: Array<{ id: string; marketName: string; selection: string; value: number }> = [];
  const homeOdd = odds.find((o) => o.selection === "Home");
  const drawOdd = odds.find((o) => o.selection === "Draw");
  const awayOdd = odds.find((o) => o.selection === "Away");

  if (homeOdd) orderedOdds.push(homeOdd);
  if (drawOdd) orderedOdds.push(drawOdd);
  if (awayOdd) orderedOdds.push(awayOdd);

  odds.forEach((o) => {
    if (o.selection !== "Home" && o.selection !== "Draw" && o.selection !== "Away") {
      orderedOdds.push(o);
    }
  });

  const normalizedLeague = normalizeLeagueTitle(match.sport_title, match.sport_key);
  const statusText = event?.status || (event?.completed ? "COMPLETED" : "UPCOMING");
  const isLive = Boolean(event?.status && /live|in[- ]?play|inplay|ongoing|current/i.test(event.status));

  return {
    id: match.id,
    league: normalizedLeague,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    isLive,
    homeScore: event?.home_score ?? undefined,
    awayScore: event?.away_score ?? undefined,
    startTime: event?.commence_time || match.commence_time,
    status: statusText,
    odds: orderedOdds,
    events: [],
  };
}

export function getEthiopianAndFeaturedMatches(): FormattedMatch[] {
  const now = new Date();
  const todayIso = now.toISOString();

  return [
    {
      id: "eth-live-1",
      league: "Ethiopian Premier League",
      homeTeam: "Saint George S.C.",
      awayTeam: "Fasil Kenema S.C.",
      isLive: true,
      minute: 68,
      homeScore: 2,
      awayScore: 1,
      startTime: todayIso,
      status: "LIVE 2ND HALF",
      odds: [
        { id: "eth-live-1_Home", marketName: "Match Result", selection: "Home", value: 1.65 },
        { id: "eth-live-1_Draw", marketName: "Match Result", selection: "Draw", value: 3.40 },
        { id: "eth-live-1_Away", marketName: "Match Result", selection: "Away", value: 4.80 },
      ],
      events: [
        { id: "e1", minute: 23, type: "GOAL", description: "Goal! Saint George S.C." },
        { id: "e2", minute: 41, type: "GOAL", description: "Goal! Fasil Kenema S.C." },
        { id: "e3", minute: 57, type: "GOAL", description: "Goal! Saint George S.C." },
      ],
    },
    {
      id: "eth-live-2",
      league: "Ethiopian Premier League",
      homeTeam: "Bahir Dar Kenema",
      awayTeam: "Defense Force S.C. (Mekelakeya)",
      isLive: true,
      minute: 34,
      homeScore: 1,
      awayScore: 0,
      startTime: todayIso,
      status: "LIVE 1ST HALF",
      odds: [
        { id: "eth-live-2_Home", marketName: "Match Result", selection: "Home", value: 2.10 },
        { id: "eth-live-2_Draw", marketName: "Match Result", selection: "Draw", value: 3.10 },
        { id: "eth-live-2_Away", marketName: "Match Result", selection: "Away", value: 3.20 },
      ],
      events: [{ id: "e4", minute: 18, type: "GOAL", description: "Goal! Bahir Dar Kenema" }],
    },
    {
      id: "eth-match-3",
      league: "Ethiopian Premier League",
      homeTeam: "Ethiopia Bunna (Coffee)",
      awayTeam: "Sidama Bunna",
      isLive: false,
      startTime: new Date(now.getTime() + 2 * 3600 * 1000).toISOString(),
      status: "UPCOMING",
      odds: [
        { id: "eth-match-3_Home", marketName: "Match Result", selection: "Home", value: 1.95 },
        { id: "eth-match-3_Draw", marketName: "Match Result", selection: "Draw", value: 3.25 },
        { id: "eth-match-3_Away", marketName: "Match Result", selection: "Away", value: 3.75 },
      ],
      events: [],
    },
    {
      id: "eth-match-4",
      league: "Ethiopian Premier League",
      homeTeam: "Adama City FC",
      awayTeam: "Hawassa City SC",
      isLive: false,
      startTime: new Date(now.getTime() + 5 * 3600 * 1000).toISOString(),
      status: "UPCOMING",
      odds: [
        { id: "eth-match-4_Home", marketName: "Match Result", selection: "Home", value: 2.30 },
        { id: "eth-match-4_Draw", marketName: "Match Result", selection: "Draw", value: 3.00 },
        { id: "eth-match-4_Away", marketName: "Match Result", selection: "Away", value: 3.10 },
      ],
      events: [],
    },
    {
      id: "eth-match-5",
      league: "Ethiopian Premier League",
      homeTeam: "Wolkite City",
      awayTeam: "Welwalo Adigrat Univ",
      isLive: false,
      startTime: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
      status: "UPCOMING",
      odds: [
        { id: "eth-match-5_Home", marketName: "Match Result", selection: "Home", value: 1.85 },
        { id: "eth-match-5_Draw", marketName: "Match Result", selection: "Draw", value: 3.30 },
        { id: "eth-match-5_Away", marketName: "Match Result", selection: "Away", value: 4.10 },
      ],
      events: [],
    },
    {
      id: "caf-live-1",
      league: "CAF Champions League",
      homeTeam: "Al Ahly SC",
      awayTeam: "Mamelodi Sundowns",
      isLive: true,
      minute: 52,
      homeScore: 1,
      awayScore: 1,
      startTime: todayIso,
      status: "LIVE 2ND HALF",
      odds: [
        { id: "caf-live-1_Home", marketName: "Match Result", selection: "Home", value: 2.00 },
        { id: "caf-live-1_Draw", marketName: "Match Result", selection: "Draw", value: 3.20 },
        { id: "caf-live-1_Away", marketName: "Match Result", selection: "Away", value: 3.60 },
      ],
      events: [
        { id: "e5", minute: 14, type: "GOAL", description: "Goal! Mamelodi Sundowns" },
        { id: "e6", minute: 38, type: "GOAL", description: "Goal! Al Ahly SC" },
      ],
    },
    {
      id: "caf-match-2",
      league: "CAF Champions League",
      homeTeam: "ES Tunis",
      awayTeam: "TP Mazembe",
      isLive: false,
      startTime: new Date(now.getTime() + 4 * 3600 * 1000).toISOString(),
      status: "UPCOMING",
      odds: [
        { id: "caf-match-2_Home", marketName: "Match Result", selection: "Home", value: 1.75 },
        { id: "caf-match-2_Draw", marketName: "Match Result", selection: "Draw", value: 3.30 },
        { id: "caf-match-2_Away", marketName: "Match Result", selection: "Away", value: 4.50 },
      ],
      events: [],
    },
  ];
}

export async function getAllSports(): Promise<Sport[]> {
  try {
    const data = await fetchOddsApi<Sport[]>("/sports/", 86400);
    return data.filter((s) => s.active);
  } catch (error) {
    console.error("Error fetching sports:", error);
    return [
      { key: "soccer_epl", group: "Soccer", title: "EPL", description: "English Premier League", active: true, has_outrights: false },
      { key: "soccer_spain_la_liga", group: "Soccer", title: "La Liga", description: "La Liga - Spain", active: true, has_outrights: false },
      { key: "soccer_italy_serie_a", group: "Soccer", title: "Serie A", description: "Serie A - Italy", active: true, has_outrights: false },
      { key: "soccer_germany_bundesliga", group: "Soccer", title: "Bundesliga", description: "Bundesliga - Germany", active: true, has_outrights: false },
      { key: "soccer_france_ligue_one", group: "Soccer", title: "Ligue 1", description: "Ligue 1 - France", active: true, has_outrights: false },
    ];
  }
}

export async function getOddsForSport(sportKey: string): Promise<OddsMatch[]> {
  try {
    return await fetchOddsApi<OddsMatch[]>(
      `/sports/${encodeURIComponent(sportKey)}/odds?regions=eu&markets=h2h&oddsFormat=decimal`,
      1200
    );
  } catch (error) {
    console.error(`Error fetching odds for ${sportKey}:`, error);
    return [];
  }
}

export async function getScheduleForSport(sportKey: string, date?: string): Promise<OddsEvent[]> {
  try {
    const targetDate = date || new Date().toISOString().split("T")[0];
    return await fetchOddsApi<OddsEvent[]>(
      `/sports/${encodeURIComponent(sportKey)}/events?date=${encodeURIComponent(targetDate)}`,
      600
    );
  } catch {
    return [];
  }
}

export async function getSportScheduleAndOdds(sportKey: string, date?: string, daysAhead = DEFAULT_SCHEDULE_DAYS_AHEAD) {
  const odds = await getOddsForSport(sportKey);
  return { odds, events: [] };
}

/**
  Main Function to Fetch & Cache All Matches Across All Leagues (Fast Parallel Call)
 */
export async function getLiveAndUpcomingMatches(leagueFilter?: string | null): Promise<FormattedMatch[]> {
  const now = Date.now();

  if (cachedMatchesList.length > 0 && now - lastCacheTime < CACHE_TTL_MS) {
    return filterMatches(cachedMatchesList, leagueFilter);
  }

  try {
    const apiResults = await Promise.allSettled(
      DEFAULT_SPORT_KEYS.map((key) => getOddsForSport(key))
    );

    const apiMatches: FormattedMatch[] = [];
    apiResults.forEach((res) => {
      if (res.status === "fulfilled" && Array.isArray(res.value)) {
        res.value.forEach((match) => {
          apiMatches.push(formatOddsDataToMatch(match));
        });
      }
    });

    const localFeatured = getEthiopianAndFeaturedMatches();
    const combinedMap = new Map<string, FormattedMatch>();

    // Put Ethiopian and local matches first
    localFeatured.forEach((m) => combinedMap.set(m.id, m));
    apiMatches.forEach((m) => {
      if (!combinedMap.has(m.id)) {
        combinedMap.set(m.id, m);
      }
    });

    cachedMatchesList = Array.from(combinedMap.values()).sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    lastCacheTime = now;
  } catch (err) {
    console.error("Error fetching live and upcoming matches:", err);
    if (cachedMatchesList.length === 0) {
      cachedMatchesList = getEthiopianAndFeaturedMatches();
    }
  }

  return filterMatches(cachedMatchesList, leagueFilter);
}

function filterMatches(matches: FormattedMatch[], leagueFilter?: string | null): FormattedMatch[] {
  if (!leagueFilter || leagueFilter === "all" || leagueFilter === "All") {
    return matches;
  }

  const query = leagueFilter.toLowerCase();

  return matches.filter((m) => {
    const l = m.league.toLowerCase();
    if (l === query) return true;
    if (query.includes("ethiopia") && l.includes("ethiopia")) return true;
    if (query.includes("english") && (l.includes("english") || l.includes("epl"))) return true;
    if (query.includes("la liga") && l.includes("la liga")) return true;
    if (query.includes("serie a") && l.includes("serie a")) return true;
    if (query.includes("bundesliga") && l.includes("bundesliga")) return true;
    if (query.includes("ligue 1") && l.includes("ligue 1")) return true;
    if (query.includes("caf") && (l.includes("caf") || l.includes("champions"))) return true;
    return false;
  });
}

export function getSportKeysForRequest(league: string | null, availableSports: Sport[] = []) {
  if (league && league !== "all" && league !== "All") {
    return [league];
  }
  return DEFAULT_SPORT_KEYS;
}

export function getDateWindow(startDate: Date = new Date(), daysAhead = DEFAULT_SCHEDULE_DAYS_AHEAD) {
  const dates: string[] = [];
  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}
