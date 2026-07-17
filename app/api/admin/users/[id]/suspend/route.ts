import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.user.update({
      where: { id },
      data: { selfExcluded: !user.selfExcluded },
    });

    return NextResponse.json({
      message: user.selfExcluded ? "User unsuspended" : "User suspended",
    });
  } catch (error) {
    console.error("Suspend error:", error);
    return NextResponse.json({ error: "Failed to toggle suspension" }, { status: 500 });
  }
}
