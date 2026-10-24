# CryptoPulse Intelligence API Documentation
**Version: v1.0.0 · Base Path: `/api/v1`**

All responses are normalized JSON with consistent timestamping and source tracking.

---

## 1. Public Endpoints

### `GET /api/v1/health`
System status, database connectivity, and provider health.

**Response (200 OK):**
```json
{
  "status": "HEALTHY",
  "system": "CryptoPulse Intelligence Platform",
  "version": "1.0.0",
  "timestamp": "2026-10-23T01:50:00Z",
  "database": "CONNECTED",
  "providers": [
    { "name": "Binance Public Spot REST & WebSocket", "status": "HEALTHY", "latencyMs": 82 }
  ]
}
```

### `GET /api/v1/markets`
Returns 24h ticker metrics for all supported assets (BTC, ETH, SOL, BNB, XRP, DOGE, LINK).

### `GET /api/v1/markets/:symbol`
Returns real-time price quote and computed technical indicators (EMA 20/50/200, RSI 14, MACD, ATR 14, VWAP) for the specified symbol.

### `GET /api/v1/markets/:symbol/candles?interval=1h&limit=100`
Returns historical OHLCV candle series.
- `interval`: `15m`, `1h`, `4h`, `1D`
- `limit`: `10` to `200`

### `GET /api/v1/etf-flows/summary`
Returns aggregate US Spot Bitcoin and Ethereum ETF daily net flows and cumulative creations.

### `GET /api/v1/news?category=ETF&asset=BTC`
Searchable and filterable crypto and macro news feed.

### `GET /api/v1/signals/public`
Returns delayed public candidate signals for non-subscribers.

---

## 2. Premium Member Endpoints (Requires `PREMIUM_MEMBER` or `ADMINISTRATOR`)

### `GET /api/v1/etf-flows/funds`
Detailed fund-level breakdowns (IBIT, FBTC, ARKB, BITB, GBTC, ETHA, FETH, ETHE) including Sponsor Fee, Daily Flow USD, Weekly Flow, Monthly Flow, and Total AUM.

### `GET /api/v1/liquidity/orderbook?symbol=BTC&exchange=Binance`
Returns L2 order book bids and asks with mid-price, spread bps, 10/25/50 bps depth, and depth imbalance.

### `GET /api/v1/liquidity/depth?symbol=BTC`
Cross-exchange liquidity comparison across Binance, Coinbase, OKX, Bybit, and Kraken.

### `GET /api/v1/derivatives?symbol=BTC`
Returns perpetual futures funding rates, predicted funding rates, countdown timers, open interest in USD & native units, futures basis bps, and 24h long/short liquidation metrics.

### `GET /api/v1/signals`
Full feed of active, triggered, and candidate signals with complete 5-pillar mathematical score breakdowns.

### `POST /api/v1/signals/generate`
Triggers real-time quantitative signal evaluation for an asset.
**Request Body:**
```json
{
  "symbol": "BTC",
  "timeframe": "4h"
}
```

### `POST /api/v1/ai/explain`
Invokes Gemini AI quantitative analyst for structured thesis generation.
**Request Body:**
```json
{
  "symbol": "BTC"
}
```

### `POST /api/v1/backtests`
Executes walk-forward strategy backtest.
**Request Body:**
```json
{
  "symbol": "BTC",
  "timeframe": "4h",
  "entryThresholdScore": 55,
  "riskRewardTarget": 2.8,
  "feeBps": 5,
  "slippageBps": 2,
  "capitalUsd": 100000
}
```

---

## 3. Account & Subscription Endpoints

### `GET /api/v1/account`
Returns user profile, active plan, and available sandbox test profiles.

### `POST /api/v1/account/role`
Switches active user or upgrades test role.

### `POST /api/v1/billing/checkout`
Upgrades user subscription to Pro or Premium.

---

## 4. Administrative Endpoints (Requires `ADMINISTRATOR`)

### `GET /api/v1/admin/providers`
External data provider configurations, health status, and latency metrics.

### `POST /api/v1/admin/providers/:id/test`
Triggers immediate diagnostic probe of provider endpoint.

### `GET /api/v1/admin/ingestion-runs`
History of automated and manual data ingestion jobs.

### `POST /api/v1/admin/ingestion-runs/:id/retry`
Reprocesses failed or manual ingestion job.

### `GET /api/v1/admin/audit-logs`
Immutable administrative audit trail.
