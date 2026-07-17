import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const league = searchParams.get("league");
    const live = searchParams.get("live");

    const where: any = {};
    if (league) where.league = league;
    if (live === "true") where.isLive = true;

    const matches = await prisma.match.findMany({
      where,
      include: {
        odds: { where: { suspended: false }, orderBy: { marketName: "asc" } },
        events: { orderBy: { minute: "asc" } },
      },
      orderBy: [{ isLive: "desc" }, { startTime: "asc" }],
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Matches error:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
