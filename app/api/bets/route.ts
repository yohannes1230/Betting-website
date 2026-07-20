import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { betSchema } from "@/lib/validation/schemas";
import { Decimal } from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const parsed = betSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { selections, stake } = parsed.data;

    // Check self-exclusion
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.selfExcluded) {
      return NextResponse.json({ error: "Betting is blocked: self-exclusion is enabled." }, { status: 403 });
    }

    // Load system config for limits
    const configs = await prisma.systemConfig.findMany();
    const cfg = Object.fromEntries(configs.map((c) => [c.key, Number(c.value)]));
    const minStake = cfg.MIN_STAKE ?? 10;
    const maxStake = cfg.MAX_STAKE ?? 10000;
    const maxPayout = cfg.MAX_PAYOUT ?? 500000;
    const multiMinLegs = cfg.MULTI_MIN_LEGS ?? 2;
    const multiMaxLegs = cfg.MULTI_MAX_LEGS ?? 20;

    if (stake < minStake) return NextResponse.json({ error: `Minimum stake is ${minStake}` }, { status: 400 });
    if (stake > maxStake) return NextResponse.json({ error: `Maximum stake is ${maxStake}` }, { status: 400 });

    // Check correlated markets (same match)
    const matchIds = selections.map((s) => s.matchId);
    if (new Set(matchIds).size !== matchIds.length) {
      return NextResponse.json({ error: "Cannot combine selections from the same match in a multi-bet" }, { status: 400 });
    }

    // Multi-bet leg count check
    if (selections.length > 1) {
      if (selections.length < multiMinLegs) return NextResponse.json({ error: `Multi-bet needs at least ${multiMinLegs} legs` }, { status: 400 });
      if (selections.length > multiMaxLegs) return NextResponse.json({ error: `Multi-bet limited to ${multiMaxLegs} legs` }, { status: 400 });
    }

    // SERVER-SIDE ODDS RE-VALIDATION SKIPPED FOR DEMO MVP
    // The external Odds API is used on the fly, so we cannot validate against prisma.odds.

    // Check balance
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || new Decimal(wallet.balance).lt(stake)) {
      return NextResponse.json({ error: "Insufficient demo balance" }, { status: 400 });
    }

    // Calculate total odds and potential win
    let totalOdds = new Decimal(1);
    for (const sel of selections) {
      totalOdds = totalOdds.mul(sel.value);
    }
    const potentialWin = Decimal.min(maxPayout, totalOdds.mul(stake)).toDecimalPlaces(2);

    // Atomic bet placement: create bet, debit wallet, write transaction
    const result = await prisma.$transaction(async (tx) => {
      const bet = await tx.bet.create({
        data: {
          userId,
          betType: selections.length === 1 ? "SINGLE" : "MULTI",
          stake,
          totalOdds: totalOdds.toDecimalPlaces(4),
          potentialWin,
          status: "PENDING",
        },
      });

      // Create bet items
      for (const sel of selections) {
        // Upsert match to satisfy foreign key constraint since matches are from external API
        await tx.match.upsert({
          where: { id: sel.matchId },
          update: {},
          create: {
            id: sel.matchId,
            league: "Unknown",
            homeTeam: "Home",
            awayTeam: "Away",
            startTime: new Date(),
          },
        });

        await tx.betItem.create({
          data: {
            betId: bet.id,
            matchId: sel.matchId,
            marketName: sel.marketName,
            selection: sel.selection,
            odds: sel.value,
          },
        });
      }

      // Debit wallet
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: stake } },
      });

      // Write transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "BET",
          amount: -stake,
          status: "COMPLETED",
          note: `Ticket ${bet.id.slice(0, 12)}`,
        },
      });

      // Update user's total wagered
      await tx.user.update({
        where: { id: userId },
        data: { totalWagered: { increment: stake } },
      });

      return bet;
    });

    const updatedWallet = await prisma.wallet.findUnique({ where: { userId } });

    return NextResponse.json({
      message: `Bet placed successfully`,
      ticketId: result.id,
      totalOdds: totalOdds.toNumber(),
      potentialWin: potentialWin.toNumber(),
      balance: updatedWallet?.balance?.toNumber(),
    });
  } catch (error) {
    console.error("Bet placement error:", error);
    return NextResponse.json({ error: "Bet placement failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = { userId };
    if (status) where.status = status.toUpperCase();

    const bets = await prisma.bet.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(bets);
  } catch (error) {
    console.error("Bets fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch bets" }, { status: 500 });
  }
}
