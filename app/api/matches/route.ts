import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatOddsDataToMatch, getSportKeysForRequest, getSportScheduleAndOdds } from "@/lib/the-odds-api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const league = searchParams.get("league") || "all";
    const sportKeys = getSportKeysForRequest(league);

    const matchesById = new Map<string, ReturnType<typeof formatOddsDataToMatch>>();

    for (const sportKey of sportKeys) {
      const { odds, events } = await getSportScheduleAndOdds(sportKey, undefined, 10);
      for (const match of odds) {
        const event = events.find((item) => item.id === match.id);
        const formatted = formatOddsDataToMatch(match, event);
        if (!matchesById.has(formatted.id)) {
          matchesById.set(formatted.id, formatted);
        }
      }
    }

    if (matchesById.size > 0) {
      const matches = Array.from(matchesById.values())
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 80);
      return NextResponse.json(matches);
    }
  } catch (error) {
    console.error("Matches API fallback triggered:", error);
  }

  try {
    const matches = await prisma.match.findMany({
      where: {},
      include: {
        odds: { where: { suspended: false }, orderBy: { marketName: "asc" } },
        events: { orderBy: { minute: "asc" } },
      },
      orderBy: { startTime: "asc" },
      take: 80,
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Matches Prisma fallback error:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
