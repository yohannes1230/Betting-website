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

    // Check deposit limit (Section 13)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.depositLimit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (wallet) {
        const todayDeposits = await prisma.transaction.aggregate({
          where: {
            walletId: wallet.id,
            type: "DEPOSIT",
            createdAt: { gte: today },
          },
          _sum: { amount: true },
        });
        const totalToday = new Decimal(todayDeposits._sum.amount ?? 0).plus(amount);
        if (totalToday.gt(user.depositLimit)) {
          return NextResponse.json({
            error: `Daily deposit limit of ${user.depositLimit} ETB-DEMO reached`,
          }, { status: 400 });
        }
      }
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          amount,
          status: "COMPLETED",
          note: "Instant demo top-up",
        },
      }),
    ]);

    const updated = await prisma.wallet.findUnique({ where: { userId } });

    return NextResponse.json({
      message: "Demo funds added",
      balance: updated?.balance,
    });
  } catch (error) {
    console.error("Deposit error:", error);
    return NextResponse.json({ error: "Deposit failed" }, { status: 500 });
  }
}
