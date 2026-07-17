import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";
import crypto from "crypto";

/**
 * Aviator crash game — Section 9
 * crashPoint = max(1.00, (0.99 / (1 - random())) rounded to 2dp)
 * House edge ≈ 1% baked into the formula
 */

export async function GET() {
  try {
    // Get or create current round
    let round = await prisma.aviatorRound.findFirst({
      where: { crashedAt: null },
      orderBy: { startedAt: "desc" },
    });

    if (!round) {
      const seed = crypto.randomBytes(16).toString("hex");
      const rng = crypto.createHash("sha256").update(seed).digest();
      const randomVal = (rng.readUInt32BE(0) % 10000) / 10000; // 0-0.9999
      const crashPoint = Math.max(1.00, Math.round((0.99 / (1 - randomVal)) * 100) / 100);

      round = await prisma.aviatorRound.create({
        data: { seed, crashPoint },
      });
    }

    // Get recent round history
    const history = await prisma.aviatorRound.findMany({
      where: { crashedAt: { not: null } },
      orderBy: { crashedAt: "desc" },
      take: 10,
      select: { id: true, crashPoint: true },
    });

    const elapsed = (Date.now() - round.startedAt.getTime()) / 1000;
    // Multiplier grows exponentially: 1.0 * e^(0.06*t)
    const currentMultiplier = Math.round(Math.exp(0.06 * elapsed) * 100) / 100;
    const hasCrashed = currentMultiplier >= new Decimal(round.crashPoint).toNumber();

    if (hasCrashed && !round.crashedAt) {
      await prisma.aviatorRound.update({
        where: { id: round.id },
        data: { crashedAt: new Date() },
      });
    }

    return NextResponse.json({
      roundId: round.id,
      startedAt: round.startedAt,
      currentMultiplier: hasCrashed ? new Decimal(round.crashPoint).toNumber() : currentMultiplier,
      crashed: hasCrashed,
      crashPoint: hasCrashed ? new Decimal(round.crashPoint).toNumber() : undefined,
      history: history.map((h) => ({ id: h.id, crashPoint: new Decimal(h.crashPoint).toNumber() })),
    });
  } catch (error) {
    console.error("Aviator round error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const { roundId, stake, action } = body; // action: "bet" or "cashout"

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

    const round = await prisma.aviatorRound.findUnique({ where: { id: roundId } });
    if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

    if (action === "bet") {
      if (!stake || stake < 10) return NextResponse.json({ error: "Min stake 10" }, { status: 400 });
      if (new Decimal(wallet.balance).lt(stake)) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      }

      // Check self-exclusion
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.selfExcluded) return NextResponse.json({ error: "Self-exclusion enabled" }, { status: 403 });

      await prisma.$transaction([
        prisma.aviatorBet.create({
          data: { userId, roundId, stake },
        }),
        prisma.wallet.update({
          where: { userId },
          data: { balance: { decrement: stake } },
        }),
        prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: "BET",
            amount: -stake,
            status: "COMPLETED",
            note: `Aviator round ${roundId.slice(0, 8)}`,
          },
        }),
      ]);

      const updated = await prisma.wallet.findUnique({ where: { userId } });
      return NextResponse.json({ message: "Bet placed", balance: updated?.balance });
    }

    if (action === "cashout") {
      const bet = await prisma.aviatorBet.findFirst({
        where: { userId, roundId, cashOutAt: null },
      });
      if (!bet) return NextResponse.json({ error: "No active bet" }, { status: 400 });

      // Calculate current multiplier server-side
      const elapsed = (Date.now() - round.startedAt.getTime()) / 1000;
      const currentMultiplier = Math.round(Math.exp(0.06 * elapsed) * 100) / 100;
      const crashPoint = new Decimal(round.crashPoint).toNumber();

      if (currentMultiplier >= crashPoint) {
        return NextResponse.json({ error: "Round already crashed" }, { status: 400 });
      }

      const payout = Math.round(new Decimal(bet.stake).mul(currentMultiplier).toNumber() * 100) / 100;

      await prisma.$transaction([
        prisma.aviatorBet.update({
          where: { id: bet.id },
          data: { cashOutAt: currentMultiplier, payout },
        }),
        prisma.wallet.update({
          where: { userId },
          data: { balance: { increment: payout } },
        }),
        prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: "WIN",
            amount: payout,
            status: "COMPLETED",
            note: `Aviator cash-out ${currentMultiplier.toFixed(2)}x`,
          },
        }),
      ]);

      const updated = await prisma.wallet.findUnique({ where: { userId } });
      return NextResponse.json({
        message: `Cashed out at ${currentMultiplier.toFixed(2)}x`,
        multiplier: currentMultiplier,
        payout,
        balance: updated?.balance,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Aviator error:", error);
    return NextResponse.json({ error: "Game failed" }, { status: 500 });
  }
}
