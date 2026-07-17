import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { otpSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = otpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 });
    }

    const { phone, otp } = parsed.data;

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Already verified" });
    }

    if (user.otpCode !== otp) {
      return NextResponse.json({ error: "Wrong OTP code" }, { status: 400 });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    await prisma.user.update({
      where: { phone },
      data: { isVerified: true, otpCode: null, otpExpiresAt: null },
    });

    return NextResponse.json({ message: "Phone verified. You can now log in." });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
