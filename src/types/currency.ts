/**
 * Currency Management Types
 */

export type SupportedCurrency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'JPY' | 'AUD' | 'CAD';

export interface CurrencyInfo {
  code: SupportedCurrency;
  name: string;
  symbol: string;
}

export interface ExchangeRates {
  [key: string]: number; // Rate to EUR (e.g., USD: 0.85 means 1 USD = 0.85 EUR)
}

export interface CurrencySettings {
  defaultCurrency: SupportedCurrency;
  fallbackRates: ExchangeRates;
  useApiRates: boolean;
  lastApiUpdate: string | null;
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: SupportedCurrency;
  convertedAmount: number;
  targetCurrency: SupportedCurrency;
  rate: number;
  isUsingFallback: boolean;
}

// Default fallback rates to EUR (as specified in requirements)
export const DEFAULT_FALLBACK_RATES: ExchangeRates = {
  EUR: 1,
  USD: 0.85,   // 1 USD = 0.85 EUR
  GBP: 1.15,   // 1 GBP = 1.15 EUR
  CHF: 1.08,   // 1 CHF = 1.08 EUR
  JPY: 0.0054, // 1 JPY = 0.0054 EUR
  AUD: 0.57,   // 1 AUD = 0.57 EUR
  CAD: 0.62,   // 1 CAD = 0.62 EUR
};

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

export const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  defaultCurrency: 'EUR',
  fallbackRates: DEFAULT_FALLBACK_RATES,
  useApiRates: true,
  lastApiUpdate: null,
};
