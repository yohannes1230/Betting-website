import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { matchId, oddsId, value } = await req.json();

    if (!matchId || !oddsId || !value || value < 1.01) {
      return NextResponse.json({ error: "Invalid override data" }, { status: 400 });
    }

    await prisma.odds.update({
      where: { id: oddsId },
      data: { value },
    });

    return NextResponse.json({ message: "Odds override saved and reflected on public markets." });
  } catch (error) {
    console.error("Odds override error:", error);
    return NextResponse.json({ error: "Failed to override" }, { status: 500 });
  }
}
