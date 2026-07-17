import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";
import crypto from "crypto";

// Keno pay table — standard payout multipliers keyed by (picked, matched)
const KENO_PAY_TABLE: Record<number, Record<number, number>> = {
  1: { 1: 3 },
  2: { 1: 1, 2: 12 },
  3: { 2: 2, 3: 45 },
  4: { 2: 1, 3: 8, 4: 90 },
  5: { 3: 4, 4: 20, 5: 420 },
  6: { 3: 2, 4: 12, 5: 85, 6: 900 },
  7: { 4: 8, 5: 50, 6: 400, 7: 2000 },
  8: { 5: 20, 6: 150, 7: 1000, 8: 5000 },
  9: { 5: 10, 6: 80, 7: 500, 8: 3000, 9: 10000 },
  10: { 5: 5, 6: 50, 7: 300, 8: 2000, 9: 8000, 10: 25000 },
};

export async function GET() {
  try {
    // Get or create current draw
    const now = new Date();
    let draw = await prisma.kenoDraw.findFirst({
      where: { closesAt: { gt: now }, settledAt: null },
      orderBy: { closesAt: "asc" },
    });

    if (!draw) {
      const seed = crypto.randomBytes(16).toString("hex");
      // Draw 20 numbers from 1-80 using seeded RNG
      const rng = crypto.createHash("sha256").update(seed).digest();
      const pool = Array.from({ length: 80 }, (_, i) => i + 1);
      const drawn: number[] = [];
      for (let i = 0; i < 20; i++) {
        const idx = rng[i % rng.length] % pool.length;
        drawn.push(pool.splice(idx, 1)[0]);
      }

      draw = await prisma.kenoDraw.create({
        data: {
          seed,
          numbers: drawn.sort((a, b) => a - b),
          closesAt: new Date(Date.now() + 75000), // 75 seconds
        },
      });
    }

    return NextResponse.json({
      drawId: draw.id,
      closesAt: draw.closesAt,
      settled: !!draw.settledAt,
      numbers: draw.settledAt ? draw.numbers : [], // Don't reveal until settled
      payTable: KENO_PAY_TABLE,
    });
  } catch (error) {
    console.error("Keno current draw error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { drawId, picks, stake } = await req.json();

    if (!picks || !Array.isArray(picks) || picks.length < 1 || picks.length > 10) {
      return NextResponse.json({ error: "Pick 1-10 numbers" }, { status: 400 });
    }
    if (!stake || stake < 10) {
      return NextResponse.json({ error: "Minimum stake is 10" }, { status: 400 });
    }

    // Check self-exclusion
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.selfExcluded) {
      return NextResponse.json({ error: "Self-exclusion is enabled" }, { status: 403 });
    }

    // Check balance
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || new Decimal(wallet.balance).lt(stake)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Get draw and settle immediately (demo mode — instant results)
    let draw = await prisma.kenoDraw.findUnique({ where: { id: drawId } });
    if (!draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });

    // Settle draw if not yet settled
    if (!draw.settledAt) {
      draw = await prisma.kenoDraw.update({
        where: { id: drawId },
        data: { settledAt: new Date() },
      });
    }

    const matched = picks.filter((n: number) => draw!.numbers.includes(n)).length;
    const multiplier = KENO_PAY_TABLE[picks.length]?.[matched] ?? 0;
    const payout = Math.round(stake * multiplier * 100) / 100;

    // Atomic: debit stake, credit win, record transactions
    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: stake } },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "BET",
          amount: -stake,
          status: "COMPLETED",
          note: `Keno draw ${drawId.slice(0, 8)}`,
        },
      });

      if (payout > 0) {
        await tx.wallet.update({
          where: { userId },
          data: { balance: { increment: payout } },
        });
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: "WIN",
            amount: payout,
            status: "COMPLETED",
            note: `Keno win ${matched}/${picks.length} — ${multiplier}x`,
          },
        });
      }

      await tx.kenoTicket.create({
        data: { userId, drawId, picks, stake, matched, payout },
      });
    });

    const updatedWallet = await prisma.wallet.findUnique({ where: { userId } });

    return NextResponse.json({
      drawnNumbers: draw.numbers,
      picks,
      matched,
      multiplier,
      payout,
      balance: updatedWallet?.balance,
      message: payout > 0
        ? `Matched ${matched}/${picks.length} — won ${payout} ETB-DEMO!`
        : `Matched ${matched}/${picks.length} — no win this round.`,
    });
  } catch (error) {
    console.error("Keno play error:", error);
    return NextResponse.json({ error: "Game failed" }, { status: 500 });
  }
}
