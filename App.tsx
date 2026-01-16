
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
  const [needsKey, setNeedsKey] = useState(false);

  // Check if API key is available on mount
  useEffect(() => {
    const checkApiKey = async () => {
      const apiKey = (window as any).process?.env?.API_KEY;
      if (!apiKey) {
        setNeedsKey(true);
      } else {
        loadRates();
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // Proceed immediately as per instructions
      setNeedsKey(false);
      loadRates();
    } else {
      setError("API Key selector is unavailable in this environment.");
    }
  };

  const loadRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCurrentRates();
      setData(result);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("Requested entity was not found")) {
        // Reset key state if the selected key is invalid or from an unpaid project
        setNeedsKey(true);
        setError("The selected API key was not found or is invalid. Please select a key from a paid GCP project.");
      } else {
        setError(msg || "Failed to fetch current exchange rates. Please check your connection.");
      }
      console.error("App Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cleanSummary = (summary: string | undefined) => {
    if (!summary) return "No market summary available at this time.";
    return summary.replace(/```json[\s\S]*?```/g, '').replace(/```[\s\S]*?```/g, '').trim();
  };

  if (needsKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 text-center space-y-6">
          <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">API Key Required</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              To fetch live currency rates and market insights via Gemini Search Grounding, you need to select an API key from a paid GCP project.
            </p>
          </div>
          <button 
            onClick={handleOpenKeySelector}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Connect Gemini API</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Need help? View the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">billing documentation</a>.
            </p>
          </div>
          {error && <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
        </div>
      </div>
    );
  }

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
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={loadRates} className="text-red-700 font-bold underline ml-auto">Retry</button>
          </div>
        )}

        {/* Skeleton Loader */}
        {isLoading && !data && (
          <div className="space-y-8 animate-pulse">
            <div className="bg-gray-200 h-80 rounded-3xl w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-48 rounded-2xl"></div>
              <div className="bg-gray-200 h-48 rounded-2xl"></div>
            </div>
          </div>
        )}

        {/* Main Section */}
        {data && (
          <div className={`space-y-8 transition-opacity duration-700 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <CurrencyConverter 
              rates={data.rates} 
              onRefresh={loadRates} 
              isLoading={isLoading} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Market Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <span className="bg-blue-600 w-1.5 h-6 rounded-full mr-3"></span>
                  Market Insights
                </h3>
                <div className="prose prose-sm text-slate-600">
                  <p className="whitespace-pre-wrap">{cleanSummary(data.summary)}</p>
                </div>
              </div>

              {/* Verified Sources */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <span className="bg-blue-600 w-1.5 h-6 rounded-full mr-3"></span>
                  Grounding Sources
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
                    <li className="text-slate-400 text-sm italic">No specific sources cited for this refresh.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-slate-200 text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Global FX Hub. Rates provided by Google Search Grounding.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
