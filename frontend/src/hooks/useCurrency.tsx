import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD' | 'AED' | 'JPY';

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: ExchangeRates;
  loading: boolean;
  lastUpdated: Date | null;
  refreshRates: () => Promise<void>;
  convertFromINR: (amountINR: number) => number;
  convertToINR: (amount: number) => number;
  formatPrice: (amountINR: number, showSymbol?: boolean) => string;
  getCurrencyInfo: () => CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Fallback rates (INR base) - these are approximate
const FALLBACK_RATES: ExchangeRates = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AUD: 0.018,
  CAD: 0.017,
  SGD: 0.016,
  AED: 0.044,
  JPY: 1.78,
};

const STORAGE_KEY = 'user_preferred_currency';
const RATES_CACHE_KEY = 'currency_exchange_rates';
const RATES_TIMESTAMP_KEY = 'currency_rates_timestamp';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as Currency) || 'USD';
  });
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchExchangeRates = useCallback(async () => {
    // Check cache first
    const cachedRates = localStorage.getItem(RATES_CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(RATES_TIMESTAMP_KEY);
    
    if (cachedRates && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp);
      if (Date.now() - timestamp < CACHE_DURATION) {
        setExchangeRates(JSON.parse(cachedRates));
        setLastUpdated(new Date(timestamp));
        return;
      }
    }

    setLoading(true);
    try {
      // Using exchangerate-api.com (free tier available)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      if (response.ok) {
        const data = await response.json();
        const rates: ExchangeRates = {
          INR: 1,
          USD: data.rates.USD || FALLBACK_RATES.USD,
          EUR: data.rates.EUR || FALLBACK_RATES.EUR,
          GBP: data.rates.GBP || FALLBACK_RATES.GBP,
          AUD: data.rates.AUD || FALLBACK_RATES.AUD,
          CAD: data.rates.CAD || FALLBACK_RATES.CAD,
          SGD: data.rates.SGD || FALLBACK_RATES.SGD,
          AED: data.rates.AED || FALLBACK_RATES.AED,
          JPY: data.rates.JPY || FALLBACK_RATES.JPY,
        };
        setExchangeRates(rates);
        setLastUpdated(new Date());
        
        // Cache the rates
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(rates));
        localStorage.setItem(RATES_TIMESTAMP_KEY, Date.now().toString());
      }
    } catch (error) {
      // Silently ignore - non-critical
      setExchangeRates(FALLBACK_RATES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
  }, []);

  const convertFromINR = useCallback((amountINR: number): number => {
    const rate = exchangeRates[currency] || 1;
    return amountINR * rate;
  }, [currency, exchangeRates]);

  const convertToINR = useCallback((amount: number): number => {
    const rate = exchangeRates[currency] || 1;
    return amount / rate;
  }, [currency, exchangeRates]);

  const getCurrencyInfo = useCallback((): CurrencyInfo => {
    return CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  }, [currency]);

  const formatPrice = useCallback((amountINR: number, showSymbol = true): string => {
    const converted = convertFromINR(amountINR);
    const info = getCurrencyInfo();
    
    // Format based on currency
    const formatted = currency === 'JPY' 
      ? Math.round(converted).toLocaleString()
      : converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return showSymbol ? `${info.symbol}${formatted}` : formatted;
  }, [currency, convertFromINR, getCurrencyInfo]);

  const value = useMemo(() => ({
    currency,
    setCurrency,
    exchangeRates,
    loading,
    lastUpdated,
    refreshRates: fetchExchangeRates,
    convertFromINR,
    convertToINR,
    formatPrice,
    getCurrencyInfo,
  }), [currency, setCurrency, exchangeRates, loading, lastUpdated, fetchExchangeRates, convertFromINR, convertToINR, formatPrice, getCurrencyInfo]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
