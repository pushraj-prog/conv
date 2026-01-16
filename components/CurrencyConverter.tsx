
import React, { useState, useMemo } from 'react';
import { CurrencyCode, ExchangeRates } from '../types.ts';

interface Props {
  rates: ExchangeRates;
  onRefresh: () => void;
  isLoading: boolean;
}

const CurrencyConverter: React.FC<Props> = ({ rates, onRefresh, isLoading }) => {
  const [amount, setAmount] = useState<string>('100');
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>('USD');

  const currencies: { code: CurrencyCode, name: string, symbol: string }[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  ];

  const conversions = useMemo(() => {
    const num = parseFloat(amount) || 0;
    
    // Helper to get rate from USD to target
    const getRateFromUSD = (to: CurrencyCode): number => {
      if (to === 'USD') return 1;
      if (to === 'EUR') return rates.USD_EUR || 0.94;
      if (to === 'JPY') return rates.USD_JPY || 151.2;
      if (to === 'INR') return rates.USD_INR || 83.5;
      return 1;
    };

    // First convert input to USD (if it isn't already)
    const baseToUSD = 1 / getRateFromUSD(baseCurrency);
    const amountInUSD = num * baseToUSD;

    return currencies.map(c => ({
      ...c,
      value: amountInUSD * getRateFromUSD(c.code)
    }));
  }, [amount, baseCurrency, rates]);

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 w-full border border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Side: Input */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Amount to Convert</label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-3xl font-bold focus:border-blue-500 focus:bg-white focus:outline-none transition-all shadow-sm"
                placeholder="0.00"
              />
              <div className="absolute right-4">
                <select 
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value as CurrencyCode)}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-5 px-8 rounded-2xl flex items-center justify-center space-x-3 transition-all active:scale-[0.98] shadow-xl group"
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isLoading ? 'Syncing...' : 'Sync Market Rates'}</span>
          </button>
          
          <p className="text-xs text-center text-slate-400">
            Rates are updated in real-time using search grounding for maximum accuracy.
          </p>
        </div>

        {/* Right Side: Results */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-4">Conversion Results</label>
          <div className="space-y-3">
            {conversions.map(c => (
              <div 
                key={c.code} 
                className={`p-5 rounded-2xl flex items-center justify-between transition-all ${c.code === baseCurrency ? 'bg-blue-600 text-white shadow-lg scale-[1.02] border-blue-500' : 'bg-slate-50 text-slate-900 border border-slate-100 hover:border-slate-200'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${c.code === baseCurrency ? 'bg-white/20' : 'bg-white border border-slate-200'}`}>
                    {c.symbol}
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-tight ${c.code === baseCurrency ? 'text-blue-100' : 'text-slate-400'}`}>{c.name}</p>
                    <p className="text-lg font-black">{c.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black">
                    {c.value.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CurrencyConverter;
