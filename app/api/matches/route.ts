import { NextRequest, NextResponse } from "next/server";
import { getLiveAndUpcomingMatches } from "@/lib/the-odds-api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const league = searchParams.get("league");

    const matches = await getLiveAndUpcomingMatches(league);

    return NextResponse.json(matches, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Matches API error:", error);
    return NextResponse.json([]);
  }
}
