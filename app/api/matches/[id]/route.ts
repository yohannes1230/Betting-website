import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    console.error("Match detail error:", error);
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 });
  }
}
