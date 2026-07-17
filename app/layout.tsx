import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AddisBet Demo MVP — Ethiopia Betting Platform",
  description:
    "Demo-only Ethiopia-focused sportsbook and virtual games MVP. No real money. Live odds, bet slip, wallet, Keno, Aviator, virtual football, and admin controls.",
  keywords: "betting, Ethiopia, sportsbook, demo, Keno, Aviator, virtual football",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-full bg-white text-dark-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
