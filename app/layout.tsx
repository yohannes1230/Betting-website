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
  title: "Tipplay — Premier Sportsbook, Casino & Virtual Games",
  description:
    "Ethiopia's premier sportsbook, crash games & virtual casino platform. Live odds, instant tickets, virtual football, Aviator-style crash, Keno & Jackpots. ቲፕፕሌይ — ለኢትዮጵያ የተዘጋጀ መሪ የቤቲንግ መድረክ",
  keywords: "Tipplay, sports betting, Ethiopia sportsbook, live odds, virtual games, Aviator, Keno, casino, ቲፕፕሌይ, ቤቲንግ",
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
