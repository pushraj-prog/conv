
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CurrencyCode, ExchangeRates } from '../types.ts';

function ArrowPathIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function ArrowsRightLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function PencilSquareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ExclamationCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

interface Props {
  rates: ExchangeRates;
  onRefresh: () => void;
  isLoading: boolean;
}

const CurrencyConverter: React.FC<Props> = ({ rates, onRefresh, isLoading }) => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('INR');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [manualRate, setManualRate] = useState<string>('');
  const [overriddenRate, setOverriddenRate] = useState<{from: string, to: string, rate: number} | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const editInputRef = useRef<HTMLInputElement>(null);

  const availableCurrencies = useMemo(() => {
    // Explicitly include USD at the start to ensure it's always selectable
    const currencies = new Set<CurrencyCode>(['USD', 'EUR', 'JPY', 'INR']);
    if (rates) {
      Object.keys(rates).forEach(key => {
        if (key.includes('_')) {
          const parts = key.split('_') as CurrencyCode[];
          parts.forEach(p => {
            if (['USD', 'EUR', 'JPY', 'INR'].includes(p)) currencies.add(p);
          });
        }
      });
    }
    return Array.from(currencies);
  }, [rates]);

  const convert = (val: number, from: CurrencyCode, to: CurrencyCode): number => {
    if (from === to) return val;
    if (overriddenRate && overriddenRate.from === from && overriddenRate.to === to) {
      return val * overriddenRate.rate;
    }

    let usdAmount = val;
    if (from === 'EUR') usdAmount = val / (rates.USD_EUR || 0.92);
    if (from === 'JPY') usdAmount = val / (rates.USD_JPY || 150.0);
    if (from === 'INR') usdAmount = val / (rates.USD_INR || 83.0);

    if (to === 'USD') return usdAmount;
    if (to === 'EUR') return usdAmount * (rates.USD_EUR || 0.92);
    if (to === 'JPY') return usdAmount * (rates.USD_JPY || 150.0);
    if (to === 'INR') return usdAmount * (rates.USD_INR || 83.0);
    
    return val;
  };

  const result = useMemo(() => {
    const num = parseFloat(amount);
    return isNaN(num) ? 0 : convert(num, fromCurrency, toCurrency);
  }, [amount, fromCurrency, toCurrency, rates, overriddenRate]);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleFromCurrencyChange = (newFrom: CurrencyCode) => {
    if (newFrom === toCurrency) setToCurrency(fromCurrency);
    setFromCurrency(newFrom);
  };

  const handleToCurrencyChange = (newTo: CurrencyCode) => {
    if (newTo === fromCurrency) setFromCurrency(toCurrency);
    setToCurrency(newTo);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 w-full max-w-2xl mx-auto border border-slate-100 relative overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Currency Converter</h2>
        <div className="hidden sm:block text-xs font-medium text-slate-400">
          Last updated: {rates?.lastUpdated ? new Date(rates.lastUpdated).toLocaleTimeString() : 'Live'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
        <div className="md:col-span-3 space-y-2 relative">
          <label className="block text-sm font-medium text-gray-500">Amount</label>
          <div className="relative group flex items-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-28 py-4 text-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="0.00"
            />
            <div className="absolute right-2 z-20">
              <select 
                value={fromCurrency}
                onChange={(e) => handleFromCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-bold text-gray-700 cursor-pointer hover:bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableCurrencies.map(curr => (
                  <option key={curr} value={curr} className="text-slate-900 font-medium">{curr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 flex justify-center pb-2">
          <button 
            onClick={handleSwap}
            className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all border border-blue-100 shadow-sm active:scale-90"
          >
            <ArrowsRightLeftIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="md:col-span-3 space-y-2 relative">
          <label className="block text-sm font-medium text-gray-500">Converted To</label>
          <div className="relative group flex items-center">
            <div className={`w-full ${overriddenRate ? 'bg-indigo-600' : 'bg-blue-600'} border border-blue-700 text-white rounded-xl pl-4 pr-28 py-4 text-xl font-bold min-h-[66px] flex items-center shadow-lg`}>
              {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="absolute right-2 z-20">
              <select 
                value={toCurrency}
                onChange={(e) => handleToCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-bold text-gray-700 cursor-pointer hover:bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableCurrencies.map(curr => (
                  <option key={curr} value={curr} className="text-slate-900 font-medium">{curr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all active:scale-[0.98] disabled:opacity-70 shadow-md"
        >
          <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Updating Market Data...' : 'Refresh Market Rates'}</span>
        </button>
      </div>
    </div>
  );
};

export default CurrencyConverter;
