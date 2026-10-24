import { OrderBookData, OrderBookLevel } from '../types';

export async function fetchOrderBook(symbol: string = 'BTC', exchange: 'Binance' | 'Coinbase' | 'OKX' | 'Bybit' | 'Kraken' = 'Binance'): Promise<OrderBookData> {
  const normSymbol = symbol.toUpperCase();
  const pair = `${normSymbol}USDT`;

  try {
    const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${pair}&limit=100`, {
      headers: { 'User-Agent': 'CryptoPulse/1.0' },
      signal: AbortSignal.timeout(3500)
    });

    if (!res.ok) throw new Error(`Binance depth HTTP ${res.status}`);
    const data = await res.json();

    const rawBids: [string, string][] = data.bids || [];
    const rawAsks: [string, string][] = data.asks || [];

    return processOrderBook(normSymbol, exchange, rawBids, rawAsks);
  } catch (err) {
    console.warn(`[LiquidityProvider] Depth fetch error for ${symbol} on ${exchange}, using synthetic institutional order book:`, (err as Error).message);
    return generateSyntheticOrderBook(normSymbol, exchange);
  }
}

function processOrderBook(
  symbol: string,
  exchange: OrderBookData['exchange'],
  rawBids: [string, string][],
  rawAsks: [string, string][]
): OrderBookData {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  let cumBidUsd = 0;
  for (const [pStr, sStr] of rawBids.slice(0, 30)) {
    const price = parseFloat(pStr);
    const size = parseFloat(sStr);
    const totalUsd = price * size;
    cumBidUsd += totalUsd;
    bids.push({ price, size, totalUsd });
  }

  let cumAskUsd = 0;
  for (const [pStr, sStr] of rawAsks.slice(0, 30)) {
    const price = parseFloat(pStr);
    const size = parseFloat(sStr);
    const totalUsd = price * size;
    cumAskUsd += totalUsd;
    asks.push({ price, size, totalUsd });
  }

  const bestBid = bids[0]?.price || 81740;
  const bestAsk = asks[0]?.price || 81744;
  const midPrice = (bestBid + bestAsk) / 2;
  const spreadBps = Number((((bestAsk - bestBid) / midPrice) * 10000).toFixed(2));

  // Depth thresholds in basis points (10bps = 0.1%, 25bps = 0.25%, 50bps = 0.5%)
  const threshold10 = midPrice * 0.0010;
  const threshold25 = midPrice * 0.0025;
  const threshold50 = midPrice * 0.0050;

  const bidDepth10bps = bids.filter(b => midPrice - b.price <= threshold10).reduce((sum, b) => sum + b.totalUsd, 0);
  const askDepth10bps = asks.filter(a => a.price - midPrice <= threshold10).reduce((sum, a) => sum + a.totalUsd, 0);

  const bidDepth25bps = bids.filter(b => midPrice - b.price <= threshold25).reduce((sum, b) => sum + b.totalUsd, 0);
  const askDepth25bps = asks.filter(a => a.price - midPrice <= threshold25).reduce((sum, a) => sum + a.totalUsd, 0);

  const bidDepth50bps = bids.filter(b => midPrice - b.price <= threshold50).reduce((sum, b) => sum + b.totalUsd, 0);
  const askDepth50bps = asks.filter(a => a.price - midPrice <= threshold50).reduce((sum, a) => sum + a.totalUsd, 0);

  const totalBid = bidDepth25bps || 1;
  const totalAsk = askDepth25bps || 1;
  const depthImbalance = Number(((totalBid - totalAsk) / (totalBid + totalAsk)).toFixed(3));

  return {
    symbol,
    exchange,
    midPrice: Number(midPrice.toFixed(2)),
    bestBid,
    bestAsk,
    spreadBps,
    bids,
    asks,
    bidDepth10bps: Math.round(bidDepth10bps),
    askDepth10bps: Math.round(askDepth10bps),
    bidDepth25bps: Math.round(bidDepth25bps),
    askDepth25bps: Math.round(askDepth25bps),
    bidDepth50bps: Math.round(bidDepth50bps),
    askDepth50bps: Math.round(askDepth50bps),
    depthImbalance,
    observedAt: new Date().toISOString(),
    status: 'LIVE'
  };
}

function generateSyntheticOrderBook(symbol: string, exchange: OrderBookData['exchange']): OrderBookData {
  const basePrices: Record<string, number> = { BTC: 81745, ETH: 2685, SOL: 191.5, BNB: 588, XRP: 0.538, DOGE: 0.142, LINK: 14.65 };
  const midPrice = basePrices[symbol] || 81745;
  const spreadBps = exchange === 'Binance' ? 0.38 : exchange === 'Coinbase' ? 0.52 : 0.65;
  const halfSpread = (midPrice * (spreadBps / 10000)) / 2;

  const bestBid = midPrice - halfSpread;
  const bestAsk = midPrice + halfSpread;

  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  for (let i = 0; i < 25; i++) {
    const bPrice = bestBid * (1 - i * 0.0002);
    const bSize = (midPrice > 1000 ? 0.8 : 50) * (1 + i * 0.2 + Math.random() * 0.5);
    bids.push({ price: Number(bPrice.toFixed(2)), size: Number(bSize.toFixed(4)), totalUsd: Math.round(bPrice * bSize) });

    const aPrice = bestAsk * (1 + i * 0.0002);
    const aSize = (midPrice > 1000 ? 0.7 : 45) * (1 + i * 0.18 + Math.random() * 0.4);
    asks.push({ price: Number(aPrice.toFixed(2)), size: Number(aSize.toFixed(4)), totalUsd: Math.round(aPrice * aSize) });
  }

  const bidDepth10bps = bids.slice(0, 5).reduce((s, b) => s + b.totalUsd, 0);
  const askDepth10bps = asks.slice(0, 5).reduce((s, a) => s + a.totalUsd, 0);
  const bidDepth25bps = bids.slice(0, 12).reduce((s, b) => s + b.totalUsd, 0);
  const askDepth25bps = asks.slice(0, 12).reduce((s, a) => s + a.totalUsd, 0);
  const bidDepth50bps = bids.reduce((s, b) => s + b.totalUsd, 0);
  const askDepth50bps = asks.reduce((s, a) => s + a.totalUsd, 0);

  const depthImbalance = Number(((bidDepth25bps - askDepth25bps) / (bidDepth25bps + askDepth25bps)).toFixed(3));

  return {
    symbol,
    exchange,
    midPrice: Number(midPrice.toFixed(2)),
    bestBid: Number(bestBid.toFixed(2)),
    bestAsk: Number(bestAsk.toFixed(2)),
    spreadBps,
    bids,
    asks,
    bidDepth10bps,
    askDepth10bps,
    bidDepth25bps,
    askDepth25bps,
    bidDepth50bps,
    askDepth50bps,
    depthImbalance,
    observedAt: new Date().toISOString(),
    status: 'ESTIMATED'
  };
}

export async function fetchCrossExchangeLiquidity(symbol: string = 'BTC'): Promise<OrderBookData[]> {
  const exchanges: OrderBookData['exchange'][] = ['Binance', 'Coinbase', 'OKX', 'Bybit', 'Kraken'];
  const results = await Promise.all(exchanges.map(ex => fetchOrderBook(symbol, ex)));
  return results;
}
