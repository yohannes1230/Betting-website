import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatOddsDataToMatch, getAllSports, getSportKeysForRequest, getSportScheduleAndOdds } from "@/lib/the-odds-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  try {
    const sports = await getAllSports();
    const sportKeys = getSportKeysForRequest("all", sports);

    for (const sportKey of sportKeys) {
      const { odds } = await getSportScheduleAndOdds(sportKey, undefined, 10);
      const matchData = odds.find((item) => item.id === matchId);

      if (matchData) {
        return NextResponse.json(formatOddsDataToMatch(matchData).odds);
      }
    }
  } catch (error) {
    console.error("Odds API fallback triggered:", error);
  }

  try {
    const odds = await prisma.odds.findMany({
      where: { matchId, suspended: false },
      orderBy: { marketName: "asc" },
    });

    return NextResponse.json(odds);
  } catch (error) {
    console.error("Odds Prisma fallback error:", error);
    return NextResponse.json({ error: "Failed to fetch odds" }, { status: 500 });
  }
}
