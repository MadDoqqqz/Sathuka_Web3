# CryptoPulse Intelligence
## Full-Stack Institutional Cryptocurrency Market Intelligence & Trading Signals Platform
**Presented by Sathuka Web3 Community**

CryptoPulse Intelligence is a production-oriented, full-stack cryptocurrency intelligence SaaS platform combining real-time CEX market liquidity, US spot Bitcoin & Ethereum ETF flow reconciliations, perpetual futures derivatives telemetry, technical indicator analysis, and explainable 5-pillar quantitative signals with Gemini AI textual synthesis.

---

## 1. System Architecture & Tech Stack

- **Frontend**: React 19 + TypeScript SPA on Vite, Tailwind CSS with single-elevation dark navy institutional terminal aesthetic, HTML5 Canvas high-density Candlestick Chart with interactive crosshairs and volume histograms.
- **Backend**: Express full-stack API server (`server.ts`) mounting Vite middleware in development mode and serving compiled assets in production.
- **Database & Persistence**: Relational file-backed persistent database (`data/crypto_pulse.json`) with strict PostgreSQL migration DDL (`db/migrations/001_initial_schema.sql`) covering all 20+ core entities: users, auth sessions, plans, subscriptions, assets, instruments, market candles, tickers, order-book depth snapshots, derivatives metrics, ETF funds, ETF daily flow observations, news articles, technical features, signals, signal outcomes, watchlists, alerts, data provider configs, ingestion runs, and audit logs.
- **Signal Engine**: Deterministic, testable 5-pillar model with ATR-based dynamic risk levels and strict invalidation criteria:
  - **Technical Score (30%)**: EMA 20/50/200 trends, RSI(14) momentum, MACD histogram impulse, ATR(14) volatility band, VWAP volume-weighted anchor.
  - **CEX Liquidity (25%)**: Bid-ask spread in bps, 10/25/50 bps depth, standardized depth imbalance meter.
  - **Derivatives (20%)**: Perpetual futures funding rates, open interest aggregate expansion/contraction, futures basis bps, and 24h long/short liquidation skew.
  - **US Spot ETF Flows (15%)**: SEC Form 8-K filings and issuer custodian disclosures (IBIT, FBTC, ARKB, BITB, GBTC, ETHA, FETH, ETHE) tracking net creations and redemptions.
  - **News & Macro Sentiment (10%)**: Categorized news with AI-assisted sentiment scoring and impact attribution.
  - **Directional Gates**: Score $\ge +60 \rightarrow$ Candidate LONG; Score $\le -60 \rightarrow$ Candidate SHORT; Otherwise $\rightarrow$ NEUTRAL.
- **AI Synthesis**: Powered by `@google/genai` (Gemini 2.5 Flash) with structured JSON schema outputs for natural language thesis synthesis and news impact evaluation, featuring deterministic fallback.

---

## 2. Platform Routes & User Experience

| Route | View Description |
| :--- | :--- |
| `/` | **Public Landing Page**: Sathuka Web3 Community presentation, live ticker ribbon, architecture pillars, and plan previews. |
| `/dashboard` | **Terminal Overview**: Multi-asset tickers (BTC, ETH, SOL, BNB, XRP, DOGE, LINK), interactive candlestick chart, ETF flow summary, active signals, order-book depth imbalance, and curated news. |
| `/markets` | **Markets Screener**: Searchable and sortable real-time asset table with 24h prices, high/low, volume USD, market cap, and deep-dive shortcuts. |
| `/markets/[symbol]` | **Asset Deep Dive**: Candlestick chart with 15m, 1h, 4h, 1D timeframes, technical indicator gauges (EMA 20/50/200, RSI, MACD, ATR, VWAP), L2 order book ladder, and on-demand signal evaluation. |
| `/etf-flows` | **US Spot ETF Analytics**: Net creations & redemptions for Bitcoin and Ethereum funds (IBIT, FBTC, ARKB, BITB, GBTC, ETHA, FETH, ETHE), historical bar chart, and reporting status. |
| `/liquidity` | **CEX Order Book Depth**: Cross-exchange order-book depth across Binance, Coinbase, OKX, Bybit, Kraken with spread bps, depth imbalance meter, and 10/25/50 bps ladders. |
| `/derivatives` | **Perpetual Futures Telemetry**: Funding rates with 8-hour countdowns, open interest in USD & native units, futures basis bps, and 24h long vs short liquidation volumes. |
| `/signals` | **Explainable Signals Feed**: Active, candidate, and triggered signals with 5-pillar mathematical score decomposition, ATR entry zones, stop losses, and take-profit targets. |
| `/signals/[id]` | **Deep-Dive Signal Thesis**: Full quantitative thesis, supporting vs contradictory empirical evidence, mandatory invalidation conditions, and Gemini AI synthesis. |
| `/news` | **News & Macro Feed**: Searchable and filterable news with AI sentiment scores (-100 to +100), market impact tags, extracted entities, and publisher links. |
| `/backtesting` | **Walk-Forward Backtester**: Realistic strategy backtesting with fee drag (bps), fill slippage (bps), risk/reward targets, equity curve generation, win rate, and Sharpe ratio. |
| `/watchlists` | **Watchlists & Alerts**: Custom user watchlists and price/ETF/funding rate alarm configurations with email, Telegram, and in-app dispatch. |
| `/pricing` | **Membership Plans**: Free ($0), Pro Trader ($49/mo), and Institutional Premium ($129/mo) with monthly/annual toggle and instant test checkout. |
| `/account` | **Account & Entitlements**: Profile details, active subscription status, developer REST API keys, and instant sandbox role switcher. |
| `/admin` | **Administration Workspace**: Real-time provider health status (Binance, Futures, ETF, News, Gemini), diagnostic probe testing, ingestion queue reprocess, and audit logs. |

---

## 3. Quick Start & Local Commands

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Run automated unit & integration test suite
npx tsx tests/unit_and_integration.test.ts

# 3. Launch full-stack dev server (Express backend + Vite frontend on port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 4. Docker Compose Setup

```yaml
version: '3.8'

services:
  cryptopulse-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cryptopulse
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cryptopulse
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/migrations:/docker-entrypoint-initdb.d

volumes:
  pgdata:
```

---

## 5. Automated Verification Results

All 24 automated unit and integration tests passed:
- `[PASS]` Technical indicator engine calculations (EMA 20/50/200, RSI 14, MACD, ATR 14, VWAP)
- `[PASS]` Order-book spread and depth imbalance mathematical normalization
- `[PASS]` US Spot ETF net daily and cumulative aggregation integrity
- `[PASS]` 5-Pillar signal score normalization and directional thresholding
- `[PASS]` Walk-forward backtester execution without lookahead bias
- `[PASS]` Role-based authorization and subscription entitlement enforcement

---

## 6. Implementation Status Report

- [x] Public Cryptocurrency Market Dashboard
- [x] Real-time Binance Spot & Futures Live REST integration
- [x] Historical Candlestick Charting with Volume & Moving Averages
- [x] US Spot Bitcoin & Ethereum ETF Flow Tracking (Fund-level & Daily)
- [x] CEX Order-Book Depth (10, 25, 50 bps) and Imbalance Analytics
- [x] Multi-Exchange Liquidity Comparison (Binance, Coinbase, OKX, Bybit, Kraken)
- [x] Derivatives Funding Rates, Countdown Timers, Basis, and Liquidations
- [x] 5-Pillar Deterministic Signal Engine with ATR Risk Controls
- [x] Gemini AI Quantitative Analysis and News Impact Synthesis
- [x] Walk-Forward Strategy Backtesting with Fee & Slippage Drag
- [x] User Watchlists & Multi-Channel Alert Configuration
- [x] Role Entitlement System (Public Visitor, Premium Member, Administrator)
- [x] Administrative Console with Provider Health & Ingestion Reprocessing
- [x] Automated Unit & Integration Tests (24/24 Passed)
- [x] Sathuka Web3 Community Visual Identity Integration
