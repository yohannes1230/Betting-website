const API_KEY = process.env.ODDS_API_KEY?.trim() || process.env.NEXT_PUBLIC_ODDS_API_KEY?.trim() || "";
const BASE_URL = "https://api.the-odds-api.com/v4";
const DEFAULT_SCHEDULE_DAYS_AHEAD = 10;
const DEFAULT_SPORT_KEYS = [
  "soccer_epl",
  "soccer_efl",
  "soccer_serie_a",
  "soccer_bundesliga",
  "soccer_laliga",
  "soccer_uefa_champs_league",
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

async function fetchOddsApi<T>(path: string, revalidate: number): Promise<T> {
  if (!API_KEY) {
    throw new Error("ODDS_API_KEY is not configured");
  }

  const url = `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}apiKey=${API_KEY}`;
  const res = await fetch(url, {
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`The Odds API request failed with ${res.status}`);
  }

  return (await res.json()) as T;
}

function toDateString(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateWindow(startDate: Date = new Date(), daysAhead = DEFAULT_SCHEDULE_DAYS_AHEAD) {
  const dates: string[] = [];
  const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));

  for (let i = 0; i <= daysAhead; i += 1) {
    const next = new Date(start);
    next.setUTCDate(start.getUTCDate() + i);
    dates.push(toDateString(next));
  }

  return dates;
}

export function getSportKeysForRequest(league: string | null, availableSports: Sport[] = []) {
  if (league && league !== "all") {
    return [league];
  }

  const preferred = DEFAULT_SPORT_KEYS.filter((sportKey) =>
    availableSports.length === 0 || availableSports.some((sport) => sport.key === sportKey)
  );

  return preferred.length > 0 ? preferred : DEFAULT_SPORT_KEYS;
}

function normalizeScore(rawScore: unknown): number | undefined {
  if (rawScore === null || rawScore === undefined || rawScore === "") return undefined;
  const parsed = Number(rawScore);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Fetch all active sports.
 * Cached for 24 hours to save API quota.
 */
export async function getAllSports(): Promise<Sport[]> {
  try {
    const data = await fetchOddsApi<Sport[]>("/sports/", 86400);
    return data.filter((s) => s.active);
  } catch (error) {
    console.error("Error fetching sports:", error);
    return [];
  }
}

/**
 * Fetch upcoming matches and odds for a specific sport key.
 * Cached for 30 minutes to save API quota.
 */
export async function getOddsForSport(sportKey: string): Promise<OddsMatch[]> {
  try {
    return await fetchOddsApi<OddsMatch[]>(
      `/sports/${encodeURIComponent(sportKey)}/odds?regions=eu&markets=h2h&oddsFormat=decimal`,
      1800
    );
  } catch (error) {
    console.error(`Error fetching odds for ${sportKey}:`, error);
    return [];
  }
}

/**
 * Fetch scheduled events for a sport so the app can show fixtures and state.
 */
export async function getScheduleForSport(sportKey: string, date?: string): Promise<OddsEvent[]> {
  try {
    const targetDate = date || toDateString(new Date());
    return await fetchOddsApi<OddsEvent[]>(
      `/sports/${encodeURIComponent(sportKey)}/events?date=${encodeURIComponent(targetDate)}`,
      600
    );
  } catch (error) {
    console.error(`Error fetching schedule for ${sportKey}:`, error);
    return [];
  }
}

/**
 * Fetch historical odds for a sport and date.
 */
export async function getHistoricalOdds(sportKey: string, date: string): Promise<OddsMatch[]> {
  try {
    return await fetchOddsApi<OddsMatch[]>(
      `/historical/sports/${encodeURIComponent(sportKey)}/odds?regions=eu&markets=h2h&date=${encodeURIComponent(date)}`,
      3600
    );
  } catch (error) {
    console.error(`Error fetching historical odds for ${sportKey}:`, error);
    return [];
  }
}

/**
 * Fetch historical events for a sport and date.
 */
export async function getHistoricalEvents(sportKey: string, date: string): Promise<OddsEvent[]> {
  try {
    return await fetchOddsApi<OddsEvent[]>(
      `/historical/sports/${encodeURIComponent(sportKey)}/events?date=${encodeURIComponent(date)}`,
      3600
    );
  } catch (error) {
    console.error(`Error fetching historical events for ${sportKey}:`, error);
    return [];
  }
}

/**
 * Fetch historical odds for a specific event.
 */
export async function getHistoricalEventOdds(sportKey: string, eventId: string, date: string): Promise<OddsMatch[]> {
  try {
    return await fetchOddsApi<OddsMatch[]>(
      `/historical/sports/${encodeURIComponent(sportKey)}/events/${encodeURIComponent(eventId)}/odds?regions=eu&markets=h2h&dateFormat=iso&oddsFormat=decimal&date=${encodeURIComponent(date)}`,
      3600
    );
  } catch (error) {
    console.error(`Error fetching historical event odds for ${eventId}:`, error);
    return [];
  }
}

export async function getSportScheduleAndOdds(sportKey: string, date?: string, daysAhead = DEFAULT_SCHEDULE_DAYS_AHEAD) {
  const baseDate = date || toDateString(new Date());
  const dates = getDateWindow(new Date(baseDate), daysAhead);

  const [odds, events] = await Promise.all([
    getOddsForSport(sportKey),
    Promise.all(dates.map((currentDate) => getScheduleForSport(sportKey, currentDate))).then((batches) =>
      batches.flat().filter((event, index, list) => list.findIndex((item) => item.id === event.id) === index)
    ),
  ]);

  return { odds, events };
}

/**
 * Map The-Odds-API data into our application's MatchData format
 */
export function formatOddsDataToMatch(match: OddsMatch, event?: OddsEvent | null) {
  const h2hMarket = match.bookmakers[0]?.markets.find((m) => m.key === "h2h");
  const odds = h2hMarket?.outcomes.map((o) => {
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

  const orderedOdds = [] as Array<{ id: string; marketName: string; selection: string; value: number }>;
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

  const statusText = event?.status || (event?.completed ? "COMPLETED" : "UPCOMING");
  const isLive = Boolean(
    event?.status && /live|in[- ]?play|inplay|ongoing|current/i.test(event.status)
  );
  const homeScore = normalizeScore(event?.home_score);
  const awayScore = normalizeScore(event?.away_score);

  return {
    id: match.id,
    league: match.sport_title,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    isLive,
    homeScore,
    awayScore,
    startTime: event?.commence_time || match.commence_time,
    status: statusText,
    odds: orderedOdds,
    events: [],
  };
}
