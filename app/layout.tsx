import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Noto_Sans_Ethiopic } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-ethiopic",
  subsets: ["ethiopic"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AddisBet — Ethiopia's Premier Betting Platform",
  description:
    "Demo-only Ethiopia-focused sportsbook and virtual games. Live odds, bet slip, wallet, Keno, Aviator-style crash, virtual football, and admin controls. አዲስቤት — ለኢትዮጵያ የተዘጋጀ የስፖርት ቤት",
  keywords: "betting, Ethiopia, sportsbook, demo, Keno, Aviator, virtual football, አዲስቤት, ቤቲንግ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoEthiopic.variable} h-full antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-full bg-bg-deep text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
