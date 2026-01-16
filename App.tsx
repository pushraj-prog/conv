
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
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  const loadRates = useCallback(async () => {
    // Check if API key exists in process.env
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsApiKeyMissing(false);
    
    try {
      const result = await fetchCurrentRates();
      setData(result);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("API Key is missing") || msg.includes("entity was not found")) {
        setIsApiKeyMissing(true);
      } else {
        setError(msg || "Failed to fetch live market data. Please check your connection.");
      }
      console.error("App Error:", err);
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

  const handleOpenKeySelector = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // Proceed immediately as per instructions
      setIsApiKeyMissing(false);
      loadRates();
    }
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

        {/* API Key Missing / Vercel Help State */}
        {isApiKeyMissing && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">API Key Required for Live Data</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                To clear this error in Vercel, go to your <strong>Project Settings > Environment Variables</strong> and add <code>API_KEY</code> with your Gemini API key.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={handleOpenKeySelector}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Connect via AI Studio</span>
              </button>
              <button 
                onClick={loadRates}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl transition-all active:scale-95"
              >
                Check Again
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Need a key? Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-medium">Google AI Studio</a>.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isApiKeyMissing && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
            <button onClick={loadRates} className="text-red-700 font-bold text-xs underline">Retry</button>
          </div>
        )}

        {/* Loading / Content Section */}
        {isLoading && !data && (
          <div className="space-y-8 animate-pulse">
            <div className="bg-gray-200 h-80 rounded-3xl w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-48 rounded-2xl"></div>
              <div className="bg-gray-200 h-48 rounded-2xl"></div>
            </div>
          </div>
        )}

        {data && (
          <div className={`space-y-8 transition-opacity duration-700 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <CurrencyConverter 
              rates={data.rates} 
              onRefresh={loadRates} 
              isLoading={isLoading} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <span className="bg-blue-600 w-1.5 h-6 rounded-full mr-3"></span>
                  Market Insights
                </h3>
                <div className="prose prose-sm text-slate-600">
                  <p className="whitespace-pre-wrap leading-relaxed">{cleanSummary(data.summary)}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
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
                        className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                      >
                        <div className="bg-white p-2 rounded-lg border border-slate-200 group-hover:border-blue-300">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-slate-700 truncate">{source.title}</p>
                          <p className="text-xs text-slate-400 truncate">{source.uri}</p>
                        </div>
                      </a>
                    </li>
                  )) : (
                    <li className="text-slate-400 text-sm italic py-4 text-center">Market data grounded via search.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center pt-8 border-t border-slate-200 text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Global FX Hub. Rates verified via Gemini AI.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
