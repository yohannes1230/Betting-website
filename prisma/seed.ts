/**
 * AddisBet Demo MVP — Seed Script
 * Section 16: Populates 25-40 users, 4-6 leagues, 15-25 matches,
 * 30-50 historical bets, pending withdrawals, and 1 SUPER_ADMIN.
 * Safe to re-run (uses upsert).
 */

import { PrismaClient, Membership, KycStatus, BetStatus, BetType, TxType, TxStatus, MatchStatus, AdminRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const days = (n: number) => new Date(Date.now() - n * 86400000);
const hours = (n: number) => new Date(Date.now() + n * 3600000);

const ethiopianNames = [
  "Abebe Kebede", "Selam Tesfaye", "Dawit Hailu", "Hana Mekonnen", "Yonas Bekele",
  "Tsion Girma", "Biruk Tadesse", "Meron Alemu", "Ermias Worku", "Bethlehem Assefa",
  "Henok Desta", "Sara Getachew", "Nahom Yilma", "Ruth Demissie", "Kidus Tekle",
  "Tigist Mulugeta", "Abel Negash", "Lydia Woldemariam", "Samuel Gebre", "Meseret Ayele",
  "Fasil Berhane", "Hiwot Sahle", "Dawit Negussie", "Nardos Tsegaye", "Yared Lemma",
  "Seble Habtamu", "Tewodros Fikre", "Rahel Mengistu", "Bereket Zewde", "Alem Sisay",
  "Eyob Tessema", "Mekdes Abera", "Kaleb Wolde", "Feven Gebremariam", "Robel Tadesse",
];

const leagues: Array<{ name: string; teams: string[][] }> = [
  {
    name: "Ethiopian Premier League",
    teams: [
      ["St George", "Fasil Kenema"], ["Hawassa City", "Sidama Coffee"],
      ["Adama City", "Dire Dawa City"], ["Ethio Electric", "Wolaita Dicha"],
      ["Defence Force", "Bahir Dar City"],
    ],
  },
  {
    name: "English Premier League",
    teams: [
      ["Arsenal", "Chelsea"], ["Liverpool", "Man City"],
      ["Man United", "Tottenham"], ["Newcastle", "Aston Villa"],
    ],
  },
  {
    name: "La Liga",
    teams: [
      ["Real Madrid", "Sevilla"], ["Barcelona", "Atletico Madrid"],
      ["Real Sociedad", "Villarreal"],
    ],
  },
  {
    name: "CAF Champions League",
    teams: [
      ["Al Ahly", "Mamelodi Sundowns"], ["Esperance", "Wydad"],
      ["TP Mazembe", "Simba SC"],
    ],
  },
  {
    name: "Serie A",
    teams: [
      ["Inter", "Napoli"], ["AC Milan", "Juventus"],
      ["Roma", "Lazio"],
    ],
  },
];

const marketTemplates: Array<{ name: string; gen: () => [string, number][] }> = [
  {
    name: "Match Result",
    gen: () => [["Home", rand(1.3, 3.5)], ["Draw", rand(2.8, 4.5)], ["Away", rand(2.0, 7.5)]],
  },
  {
    name: "Total Goals",
    gen: () => [["Over 2.5", rand(1.5, 2.4)], ["Under 2.5", rand(1.6, 2.5)]],
  },
  {
    name: "Both Teams To Score",
    gen: () => [["Yes", rand(1.5, 2.2)], ["No", rand(1.6, 2.4)]],
  },
  {
    name: "Handicap",
    gen: () => [["Home -1", rand(2.5, 4.5)], ["Away +1", rand(1.2, 1.8)]],
  },
  {
    name: "Correct Score",
    gen: () => [["1-0", rand(5, 9)], ["2-1", rand(7, 12)], ["1-1", rand(5, 8)]],
  },
];

// ─── Main Seed ────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding AddisBet demo database...\n");

  // ── System Config (editable limits from Section 7)
  const configs = [
    { key: "MIN_STAKE", value: "10" },
    { key: "MAX_STAKE", value: "10000" },
    { key: "MAX_PAYOUT", value: "500000" },
    { key: "MULTI_MIN_LEGS", value: "2" },
    { key: "MULTI_MAX_LEGS", value: "20" },
  ];
  for (const cfg of configs) {
    await prisma.systemConfig.upsert({ where: { key: cfg.key }, update: { value: cfg.value }, create: cfg });
  }
  console.log(`  ✅ ${configs.length} system configs`);

  // ── Admin User
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@addisbet.demo";
  const adminPass = process.env.ADMIN_SEED_PASSWORD || "Admin123!";
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await hash(adminPass, 10),
      role: AdminRole.SUPER_ADMIN,
    },
  });
  console.log(`  ✅ Admin user: ${adminEmail}`);

  // ── Demo Users (35)
  const passwordHash = await hash("DemoPass123!", 10);
  const membershipLevels: Membership[] = [Membership.STANDARD, Membership.SILVER, Membership.GOLD, Membership.VIP];
  const userIds: string[] = [];

  for (let i = 0; i < ethiopianNames.length; i++) {
    const name = ethiopianNames[i];
    const phone = `+2519${String(i).padStart(8, "0")}`;
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        passwordHash,
        fullName: name,
        dob: new Date(1985 + (i % 15), i % 12, 1 + (i % 28)),
        kycStatus: pick([KycStatus.NONE, KycStatus.VERIFIED, KycStatus.VERIFIED, KycStatus.PENDING]),
        membershipLevel: i < 5 ? Membership.VIP : i < 12 ? Membership.GOLD : i < 22 ? Membership.SILVER : Membership.STANDARD,
        totalWagered: rand(0, 50000),
        isVerified: true,
      },
    });
    userIds.push(user.id);

    // Create wallet
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balance: rand(500, 15000) },
    });
  }
  console.log(`  ✅ ${ethiopianNames.length} demo users with wallets`);

  // ── Matches (across 5 leagues, mix of settled/live/upcoming)
  let matchCount = 0;
  const allMatchIds: string[] = [];

  for (const league of leagues) {
    for (let ti = 0; ti < league.teams.length; ti++) {
      const [home, away] = league.teams[ti];
      const isLive = ti === 0 && (league.name === "Ethiopian Premier League" || league.name === "English Premier League");
      const isSettled = ti >= league.teams.length - 1;

      let status: MatchStatus = MatchStatus.UPCOMING;
      let startTime = hours(randInt(4, 72));
      let minute: number | undefined;
      let homeScore: number | undefined;
      let awayScore: number | undefined;

      if (isLive) {
        status = MatchStatus.LIVE;
        startTime = new Date(Date.now() - randInt(20, 70) * 60000);
        minute = randInt(20, 75);
        homeScore = randInt(0, 2);
        awayScore = randInt(0, 2);
      } else if (isSettled) {
        status = MatchStatus.SETTLED;
        startTime = days(randInt(1, 5));
        homeScore = randInt(0, 4);
        awayScore = randInt(0, 3);
      }

      const match = await prisma.match.create({
        data: {
          sport: "Football",
          league: league.name,
          homeTeam: home,
          awayTeam: away,
          startTime,
          status,
          isLive,
          minute: minute ?? null,
          homeScore: homeScore ?? null,
          awayScore: awayScore ?? null,
        },
      });
      allMatchIds.push(match.id);
      matchCount++;

      // Create odds for each market
      const numMarkets = isLive || ti === 0 ? 5 : randInt(3, 5);
      for (let mi = 0; mi < numMarkets && mi < marketTemplates.length; mi++) {
        const tmpl = marketTemplates[mi];
        const selections = tmpl.gen();
        for (const [selection, value] of selections) {
          await prisma.odds.create({
            data: {
              matchId: match.id,
              marketName: tmpl.name,
              selection,
              value,
            },
          });
        }
      }

      // Create live events for live matches
      if (isLive && minute) {
        const events = [
          { min: randInt(1, 15), type: "chance", desc: `${home} early chance saved by keeper` },
          { min: randInt(16, 35), type: "goal", desc: `GOAL! ${pick([home, away])} scores` },
          { min: randInt(36, 50), type: "card", desc: `Yellow card for ${pick([home, away])} player` },
          { min: randInt(51, minute), type: "var_check", desc: "VAR check — market suspended briefly" },
        ].filter((e) => e.min <= minute!);

        for (const ev of events) {
          await prisma.matchEvent.create({
            data: { matchId: match.id, minute: ev.min, type: ev.type, description: ev.desc },
          });
        }
      }
    }
  }
  console.log(`  ✅ ${matchCount} matches with odds and events`);

  // ── Historical Bets (40 across users)
  let betCount = 0;
  const betStatuses: BetStatus[] = [BetStatus.WON, BetStatus.LOST, BetStatus.LOST, BetStatus.WON, BetStatus.LOST];

  for (let i = 0; i < 40; i++) {
    const userId = pick(userIds);
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) continue;

    const numLegs = randInt(1, 4);
    const matchSample = allMatchIds.sort(() => Math.random() - 0.5).slice(0, numLegs);
    const stake = rand(20, 500);
    const totalOdds = rand(1.5, 8.0);
    const potential = Math.min(500000, Math.round(stake * totalOdds * 100) / 100);
    const status = pick(betStatuses);

    const bet = await prisma.bet.create({
      data: {
        userId,
        betType: numLegs === 1 ? BetType.SINGLE : BetType.MULTI,
        stake,
        totalOdds,
        potentialWin: potential,
        status,
        createdAt: days(randInt(0, 14)),
        settledAt: status !== BetStatus.PENDING ? days(randInt(0, 14)) : null,
      },
    });

    // Create bet items
    for (const matchId of matchSample) {
      const odds = await prisma.odds.findFirst({ where: { matchId } });
      if (odds) {
        await prisma.betItem.create({
          data: {
            betId: bet.id,
            matchId,
            marketName: odds.marketName,
            selection: odds.selection,
            odds: odds.value,
            status,
          },
        });
      }
    }

    // Create corresponding transactions
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: TxType.BET,
        amount: -stake,
        status: TxStatus.COMPLETED,
        note: `Ticket ${bet.id.slice(0, 12)}`,
        createdAt: bet.createdAt,
      },
    });

    if (status === BetStatus.WON) {
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: TxType.WIN,
          amount: potential,
          status: TxStatus.COMPLETED,
          note: `Won ticket ${bet.id.slice(0, 12)}`,
          createdAt: bet.createdAt,
        },
      });
    }

    betCount++;
  }
  console.log(`  ✅ ${betCount} historical bets with transactions`);

  // ── Pending Withdrawals (5)
  for (let i = 0; i < 5; i++) {
    const userId = userIds[i];
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) continue;
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: TxType.WITHDRAW,
        amount: -rand(200, 2000),
        status: TxStatus.PENDING,
        note: "Demo withdrawal request",
        createdAt: days(randInt(0, 3)),
      },
    });
  }
  console.log(`  ✅ 5 pending withdrawal requests`);

  // ── Deposit history for some users
  for (let i = 0; i < 15; i++) {
    const userId = userIds[i % userIds.length];
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) continue;
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: TxType.DEPOSIT,
        amount: pick([500, 1000, 2000, 5000]),
        status: TxStatus.COMPLETED,
        note: "Demo top-up",
        createdAt: days(randInt(0, 10)),
      },
    });
  }
  console.log(`  ✅ 15 deposit records`);

  console.log("\n🎉 Seed complete. Database is ready for demo.\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
