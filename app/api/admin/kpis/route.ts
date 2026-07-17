import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "decimal.js";

// Helper to verify admin auth (simplified for demo — production would use proper session)
async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("x-admin-email");
  if (!authHeader) return null;
  const admin = await prisma.adminUser.findUnique({ where: { email: authHeader } });
  return admin;
}

export async function GET(req: Request) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      todaySignups,
      totalBets,
      totalStakes,
      totalPayouts,
      pendingWithdrawals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.bet.count(),
      prisma.bet.aggregate({ _sum: { stake: true } }),
      prisma.transaction.aggregate({
        where: { type: "WIN", status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.transaction.count({
        where: { type: "WITHDRAW", status: "PENDING" },
      }),
    ]);

    const stakes = new Decimal(totalStakes._sum.stake ?? 0).toNumber();
    const payouts = new Decimal(totalPayouts._sum.amount ?? 0).toNumber();

    return NextResponse.json({
      totalUsers,
      todaySignups,
      totalBets,
      totalStakes: stakes,
      totalPayouts: payouts,
      netRevenue: Math.round((stakes - payouts) * 100) / 100,
      pendingWithdrawals,
      onlineNow: Math.floor(Math.random() * 30) + 10, // simulated
    });
  } catch (error) {
    console.error("KPI error:", error);
    return NextResponse.json({ error: "Failed to fetch KPIs" }, { status: 500 });
  }
}
