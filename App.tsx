
import React, { useState, useEffect, useCallback } from 'react';
import CurrencyConverter from './components/CurrencyConverter.tsx';
import { fetchCurrentRates } from './services/geminiService.ts';
import { ExchangeRates, GroundingSource } from './types.ts';

const App: React.FC = () => {
  const [data, setData] = useState<{
    rates: ExchangeRates;
    summary: string;
    sources: GroundingSource[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchCurrentRates();
      setData(result);
    } catch (err: any) {
      console.error("App Error:", err);
      setError("Unable to connect to live market data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const cleanSummary = (summary: string | undefined) => {
    if (!summary) return "No market summary available.";
    return summary.replace(/```json[\s\S]*?```/g, '').replace(/```[\s\S]*?```/g, '').trim();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            AI-Grounded Market Rates
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            One-Amount Converter
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Real-time conversion for USD, EUR, and JPY using verified live market data.
          </p>
        </header>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-sm font-medium">{error}</span>
            <button onClick={loadRates} className="text-sm font-bold underline">Retry</button>
          </div>
        )}

        {/* Loading / Content */}
        {isLoading && !data ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Fetching latest market rates...</p>
          </div>
        ) : data ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CurrencyConverter 
              rates={data.rates} 
              onRefresh={loadRates} 
              isLoading={isLoading} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Market Summary
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm italic">
                  "{cleanSummary(data.summary)}"
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Data Sources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.sources.length > 0 ? data.sources.map((s, idx) => (
                    <a 
                      key={idx} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 px-3 py-2 rounded-lg border border-slate-200 transition-colors inline-flex items-center"
                    >
                      {s.title}
                      <svg className="w-3 h-3 ml-1.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )) : (
                    <span className="text-xs text-slate-400">Validated via Gemini Search Grounding</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <footer className="text-center pt-8 border-t border-slate-200 text-slate-400 text-xs">
          <p>© {new Date().getFullYear()} Global FX Hub. Rates verified via Gemini-3 Search.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
