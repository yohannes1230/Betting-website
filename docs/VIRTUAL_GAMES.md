# Tipplay — Virtual Games Provider Integration Guide

This document outlines the scaffolding architecture and provider integration requirements for the **Tipplay Virtual Games** suite (`/virtual-games`).

---

## Current Architecture & Scaffolding Status

The Virtual Games lobby currently hosts 20 scaffolded virtual/instant game formats:
1. Virtual Football League (`v-football-league`)
2. Virtual Champions Cup (`v-champions-cup`)
3. Virtual Horse Racing (`v-horse-racing`)
4. Virtual Greyhound Racing (`v-greyhound-racing`)
5. Virtual Basketball (`v-basketball`)
6. Virtual Tennis Open (`v-tennis-open`)
7. Virtual Motor Racing (`v-motor-racing`)
8. Virtual Cycling (`v-cycling`)
9. Fast Keno Draw (`v-keno`)
10. Rocket Crash (`v-rocket-crash`)
11. Plinko Drop (`v-plinko`)
12. Mines Grid (`v-mines`)
13. Dice Roll (`v-dice`)
14. Wheel of Fortune (`v-spin-wheel`)
15. Virtual Lottery Draw (`v-lottery`)
16. Instant Scratch Cards (`v-scratch-cards`)
17. HiLo Card Game (`v-hilo`)
18. Coin Flip Streak (`v-coin-flip`)
19. Penalty Shootout (`v-penalty-shootout`)
20. Virtual Boxing / Combat Sim (`v-combat-sim`)

Currently, launching any game card opens `<VirtualGameLauncher game={game} />` in `components/ui/VirtualGameLauncher.tsx`, displaying an integration pending container.

---

## Production Integration Steps

To go live with real money or live RNG virtual games, integrate a licensed virtual games provider or aggregator using the steps below:

### 1. License & Provider Selection
Recommended B2B virtual game providers for the Ethiopian and African sportsbook market:
- **Golden Race** (Virtual Football, Greyhound, Horse Racing, Keno)
- **Kiron Interactive** (Virtual Sports Suite, Racing, Penalty Shootout)
- **Digitain** (Virtual Sports Engine)
- **Altenar / Betradar Virtuals** (Virtual Football League, Tennis, Basketball)
- **Spribe / Pragmatic Play** (Crash games, Plinko, Mines, Dice)

### 2. Developer Integration Instructions
1. Obtain provider credentials (`API_KEY`, `OPERATOR_ID`, `LAUNCH_URL`).
2. Add provider SDK script tag or embed URL generator function.
3. Update `<VirtualGameLauncher />` in `components/ui/VirtualGameLauncher.tsx`:
   ```tsx
   // Replace placeholder container with provider iframe/SDK:
   <iframe
     src={`${PROVIDER_LAUNCH_URL}?gameId=${game.id}&token=${userToken}`}
     className="w-full h-[500px] border-0 rounded-2xl"
     allow="autoplay; fullscreen"
   />
   ```
4. Handle seamless wallet balance callbacks (`DEDUCT_STAKE`, `CREDIT_WINNINGS`) in your wallet backend integrations.
