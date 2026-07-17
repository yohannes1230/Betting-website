import { z } from "zod";

export const registerSchema = z.object({
  phone: z.string().regex(/^\+251\d{9}$/, "Phone must be +251 followed by 9 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Full name is required"),
  dob: z.string().refine((d) => {
    const age = (Date.now() - new Date(d).getTime()) / (365.25 * 86400000);
    return age >= 18;
  }, "You must be at least 18 years old"),
  acceptTerms: z.boolean().refine((val) => val === true, { message: "You must accept the terms" }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  phone: z.string().regex(/^\+251\d{9}$/, "Phone must be +251 followed by 9 digits"),
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const betSchema = z.object({
  selections: z.array(z.object({
    oddsId: z.string(),
    matchId: z.string(),
    marketName: z.string(),
    selection: z.string(),
    value: z.number().positive(),
  })).min(1, "At least one selection is required"),
  stake: z.number().min(10, "Minimum stake is 10").max(10000, "Maximum stake is 10,000"),
});

export const depositSchema = z.object({
  amount: z.number().positive("Amount must be positive").max(100000),
});

export const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

export const oddsOverrideSchema = z.object({
  matchId: z.string(),
  oddsId: z.string(),
  value: z.number().min(1.01, "Odds must be at least 1.01"),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type BetInput = z.infer<typeof betSchema>;
export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
