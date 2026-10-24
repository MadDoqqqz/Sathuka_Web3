import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI();
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return aiClient;
}

export interface AISignalAnalysis {
  marketSummary: string;
  directionalBias: 'LONG' | 'SHORT' | 'NEUTRAL';
  supportingEvidence: string[];
  contradictoryEvidence: string[];
  keyRisks: string[];
  invalidationConditions: string[];
  summaryGeneratedAt: string;
}

export async function generateAISignalThesis(
  symbol: string,
  price: number,
  technicalData: { rsi: number; ema20: number; ema50: number; vwap: number },
  orderBookData: { spreadBps: number; depthImbalance: number },
  derivativesData: { fundingRate: number; openInterestUsd: number },
  etfFlowUsd: number
): Promise<AISignalAnalysis> {
  const client = getAiClient();
  const timestamp = new Date().toISOString();

  if (client) {
    try {
      const prompt = `You are an institutional quantitative crypto market analyst for CryptoPulse Intelligence.
Analyze this structured market state for ${symbol}:
- Current Price: $${price.toLocaleString()}
- Technical Indicators: RSI(14)=${technicalData.rsi}, EMA20=$${technicalData.ema20.toLocaleString()}, EMA50=$${technicalData.ema50.toLocaleString()}, VWAP=$${technicalData.vwap.toLocaleString()}
- CEX Order Book: Spread=${orderBookData.spreadBps} bps, 25bps Depth Imbalance=${(orderBookData.depthImbalance * 100).toFixed(1)}% (positive favors bids)
- Derivatives: Funding Rate=${(derivativesData.fundingRate * 100).toFixed(4)}%, Open Interest=$${(derivativesData.openInterestUsd / 1e9).toFixed(2)}B
- US Spot ETF 24h Net Inflow: $${(etfFlowUsd / 1e6).toFixed(1)}M

Return ONLY a valid JSON object matching this schema:
{
  "marketSummary": "1-2 sentence concise executive summary",
  "directionalBias": "LONG" | "SHORT" | "NEUTRAL",
  "supportingEvidence": ["point 1", "point 2", "point 3"],
  "contradictoryEvidence": ["risk 1", "risk 2"],
  "keyRisks": ["risk 1", "risk 2"],
  "invalidationConditions": ["condition 1", "condition 2"]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);

      return {
        marketSummary: parsed.marketSummary || `${symbol} displays structural resilience with favorable depth.`,
        directionalBias: parsed.directionalBias || 'LONG',
        supportingEvidence: Array.isArray(parsed.supportingEvidence) ? parsed.supportingEvidence : [],
        contradictoryEvidence: Array.isArray(parsed.contradictoryEvidence) ? parsed.contradictoryEvidence : [],
        keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks : [],
        invalidationConditions: Array.isArray(parsed.invalidationConditions) ? parsed.invalidationConditions : [],
        summaryGeneratedAt: timestamp
      };
    } catch (err) {
      console.warn('[GeminiAIService] AI generation failed, falling back to deterministic synthesis:', (err as Error).message);
    }
  }

  // Deterministic fallback synthesis
  const isBullish = orderBookData.depthImbalance > 0 && technicalData.rsi > 48;
  return {
    marketSummary: `${symbol} exhibits ${isBullish ? 'bullish structural momentum' : 'indecisive range consolidation'} with order book depth imbalance at ${(orderBookData.depthImbalance * 100).toFixed(1)}%.`,
    directionalBias: isBullish ? 'LONG' : 'NEUTRAL',
    supportingEvidence: [
      `Price holding relative to VWAP ($${technicalData.vwap.toLocaleString()}).`,
      `Order-book depth imbalance is ${(orderBookData.depthImbalance * 100).toFixed(1)}% on primary CEX venues.`,
      `Derivatives funding rate at ${(derivativesData.fundingRate * 100).toFixed(4)}% suggests disciplined positioning.`
    ],
    contradictoryEvidence: [
      `RSI at ${technicalData.rsi} requires confirmation above resistance.`,
      `Macro headline volatility could impact weekend order-book depth.`
    ],
    keyRisks: [
      'Sudden aggregate market liquidation cascade.',
      'Unexpected net outflows in US spot ETF reporting.'
    ],
    invalidationConditions: [
      `Breach of technical moving average support.`,
      `Spread widening beyond 5 bps indicating institutional market-maker withdrawal.`
    ],
    summaryGeneratedAt: timestamp
  };
}
