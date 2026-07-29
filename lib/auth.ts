import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// ─── Hardcoded Demo User (works without DB) ─────────────
const DEMO_USER = {
  phone: "+251900000000",
  password: "DemoPass123!",
  id: "demo-user-001",
  fullName: "Abebe Kebede",
  membershipLevel: "GOLD",
  selfExcluded: false,
  balance: "5000.00",
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        // ── Demo user shortcut (always works, no DB needed) ──
        if (
          credentials.phone === DEMO_USER.phone &&
          credentials.password === DEMO_USER.password
        ) {
          return {
            id: DEMO_USER.id,
            name: DEMO_USER.fullName,
            phone: DEMO_USER.phone,
            membershipLevel: DEMO_USER.membershipLevel,
            selfExcluded: DEMO_USER.selfExcluded,
            balance: DEMO_USER.balance,
          };
        }

        // ── Normal DB-backed auth ──
        try {
          const user = await prisma.user.findUnique({
            where: { phone: credentials.phone },
            include: { wallet: true },
          });

          if (!user) return null;
          if (!user.isVerified) return null;

          const valid = await compare(credentials.password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            name: user.fullName,
            phone: user.phone,
            membershipLevel: user.membershipLevel,
            selfExcluded: user.selfExcluded,
            balance: user.wallet?.balance?.toString() ?? "0",
          };
        } catch (error) {
          console.error("DB auth error (falling back):", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 7 * 24 * 3600 },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.phone = (user as any).phone;
        token.membershipLevel = (user as any).membershipLevel;
        token.selfExcluded = (user as any).selfExcluded;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).phone = token.phone;
        (session.user as any).membershipLevel = token.membershipLevel;
        (session.user as any).selfExcluded = token.selfExcluded;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

