import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pending = await prisma.transaction.findMany({
      where: { type: "WITHDRAW", status: "PENDING" },
      include: {
        wallet: { include: { user: { select: { fullName: true, phone: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pending);
  } catch (error) {
    console.error("Pending withdrawals error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
