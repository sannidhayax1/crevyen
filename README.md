# 🃏 Adaptive Memory Match

A browser-based memory card matching game that tracks your performance and **adapts the difficulty** for the next round based on documented rules.

## 🎮 Play Now

Play online: [Adaptive Memory Match](https://sannidhayax1.github.io/crevyen/).

---

## ✨ Features

- **4×4 grid** with 8 emoji pairs
- **3 difficulty levels** (Easy / Medium / Hard) with different mismatch reveal delays
- **Adaptive difficulty** — the next round's difficulty is set by documented move + time thresholds, and the win screen explains *exactly why* it changed
- **Reproducible sessions** via a seeded PRNG (mulberry32); set any seed in Help → Set Seed
- **All click guards**: third card during reveal, matched cards, repeat clicks
- **Safe restart** — pending timers are always cleared before the new game starts
- **Session history** persisted to `sessionStorage` (anonymous, cleared when tab closes)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Testing | Vitest 2 + jsdom |
| Linting | ESLint + TypeScript-ESLint |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

---

## 🚀 Getting Started

```bash
cd memory-match
npm install
npm run dev        # http://localhost:5173
```

### Run tests

```bash
npm test           # run all tests once
npm run test:watch # watch mode
```

### Build for production

```bash
npm run build      # outputs to dist/
```

---

## 📐 Difficulty Adaptation Rules

| Current | Condition | Next |
|---|---|---|
| Easy | ≤ 12 moves **and** < 60 s | **Medium** |
| Medium | ≤ 16 moves **and** < 90 s | **Hard** |
| Medium | > 24 moves **or** > 120 s | **Easy** |
| Hard | > 22 moves **or** > 110 s | **Medium** |
| Any | Otherwise | Same level |

The Win modal displays the exact threshold that triggered the change.

---

## ☁️ GitHub Pages

### One-time setup

1. In the GitHub repository, open **Settings → Pages**.
2. Set the build and deployment source to **GitHub Actions**.
3. Push to `main` — GitHub Actions will test, build, and deploy automatically.

### What the workflows do

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | Every push / PR | Lint → Test → Build |
| `deploy.yml` | Push to `main` or manual dispatch | Test → Build → Deploy to GitHub Pages |

---

## 🗂️ Project Structure

```
memory-match/
├── .github/workflows/    # CI + Azure deploy
├── public/               # staticwebapp.config.json (Azure SWA routing)
├── src/
│   ├── game/             # Pure logic: PRNG, shuffle, difficulty, session, reducer
│   ├── hooks/            # useGameTimer
│   ├── components/       # Card, Board, HUD, WinModal, SessionHistory, Instructions
│   ├── App.tsx           # Orchestrator
│   └── main.tsx
└── test/                 # Vitest unit tests for all pure logic
```

---

## 🧪 Test Coverage

| Module | What's tested |
|---|---|
| `prng.ts` | Reproducibility, range, independence |
| `shuffle.ts` | All elements preserved, no mutation, reproducible, edge cases |
| `difficulty.ts` | All promotion/demotion boundaries + reason strings |
| `gameReducer.ts` | All phase transitions, all click guards, stale timer safety, win detection |
