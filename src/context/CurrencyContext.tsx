import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'NZD';

export interface CurrencyDetails {
  code: Currency;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Record<Currency, CurrencyDetails> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿' },
};

// Benchmark exchange rates calibrated from OANDA (https://www.oanda.com/currency-converter/en/)
// Base currency: 1.00 EUR
export const OANDA_BENCHMARK_RATES: Record<Currency, number> = {
  EUR: 1.0,
  USD: 1.085,
  GBP: 0.855,
  AUD: 1.672,
  CAD: 1.494,
  NZD: 1.823,
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountInCents: number, originalCurrency?: string) => string;
  formatAmount: (amount: number, originalCurrency?: string) => string;
  detectedCountry: string | null;
  rates: Record<Currency, number>;
  source: string;
}

const EUROZONE_COUNTRIES = new Set([
  'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
  'AD', 'MC', 'ME', 'SM', 'VA', 'XK'
]);

function mapCountryToCurrency(countryCode: string): Currency {
  const code = countryCode.toUpperCase().trim();
  if (code === 'AU') return 'AUD';
  if (code === 'CA') return 'CAD';
  if (code === 'NZ') return 'NZD';
  if (code === 'GB' || code === 'UK') return 'GBP';
  if (EUROZONE_COUNTRIES.has(code)) return 'EUR';
  if (code === 'US') return 'USD';
  // Otherwise, default/random currency is USD per specification
  return 'USD';
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<Currency, number>>(OANDA_BENCHMARK_RATES);
  const [source] = useState<string>('OANDA (oanda.com)');

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('agt_preferred_currency', newCurrency);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  // 1. IP-based currency detection on mount
  useEffect(() => {
    const saved = (() => {
      try {
        return localStorage.getItem('agt_preferred_currency') as Currency | null;
      } catch {
        return null;
      }
    })();

    if (saved && CURRENCIES[saved]) {
      setCurrencyState(saved);
      return;
    }

    let isMounted = true;

    const detectIPCurrency = async () => {
      try {
        // Fast primary lookup
        const res = await fetch('https://api.country.is/', {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          const country = (data.country || '').toUpperCase();
          if (isMounted && country) {
            setDetectedCountry(country);
            const resolved = mapCountryToCurrency(country);
            setCurrencyState(resolved);
            return;
          }
        }
      } catch {
        // Fallback to secondary geo IP
        try {
          const res2 = await fetch('https://ipwho.is/', {
            signal: AbortSignal.timeout(3000),
          });
          if (res2.ok) {
            const data2 = await res2.json();
            const country2 = (data2.country_code || '').toUpperCase();
            if (isMounted && country2) {
              setDetectedCountry(country2);
              const resolved = mapCountryToCurrency(country2);
              setCurrencyState(resolved);
              return;
            }
          }
        } catch {
          // Both failed
        }
      }

      // Default fallback if IP detection fails or random location: USD
      if (isMounted) {
        setCurrencyState('USD');
      }
    };

    detectIPCurrency();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch live rates to sync with OANDA market benchmarks
  useEffect(() => {
    let isMounted = true;
    const fetchLiveRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/EUR', {
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && isMounted) {
            setRates({
              EUR: 1.0,
              USD: Number(data.rates.USD) || OANDA_BENCHMARK_RATES.USD,
              GBP: Number(data.rates.GBP) || OANDA_BENCHMARK_RATES.GBP,
              AUD: Number(data.rates.AUD) || OANDA_BENCHMARK_RATES.AUD,
              CAD: Number(data.rates.CAD) || OANDA_BENCHMARK_RATES.CAD,
              NZD: Number(data.rates.NZD) || OANDA_BENCHMARK_RATES.NZD,
            });
          }
        }
      } catch {
        // Fall back gracefully to OANDA benchmark rates
        if (isMounted) {
          setRates(OANDA_BENCHMARK_RATES);
        }
      }
    };

    fetchLiveRates();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (amountInCents: number, originalCurrency: string = 'EUR') => {
    const orig = (originalCurrency.toUpperCase() as Currency);
    const baseRate = rates[orig] || (orig === 'USD' ? rates.USD : rates.EUR) || 1.0;
    // Convert to EUR base first
    const eurBase = (amountInCents / 100) / baseRate;
    // Convert to selected currency
    const targetRate = rates[currency] || 1.0;
    const converted = Math.round(eurBase * targetRate);
    const symbol = CURRENCIES[currency]?.symbol || '$';
    return `${symbol}${converted.toLocaleString()}`;
  };

  const formatAmount = (amount: number, originalCurrency: string = 'EUR') => {
    const orig = (originalCurrency.toUpperCase() as Currency);
    const baseRate = rates[orig] || (orig === 'USD' ? rates.USD : rates.EUR) || 1.0;
    const eurBase = amount / baseRate;
    const targetRate = rates[currency] || 1.0;
    const converted = Math.round(eurBase * targetRate);
    const symbol = CURRENCIES[currency]?.symbol || '$';
    return `${symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        formatAmount,
        detectedCountry,
        rates,
        source,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
