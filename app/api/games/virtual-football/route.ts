import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";

/**
 * Virtual Football — Section 9
 * Poisson-weighted goal model for realistic scores.
 * Pre-computes 1X2 and O/U odds from the same model.
 */

const TEAMS = [
  ["Addis Lions", "Dire Dawa Stars"],
  ["Hawassa United", "Bahir Dar FC"],
  ["Jimma Dynamos", "Gondar City"],
  ["Mekelle Wolves", "Adama United"],
  ["Harar FC", "Dessie Rangers"],
];

// Poisson probability: P(k) = (λ^k * e^-λ) / k!
function poisson(lambda: number, k: number): number {
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / fact;
}

// Generate a random goal count from Poisson distribution
function poissonRandom(lambda: number): number {
  const L = Math.exp(-lambda);
  let p = 1;
  let k = 0;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

function generateMatch() {
  const [home, away] = TEAMS[Math.floor(Math.random() * TEAMS.length)];
  const homeLambda = 1.3 + Math.random() * 0.6; // expected goals home
  const awayLambda = 0.9 + Math.random() * 0.5;

  // Calculate 1X2 probabilities from Poisson model
  let pHome = 0, pDraw = 0, pAway = 0;
  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      const p = poisson(homeLambda, h) * poisson(awayLambda, a);
      if (h > a) pHome += p;
      else if (h === a) pDraw += p;
      else pAway += p;
    }
  }

  // Convert to odds (with ~5% margin)
  const margin = 1.05;
  const homeOdds = Math.round((margin / pHome) * 100) / 100;
  const drawOdds = Math.round((margin / pDraw) * 100) / 100;
  const awayOdds = Math.round((margin / pAway) * 100) / 100;

  // Over/Under 2.5
  let pOver = 0;
  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      if (h + a > 2) pOver += poisson(homeLambda, h) * poisson(awayLambda, a);
    }
  }
  const overOdds = Math.round((margin / pOver) * 100) / 100;
  const underOdds = Math.round((margin / (1 - pOver)) * 100) / 100;

  // Generate actual score
  const homeScore = poissonRandom(homeLambda);
  const awayScore = poissonRandom(awayLambda);

  // Generate ticker events
  const events: string[] = ["Kickoff! Match underway."];
  const totalGoals = homeScore + awayScore;
  const goalTimes: number[] = [];
  for (let i = 0; i < totalGoals; i++) {
    goalTimes.push(Math.floor(Math.random() * 85) + 5);
  }
  goalTimes.sort((a, b) => a - b);

  let hg = 0, ag = 0;
  for (let i = 0; i < totalGoals; i++) {
    const isHome = hg < homeScore && (ag >= awayScore || Math.random() < 0.5);
    if (isHome) { hg++; events.push(`${goalTimes[i]}' ⚽ GOAL! ${home} scores! (${hg}-${ag})`); }
    else { ag++; events.push(`${goalTimes[i]}' ⚽ GOAL! ${away} scores! (${hg}-${ag})`); }
  }

  // Add some non-goal events
  events.push(`${Math.floor(Math.random() * 30 + 10)}' Corner kick for ${Math.random() > 0.5 ? home : away}`);
  events.push(`${Math.floor(Math.random() * 20 + 40)}' Great save by the keeper!`);
  events.push(`${Math.floor(Math.random() * 15 + 70)}' Yellow card shown`);
  events.push("90' Full time! Match over.");
  events.sort();

  return { home, away, homeScore, awayScore, homeOdds, drawOdds, awayOdds, overOdds, underOdds, events };
}

export async function GET() {
  try {
    // Check for active match
    let match = await prisma.virtualMatch.findFirst({
      where: { status: "pending" },
      orderBy: { startedAt: "desc" },
    });

    if (!match) {
      const gen = generateMatch();
      match = await prisma.virtualMatch.create({
        data: {
          homeTeam: gen.home,
          awayTeam: gen.away,
          homeScore: gen.homeScore,
          awayScore: gen.awayScore,
          homeOdds: gen.homeOdds,
          drawOdds: gen.drawOdds,
          awayOdds: gen.awayOdds,
          overOdds: gen.overOdds,
          underOdds: gen.underOdds,
          events: gen.events,
          status: "pending",
        },
      });
    }

    return NextResponse.json({
      id: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeOdds: new Decimal(match.homeOdds).toNumber(),
      drawOdds: new Decimal(match.drawOdds).toNumber(),
      awayOdds: new Decimal(match.awayOdds).toNumber(),
      overOdds: new Decimal(match.overOdds).toNumber(),
      underOdds: new Decimal(match.underOdds).toNumber(),
      status: match.status,
      // Only reveal score/events after settled
      ...(match.status === "settled" ? {
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        events: match.events,
      } : {}),
    });
  } catch (error) {
    console.error("Virtual football error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { matchId, selection, stake } = await req.json();
    // selection: "home", "draw", "away", "over", "under"

    if (!stake || stake < 10) return NextResponse.json({ error: "Min stake 10" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.selfExcluded) return NextResponse.json({ error: "Self-exclusion enabled" }, { status: 403 });

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || new Decimal(wallet.balance).lt(stake)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const match = await prisma.virtualMatch.findUnique({ where: { id: matchId } });
    if (!match || match.status === "settled") {
      return NextResponse.json({ error: "Match not available" }, { status: 400 });
    }

    // Settle the match
    await prisma.virtualMatch.update({
      where: { id: matchId },
      data: { status: "settled", settledAt: new Date() },
    });

    // Determine outcome
    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;
    let won = false;
    let selectedOdds = 1;

    switch (selection) {
      case "home":
        won = homeScore > awayScore;
        selectedOdds = new Decimal(match.homeOdds).toNumber();
        break;
      case "draw":
        won = homeScore === awayScore;
        selectedOdds = new Decimal(match.drawOdds).toNumber();
        break;
      case "away":
        won = homeScore < awayScore;
        selectedOdds = new Decimal(match.awayOdds).toNumber();
        break;
      case "over":
        won = homeScore + awayScore > 2;
        selectedOdds = new Decimal(match.overOdds).toNumber();
        break;
      case "under":
        won = homeScore + awayScore <= 2;
        selectedOdds = new Decimal(match.underOdds).toNumber();
        break;
    }

    const payout = won ? Math.round(stake * selectedOdds * 100) / 100 : 0;

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
          note: `Virtual ${match.homeTeam} vs ${match.awayTeam}`,
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
            note: `Virtual win — ${selection} @ ${selectedOdds}`,
          },
        });
      }
    });

    const updatedWallet = await prisma.wallet.findUnique({ where: { userId } });

    return NextResponse.json({
      homeScore,
      awayScore,
      events: match.events,
      selection,
      won,
      odds: selectedOdds,
      payout,
      balance: updatedWallet?.balance,
      message: won
        ? `${match.homeTeam} ${homeScore}-${awayScore} ${match.awayTeam}. You won ${payout} ETB-DEMO!`
        : `${match.homeTeam} ${homeScore}-${awayScore} ${match.awayTeam}. Better luck next time.`,
    });
  } catch (error) {
    console.error("Virtual football play error:", error);
    return NextResponse.json({ error: "Game failed" }, { status: 500 });
  }
}
