import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { NewsArticle } from '../types';
import { Newspaper, Search, Filter, ExternalLink, Sparkles } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [assetFilter, setAssetFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    try {
      const filters: any = {};
      if (categoryFilter !== 'ALL') filters.category = categoryFilter;
      if (assetFilter !== 'ALL') filters.asset = assetFilter;
      if (search) filters.query = search;

      const res = await api.getNews(filters);
      setArticles(res.articles || []);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [categoryFilter, assetFilter, search]);

  const categories = ['ALL', 'ETF', 'Regulatory', 'Macro', 'Technical', 'On-Chain'];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-teal-400" />
            Curated Market Intelligence & Macro News
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-source aggregator with AI sentiment scoring, market impact attribution, and entity extraction
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search headline or entities..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#0F172A] border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 mr-1 text-[11px] font-semibold uppercase">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded transition-colors text-xs font-medium ${
                categoryFilter === cat
                  ? 'bg-teal-500/20 text-teal-400 font-bold border border-teal-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Asset Mention:</span>
          <select
            value={assetFilter}
            onChange={e => setAssetFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
          >
            <option value="ALL">All Assets</option>
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="SOL">Solana (SOL)</option>
          </select>
        </div>
      </div>

      {/* News Feed List */}
      <div className="space-y-4">
        {articles.map(article => (
          <div
            key={article.id}
            className="p-5 rounded-lg bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
          >
            {/* Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="font-semibold text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                  {article.category}
                </span>
                <span>·</span>
                <span className="font-medium text-slate-300">{article.publisher}</span>
                <span>·</span>
                <span className="font-mono text-[11px]">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400">AI Sentiment:</span>
                <strong className={article.sentimentScore >= 50 ? 'text-emerald-400' : 'text-amber-400'}>
                  +{article.sentimentScore} / 100
                </strong>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  article.marketImpact.includes('BULLISH') ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40' :
                  article.marketImpact.includes('BEARISH') ? 'bg-red-950/70 text-red-400 border border-red-800/40' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {article.marketImpact.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Title & Link */}
            <h2 className="text-base font-bold text-white hover:text-teal-400 transition-colors">
              <a href={article.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 group">
                <span>{article.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            </h2>

            {/* Summary */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {article.summary}
            </p>

            {/* AI Quantitative Impact Analysis */}
            <div className="p-3 rounded bg-slate-900/70 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-teal-400 text-[11px]">
                <Sparkles className="w-3 h-3" />
                <span>AI Quantitative Interpretation:</span>
              </div>
              <p className="text-slate-300 italic">
                "{article.aiAnalysis}"
              </p>
            </div>

            {/* Extracted Entities */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
              <span className="text-slate-400 font-semibold">Entities:</span>
              {article.extractedEntities.map(ent => (
                <span key={ent} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {ent}
                </span>
              ))}
              <span className="ml-auto text-slate-400 font-mono">
                Related: {article.relatedAssets.join(', ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
