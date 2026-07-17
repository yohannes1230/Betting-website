import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";

    const users = await prisma.user.findMany({
      where: search ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ],
      } : {},
      select: {
        id: true,
        phone: true,
        fullName: true,
        membershipLevel: true,
        kycStatus: true,
        selfExcluded: true,
        isVerified: true,
        totalWagered: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
