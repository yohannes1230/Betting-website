import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.transaction.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    return NextResponse.json({ message: "Withdrawal approved" });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
  }
}
