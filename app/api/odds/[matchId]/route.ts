import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const odds = await prisma.odds.findMany({
      where: { matchId, suspended: false },
      orderBy: { marketName: "asc" },
    });

    return NextResponse.json(odds);
  } catch (error) {
    console.error("Odds error:", error);
    return NextResponse.json({ error: "Failed to fetch odds" }, { status: 500 });
  }
}
