import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatOddsDataToMatch, getAllSports, getSportKeysForRequest, getSportScheduleAndOdds } from "@/lib/the-odds-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const sports = await getAllSports();
    const sportKeys = getSportKeysForRequest("all", sports);

    for (const sportKey of sportKeys) {
      const { odds, events } = await getSportScheduleAndOdds(sportKey, undefined, 10);
      const matchData = odds.find((item) => item.id === id);

      if (matchData) {
        const eventData = events.find((item) => item.id === id || item.id === matchData.id);
        return NextResponse.json(formatOddsDataToMatch(matchData, eventData));
      }
    }
  } catch (error) {
    console.error("Match detail API fallback triggered:", error);
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        odds: { where: { suspended: false }, orderBy: { marketName: "asc" } },
        events: { orderBy: { minute: "asc" } },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Match detail Prisma fallback error:", error);
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 });
  }
}
