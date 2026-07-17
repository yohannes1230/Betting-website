import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { phone, password, fullName, dob } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);
    const otpCode = "123456"; // Demo OTP — never a real SMS

    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        fullName,
        dob: new Date(dob),
        otpCode,
        otpExpiresAt: new Date(Date.now() + 600000), // 10 min
      },
    });

    // Create wallet with 0 balance
    await prisma.wallet.create({
      data: { userId: user.id, balance: 0 },
    });

    console.log(`[DEMO] OTP for ${phone}: ${otpCode}`);

    return NextResponse.json({
      message: "Registration successful. Verify OTP to activate.",
      phone,
      demoOtp: otpCode, // Displayed on frontend per Section 6.9
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
