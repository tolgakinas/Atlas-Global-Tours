import React, { createContext, useContext, useState } from 'react';

export type Currency = 'EUR' | 'USD' | 'GBP' | 'TRY';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountInCents: number, originalCurrency?: string) => string;
  formatAmount: (amount: number, originalCurrency?: string) => string;
}

const RATES: Record<Currency, number> = {
  EUR: 1.0,
  USD: 1.08,
  GBP: 0.85,
  TRY: 42.5,
};

const SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  TRY: '₺',
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('EUR');

  const formatPrice = (amountInCents: number, originalCurrency: string = 'EUR') => {
    const orig = (originalCurrency.toUpperCase() as Currency) || 'EUR';
    // Convert to base EUR first if needed
    const eurBase = amountInCents / 100 / (RATES[orig] || 1);
    const converted = Math.round(eurBase * RATES[currency]);
    return `${SYMBOLS[currency]}${converted.toLocaleString()}`;
  };

  const formatAmount = (amount: number, originalCurrency: string = 'EUR') => {
    const orig = (originalCurrency.toUpperCase() as Currency) || 'EUR';
    const eurBase = amount / (RATES[orig] || 1);
    const converted = Math.round(eurBase * RATES[currency]);
    return `${SYMBOLS[currency]}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatAmount }}>
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
