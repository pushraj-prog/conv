
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
      setError(err?.message || "An unexpected error occurred while fetching live rates.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const cleanSummary = (summary: string | undefined) => {
    if (!summary) return "No market summary available at this time.";
    return summary.replace(/```json[\s\S]*?```/g, '').replace(/```[\s\S]*?```/g, '').trim();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold tracking-wide uppercase shadow-sm">
            Powered by Gemini AI
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Global FX Converter
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Real-time multi-currency conversion for USD, EUR, JPY, and INR with accurate market data fetched through AI search grounding.
          </p>
        </header>

        {/* Error State */}
        {error && (
          <div className="bg-white border border-red-200 p-6 rounded-3xl flex flex-col items-center space-y-4 shadow-sm animate-in fade-in duration-300">
            <div className="bg-red-50 p-3 rounded-full">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Connection Failed</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
            </div>
            <button 
              onClick={loadRates} 
              className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-md"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !data && (
          <div className="space-y-8 animate-pulse">
            <div className="bg-gray-200 h-80 rounded-3xl w-full shadow-inner"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-48 rounded-2xl shadow-inner"></div>
              <div className="bg-gray-200 h-48 rounded-2xl shadow-inner"></div>
            </div>
          </div>
        )}

        {/* Content Section */}
        {data && (
          <div className={`space-y-8 transition-opacity duration-700 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <CurrencyConverter 
              rates={data.rates} 
              onRefresh={loadRates} 
              isLoading={isLoading} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <span className="bg-blue-600 w-1.5 h-6 rounded-full mr-3"></span>
                  Market Insights
                </h3>
                <div className="prose prose-sm text-slate-600">
                  <p className="whitespace-pre-wrap leading-relaxed italic">"{cleanSummary(data.summary)}"</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <span className="bg-blue-600 w-1.5 h-6 rounded-full mr-3"></span>
                  Verified Sources
                </h3>
                <ul className="space-y-3">
                  {data.sources.length > 0 ? data.sources.map((source, idx) => (
                    <li key={idx}>
                      <a 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all group border border-transparent hover:border-blue-100"
                      >
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                          <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold truncate">{source.title}</p>
                          <p className="text-[10px] text-slate-400 truncate tracking-tight">{source.uri}</p>
                        </div>
                      </a>
                    </li>
                  )) : (
                    <li className="text-slate-400 text-sm italic py-4 text-center">Data validated via Search Grounding.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center pt-8 border-t border-slate-200 text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Global FX Hub. Market verification by Gemini 3.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
