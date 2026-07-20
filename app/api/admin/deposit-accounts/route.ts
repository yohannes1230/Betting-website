import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const accounts = await prisma.agentDepositAccount.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { provider, accountName, accountNumber } = await req.json();

    if (!provider || !accountName || !accountNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newAccount = await prisma.agentDepositAccount.create({
      data: {
        provider,
        accountName,
        accountNumber,
        isActive: true,
      },
    });

    return NextResponse.json(newAccount);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
