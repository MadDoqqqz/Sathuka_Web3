-- CryptoPulse Intelligence PostgreSQL Database Schema Migration 001
-- Defines institutional crypto market intelligence, ETF flows, liquidity, and signal engine schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users and Authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  display_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'PUBLIC_VISITOR', -- PUBLIC_VISITOR, PREMIUM_MEMBER, ADMINISTRATOR
  email_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Subscriptions and Plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  billing_interval VARCHAR(20) NOT NULL, -- month, year
  price_amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  provider_price_id VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  billing_provider VARCHAR(50) DEFAULT 'STRIPE',
  provider_customer_id VARCHAR(100),
  provider_subscription_id VARCHAR(100),
  status VARCHAR(50) NOT NULL, -- ACTIVE, TRIALING, CANCELED, INACTIVE
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  provider_event_id VARCHAR(100) UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  payload_json JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Assets & Exchange Instruments
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  canonical_asset_id VARCHAR(50),
  network VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  metadata_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS instruments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  exchange VARCHAR(50) NOT NULL, -- Binance, Coinbase, OKX, Bybit, Kraken
  exchange_symbol VARCHAR(50) NOT NULL,
  market_type VARCHAR(20) NOT NULL, -- SPOT, PERPETUAL, EXPIRING_FUTURES
  quote_currency VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  metadata_json JSONB
);

-- 4. Market Candles & Tickers
CREATE TABLE IF NOT EXISTS market_candles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  timeframe VARCHAR(10) NOT NULL, -- 15m, 1h, 4h, 1D
  open_time BIGINT NOT NULL,
  close_time BIGINT NOT NULL,
  open NUMERIC(18, 8) NOT NULL,
  high NUMERIC(18, 8) NOT NULL,
  low NUMERIC(18, 8) NOT NULL,
  close NUMERIC(18, 8) NOT NULL,
  volume NUMERIC(24, 8) NOT NULL,
  quote_volume NUMERIC(24, 8),
  source VARCHAR(50) NOT NULL,
  ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_instrument_timeframe_open UNIQUE (instrument_id, timeframe, open_time)
);

CREATE TABLE IF NOT EXISTS market_tickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  price NUMERIC(18, 8) NOT NULL,
  bid NUMERIC(18, 8),
  ask NUMERIC(18, 8),
  volume_24h NUMERIC(24, 8),
  change_24h NUMERIC(8, 4),
  observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) NOT NULL
);

-- 5. CEX Order Book & Depth Snapshots
CREATE TABLE IF NOT EXISTS orderbook_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  exchange VARCHAR(50) NOT NULL,
  bids_json JSONB NOT NULL,
  asks_json JSONB NOT NULL,
  sequence_id BIGINT,
  mid_price NUMERIC(18, 8) NOT NULL,
  spread_bps NUMERIC(10, 4) NOT NULL,
  bid_depth_json JSONB NOT NULL,
  ask_depth_json JSONB NOT NULL,
  imbalance NUMERIC(8, 4) NOT NULL,
  observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Derivatives Metrics
CREATE TABLE IF NOT EXISTS derivatives_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  funding_rate NUMERIC(10, 8) NOT NULL,
  open_interest NUMERIC(24, 8) NOT NULL,
  open_interest_unit VARCHAR(20) DEFAULT 'USD',
  futures_basis NUMERIC(10, 4),
  liquidation_long_usd NUMERIC(18, 2),
  liquidation_short_usd NUMERIC(18, 2),
  observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source VARCHAR(50) NOT NULL
);

-- 7. US Spot ETF Analytics
CREATE TABLE IF NOT EXISTS etf_funds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker VARCHAR(20) UNIQUE NOT NULL,
  fund_name VARCHAR(150) NOT NULL,
  underlying_asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  issuer VARCHAR(100) NOT NULL,
  fee_percent NUMERIC(5, 3),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS etf_flow_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fund_id UUID REFERENCES etf_funds(id) ON DELETE CASCADE,
  observation_date DATE NOT NULL,
  net_flow_usd NUMERIC(18, 2) NOT NULL,
  aum_usd NUMERIC(18, 2),
  nav NUMERIC(14, 4),
  shares_outstanding NUMERIC(20, 2),
  publication_status VARCHAR(50) DEFAULT 'FINALIZED', -- FINALIZED, PRELIMINARY, ESTIMATED
  source VARCHAR(100) NOT NULL,
  source_url TEXT,
  observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  methodology_version VARCHAR(50),
  CONSTRAINT uq_fund_date_source UNIQUE (fund_id, observation_date, source)
);

-- 8. News and Content Analysis
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_url TEXT UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  publisher VARCHAR(150) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(50) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  summary TEXT,
  source_type VARCHAR(50),
  content_rights VARCHAR(100),
  metadata_json JSONB
);

CREATE TABLE IF NOT EXISTS news_asset_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  relevance_score NUMERIC(5, 2),
  sentiment_score NUMERIC(5, 2),
  impact_score NUMERIC(5, 2)
);

-- 9. Signals and Technical Indicators
CREATE TABLE IF NOT EXISTS technical_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  timeframe VARCHAR(10) NOT NULL,
  candle_time BIGINT NOT NULL,
  ema_20 NUMERIC(18, 8),
  ema_50 NUMERIC(18, 8),
  ema_200 NUMERIC(18, 8),
  rsi_14 NUMERIC(8, 2),
  macd NUMERIC(12, 4),
  macd_signal NUMERIC(12, 4),
  atr_14 NUMERIC(14, 4),
  vwap NUMERIC(18, 8),
  feature_version VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  timeframe VARCHAR(10) NOT NULL,
  direction VARCHAR(20) NOT NULL, -- LONG, SHORT, NEUTRAL
  entry_min NUMERIC(18, 8) NOT NULL,
  entry_max NUMERIC(18, 8) NOT NULL,
  stop_loss NUMERIC(18, 8) NOT NULL,
  take_profit_1 NUMERIC(18, 8) NOT NULL,
  take_profit_2 NUMERIC(18, 8) NOT NULL,
  take_profit_3 NUMERIC(18, 8) NOT NULL,
  confidence_score NUMERIC(5, 2) NOT NULL,
  risk_reward NUMERIC(6, 2) NOT NULL,
  methodology_version VARCHAR(50) NOT NULL,
  rationale_json JSONB NOT NULL,
  status VARCHAR(50) NOT NULL, -- CANDIDATE, ACTIVE, TRIGGERED, TARGET_PARTIAL, TARGET_COMPLETE, STOPPED, INVALIDATED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  invalidated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS signal_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  evaluation_window VARCHAR(50),
  entry_fill_assumption VARCHAR(50),
  exit_reason VARCHAR(50),
  gross_return NUMERIC(8, 4),
  net_return NUMERIC(8, 4),
  max_favorable_excursion NUMERIC(8, 4),
  max_adverse_excursion NUMERIC(8, 4),
  fees NUMERIC(10, 4),
  slippage NUMERIC(10, 4),
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Watchlists, Alerts and Notifications
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist_assets (
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  PRIMARY KEY (watchlist_id, asset_id)
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  configuration_json JSONB NOT NULL,
  channels_json JSONB NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  cooldown_seconds INT DEFAULT 3600,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  payload_json JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'SENT',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Data Source Configuration & Observability
CREATE TABLE IF NOT EXISTS data_provider_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name VARCHAR(100) NOT NULL,
  provider_type VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  public_config_json JSONB,
  secret_reference VARCHAR(100),
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_error_at TIMESTAMP WITH TIME ZONE,
  health_status VARCHAR(50) DEFAULT 'HEALTHY'
);

CREATE TABLE IF NOT EXISTS ingestion_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name VARCHAR(100) NOT NULL,
  job_type VARCHAR(100) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL,
  records_processed INT DEFAULT 0,
  records_failed INT DEFAULT 0,
  error_summary TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  metadata_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candles_instrument_time ON market_candles(instrument_id, timeframe, open_time DESC);
CREATE INDEX IF NOT EXISTS idx_etf_flows_fund_date ON etf_flow_observations(fund_id, observation_date DESC);
CREATE INDEX IF NOT EXISTS idx_signals_instrument_status ON signals(instrument_id, status);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_status ON ingestion_runs(started_at DESC, status);
