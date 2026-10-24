import React, { useEffect, useRef, useState } from 'react';
import { Candle } from '../types';

interface CandleChartProps {
  candles: Candle[];
  height?: number;
  symbol: string;
  interval: string;
  showEma?: boolean;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  candles,
  height = 360,
  symbol,
  interval,
  showEma = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Layout dimensions
    const padding = { top: 20, right: 65, bottom: 30, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const priceChartHeight = chartHeight * 0.75;
    const volumeChartHeight = chartHeight * 0.20;
    const volumeChartTop = padding.top + priceChartHeight + (chartHeight * 0.05);

    // Clear canvas
    ctx.fillStyle = '#0B101B';
    ctx.fillRect(0, 0, width, height);

    // Find min/max price & volume
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    for (const c of candles) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    }

    // Add 2% padding on price
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.02;
    maxPrice += priceRange * 0.02;

    const candleWidth = Math.max(2, Math.floor(chartWidth / candles.length) - 2);
    const stepX = chartWidth / candles.length;

    // Grid lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 0.5;

    const priceSteps = 5;
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'left';

    for (let i = 0; i <= priceSteps; i++) {
      const p = minPrice + (priceRange * (i / priceSteps));
      const y = padding.top + priceChartHeight - ((p - minPrice) / (maxPrice - minPrice)) * priceChartHeight;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      ctx.fillText(`$${p.toLocaleString(undefined, { maximumFractionDigits: p > 100 ? 0 : 2 })}`, padding.left + chartWidth + 6, y + 3);
    }

    // Render Candles and Volume
    const ema20Points: { x: number; y: number }[] = [];
    let ema20 = candles[0]?.close || 0;
    const k20 = 2 / 21;

    candles.forEach((c, i) => {
      const x = padding.left + (i * stepX) + (stepX / 2);
      const isUp = c.close >= c.open;
      const color = isUp ? '#10B981' : '#EF4444'; // emerald green / red

      // Volume bar
      const volHeight = (c.volume / (maxVolume || 1)) * volumeChartHeight;
      const volY = volumeChartTop + volumeChartHeight - volHeight;
      ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(x - candleWidth / 2, volY, candleWidth, volHeight);

      // Price High/Low Wick
      const yHigh = padding.top + priceChartHeight - ((c.high - minPrice) / (maxPrice - minPrice)) * priceChartHeight;
      const yLow = padding.top + priceChartHeight - ((c.low - minPrice) / (maxPrice - minPrice)) * priceChartHeight;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Price Body
      const yOpen = padding.top + priceChartHeight - ((c.open - minPrice) / (maxPrice - minPrice)) * priceChartHeight;
      const yClose = padding.top + priceChartHeight - ((c.close - minPrice) / (maxPrice - minPrice)) * priceChartHeight;
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Compute EMA 20
      ema20 = c.close * k20 + ema20 * (1 - k20);
      const emaY = padding.top + priceChartHeight - ((ema20 - minPrice) / (maxPrice - minPrice)) * priceChartHeight;
      ema20Points.push({ x, y: emaY });
    });

    // Draw EMA 20 line
    if (showEma && ema20Points.length > 1) {
      ctx.strokeStyle = '#38BDF8'; // Sky blue EMA line
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ema20Points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    }

    // Crosshair rendering
    if (mousePos) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, padding.top);
      ctx.lineTo(mousePos.x, height - padding.bottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(padding.left, mousePos.y);
      ctx.lineTo(padding.left + chartWidth, mousePos.y);
      ctx.stroke();

      ctx.setLineDash([]);
    }
  }, [candles, height, mousePos, showEma]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    const paddingLeft = 10;
    const chartWidth = canvas.clientWidth - paddingLeft - 65;
    const stepX = chartWidth / candles.length;
    const idx = Math.floor((x - paddingLeft) / stepX);

    if (idx >= 0 && idx < candles.length) {
      setHoveredCandle(candles[idx]);
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
  };

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div ref={containerRef} className="relative w-full bg-[#0B101B] rounded-lg border border-slate-800/80 overflow-hidden">
      {/* Candle Header Data Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white tracking-wide">{symbol}/USDT</span>
          <span className="text-[11px] text-teal-400 font-mono bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-800/50">
            {interval}
          </span>
          {showEma && (
            <span className="text-[11px] text-sky-400 font-mono flex items-center gap-1">
              <span className="w-2 h-0.5 bg-sky-400 inline-block"></span> EMA(20)
            </span>
          )}
        </div>

        {activeCandle && (
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-300">
            <span>O: <strong className="text-white">${activeCandle.open.toLocaleString()}</strong></span>
            <span>H: <strong className="text-emerald-400">${activeCandle.high.toLocaleString()}</strong></span>
            <span>L: <strong className="text-red-400">${activeCandle.low.toLocaleString()}</strong></span>
            <span>C: <strong className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-red-400'}>
              ${activeCandle.close.toLocaleString()}
            </strong></span>
            <span className="text-slate-400">Vol: <strong>{Math.round(activeCandle.volume).toLocaleString()}</strong></span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full cursor-crosshair block"
      />
    </div>
  );
};
