import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    if (new Decimal(wallet.balance).lt(amount)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: "WITHDRAW",
          amount: -amount,
          status: "PENDING",
          note: "Demo withdrawal request — pending admin review",
        },
      }),
    ]);

    const updated = await prisma.wallet.findUnique({ where: { userId } });

    return NextResponse.json({
      message: "Withdrawal request submitted. Pending admin approval.",
      balance: updated?.balance,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: "Withdrawal failed" }, { status: 500 });
  }
}
