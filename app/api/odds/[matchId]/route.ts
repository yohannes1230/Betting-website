import { NextRequest, NextResponse } from "next/server";
import { getLiveAndUpcomingMatches } from "@/lib/the-odds-api";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  try {
    const matches = await getLiveAndUpcomingMatches();
    const match = matches.find((m) => m.id === matchId);

    if (match) {
      return NextResponse.json(match.odds);
    }
  } catch (error) {
    console.error("Odds API error:", error);
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
