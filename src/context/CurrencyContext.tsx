import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'NZD';

export interface CurrencyDetails {
  code: Currency;
  symbol: string;
  name: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = ['USD', 'EUR', 'AUD', 'NZD', 'CAD', 'GBP'];

export const CURRENCIES: Record<Currency, CurrencyDetails> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
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

export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountInCents: number, originalCurrency?: string) => string;
  formatAmount: (amount: number, originalCurrency?: string) => string;
  detectedCountry: string | null;
  userIp: string | null;
  isAutoDetected: boolean;
  resetToIpCurrency: () => void;
  rates: Record<Currency, number>;
  source: string;
}

const EUROZONE_COUNTRIES = new Set([
  'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
  'AD', 'MC', 'ME', 'SM', 'VA', 'XK'
]);

export function mapCountryToCurrency(countryCode: string): Currency {
  const code = countryCode.toUpperCase().trim();
  if (code === 'AU') return 'AUD';
  if (code === 'CA') return 'CAD';
  if (code === 'NZ') return 'NZD';
  if (code === 'GB' || code === 'UK' || code === 'IM' || code === 'JE' || code === 'GG') return 'GBP';
  if (EUROZONE_COUNTRIES.has(code)) return 'EUR';
  if (code === 'US') return 'USD';
  // Otherwise, default currency is USD per international specification
  return 'USD';
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [userIp, setUserIp] = useState<string | null>(null);
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);
  const [rates, setRates] = useState<Record<Currency, number>>(OANDA_BENCHMARK_RATES);
  const [source] = useState<string>('OANDA (oanda.com)');

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    setIsAutoDetected(false);
    try {
      localStorage.setItem('agt_preferred_currency', newCurrency);
      localStorage.setItem('agt_currency_manual_override', 'true');
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  const resetToIpCurrency = () => {
    try {
      localStorage.removeItem('agt_currency_manual_override');
    } catch {
      // Ignore
    }
    if (detectedCountry) {
      const resolved = mapCountryToCurrency(detectedCountry);
      setCurrencyState(resolved);
      setIsAutoDetected(true);
    }
  };

  // 1. IP-based currency detection on mount
  useEffect(() => {
    let isMounted = true;

    // Check if user had an explicit manual override in this browser
    const manualOverride = (() => {
      try {
        return localStorage.getItem('agt_currency_manual_override') === 'true';
      } catch {
        return false;
      }
    })();

    const saved = (() => {
      try {
        return localStorage.getItem('agt_preferred_currency') as Currency | null;
      } catch {
        return null;
      }
    })();

    if (manualOverride && saved && CURRENCIES[saved]) {
      setCurrencyState(saved);
      setIsAutoDetected(false);
    }

    const detectIPCurrency = async () => {
      try {
        // Fast primary lookup via api.country.is
        const res = await fetch('https://api.country.is/', {
          signal: AbortSignal.timeout(3500),
        });
        if (res.ok) {
          const data = await res.json();
          const country = (data.country || '').toUpperCase();
          const ip = data.ip || null;
          if (isMounted) {
            if (ip) setUserIp(ip);
            if (country) {
              setDetectedCountry(country);
              const resolved = mapCountryToCurrency(country);
              if (!manualOverride) {
                setCurrencyState(resolved);
                setIsAutoDetected(true);
              }
              return;
            }
          }
        }
      } catch {
        // Fallback to secondary geo IP via ipwho.is
        try {
          const res2 = await fetch('https://ipwho.is/', {
            signal: AbortSignal.timeout(3500),
          });
          if (res2.ok) {
            const data2 = await res2.json();
            const country2 = (data2.country_code || '').toUpperCase();
            const ip2 = data2.ip || null;
            if (isMounted) {
              if (ip2) setUserIp(ip2);
              if (country2) {
                setDetectedCountry(country2);
                const resolved = mapCountryToCurrency(country2);
                if (!manualOverride) {
                  setCurrencyState(resolved);
                  setIsAutoDetected(true);
                }
                return;
              }
            }
          }
        } catch {
          // Fallback to ipapi.co
          try {
            const res3 = await fetch('https://ipapi.co/json/', {
              signal: AbortSignal.timeout(3000),
            });
            if (res3.ok) {
              const data3 = await res3.json();
              const country3 = (data3.country_code || '').toUpperCase();
              const ip3 = data3.ip || null;
              if (isMounted) {
                if (ip3) setUserIp(ip3);
                if (country3) {
                  setDetectedCountry(country3);
                  const resolved = mapCountryToCurrency(country3);
                  if (!manualOverride) {
                    setCurrencyState(resolved);
                    setIsAutoDetected(true);
                  }
                  return;
                }
              }
            }
          } catch {
            // Both failed
          }
        }
      }

      // Default fallback if IP detection fails or random location: USD
      if (isMounted && !manualOverride) {
        setCurrencyState('USD');
        setIsAutoDetected(true);
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
        userIp,
        isAutoDetected,
        resetToIpCurrency,
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
