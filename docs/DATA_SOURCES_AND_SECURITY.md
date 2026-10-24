# CryptoPulse Intelligence: Data Sources & Security Architecture

## 1. Data Provider Specifications & Normalization

### A. Spot Market Data
- **Primary Source**: Binance Public Spot REST (`https://api.binance.com/api/v3`) & WebSocket Streams.
- **Normalization**: All instruments normalized into internal `MarketTicker` format with UTC timestamps.
- **Freshness SLA**: Tickers cache TTL = 3 seconds; OHLCV Candles cache TTL = 30 seconds.
- **Graceful Fallback**: If external connectivity is interrupted, verified historical cache snapshots are served with status labeled as `ESTIMATED`.

### B. Centralized Exchange (CEX) Liquidity
- **Supported Venues**: Binance, Coinbase, OKX, Bybit, Kraken.
- **Formulas**:
  - `mid_price = (best_bid + best_ask) / 2`
  - `spread_bps = ((best_ask - best_bid) / mid_price) * 10000`
  - `depth_imbalance = (bid_depth_usd - ask_depth_usd) / (bid_depth_usd + ask_depth_usd)`
  - Standardized depth windows at 10, 25, and 50 basis points from mid-price.
- **Disclaimer**: Displayed order book depth represents visible limit orders subject to algorithmic cancellation and does not imply guaranteed execution.

### C. US Spot ETF Flow Reconciliations
- **Covered Funds**:
  - Bitcoin: IBIT (BlackRock), FBTC (Fidelity), ARKB (ARK/21Shares), BITB (Bitwise), GBTC (Grayscale).
  - Ethereum: ETHA (BlackRock), FETH (Fidelity), ETHE (Grayscale).
- **Source**: SEC Form 8-K filings and authorized participant custodian reports (BNY Mellon, Coinbase Custody).
- **Integrity Guarantee**: Observation dates ($T$) are stored separately from ingestion timestamps ($T+1$). Flow volume is never equated with intraday share trading volume.

### D. Derivatives & Perpetual Futures
- **Primary Source**: Binance Futures (`https://fapi.binance.com/fapi/v1`).
- **Telemetry**: 8-hour funding rates, countdown timers, aggregate open interest in USD & native units, futures basis bps, and 24h long/short liquidation amounts.

### E. News & Macro Intelligence
- **Aggregation**: Curated financial wires, regulatory releases (SEC, ESMA, MiCA), and crypto dispatches.
- **Attribution**: Original publisher URLs, publisher names, and publication timestamps are preserved. Untrusted text is strictly sandboxed.

---

## 2. Security Architecture & Threat Modeling

1. **Server-Side Authorization**: Every protected route (`/api/v1/signals`, `/api/v1/liquidity`, `/api/v1/admin/*`) enforces role-based rank checks (`PUBLIC_VISITOR` < `PREMIUM_MEMBER` < `ADMINISTRATOR`). Client-side UI controls mirror these permissions.
2. **Untrusted News Text Sanitization**: News content is treated as untrusted text; no raw HTML rendering or dynamic script evaluation is permitted.
3. **Secrets Management**: No API secrets or private exchange credentials are sent to client browsers. All external fetch calls occur server-side.
4. **Deterministic Risk Invariants**: AI models are restricted to textual explanations and cannot alter numeric price levels, calculated indicators, or stop losses.
5. **Immutable Audit Trail**: All privileged actions (signal generation, provider reconfiguration, subscription updates) are logged with user ID, timestamp, and details.
