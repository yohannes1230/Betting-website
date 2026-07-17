import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Refund the amount back to wallet
    const refundAmount = new Decimal(tx.amount).abs();

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id },
        data: { status: "REJECTED" },
      }),
      prisma.wallet.update({
        where: { id: tx.walletId },
        data: { balance: { increment: refundAmount.toNumber() } },
      }),
    ]);

    return NextResponse.json({ message: "Withdrawal rejected. Funds returned." });
  } catch (error) {
    console.error("Reject error:", error);
    return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
  }
}
