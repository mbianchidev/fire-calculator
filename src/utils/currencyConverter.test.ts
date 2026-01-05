import { describe, expect, it } from 'vitest';
import {
  convertToEUR,
  convertFromEUR,
  getCurrencySymbol,
  formatCurrencyValue,
  isValidCurrency,
  convertAmount,
  recalculateFallbackRates,
  convertAssetsToNewCurrency,
} from './currencyConverter';
import { DEFAULT_FALLBACK_RATES } from '../types/currency';
import { Asset } from '../types/assetAllocation';

describe('Currency Converter', () => {
  describe('convertToEUR', () => {
    it('should return same amount for EUR', () => {
      expect(convertToEUR(100, 'EUR')).toBe(100);
    });

    it('should convert USD to EUR using default rate', () => {
      // 1 USD = 0.85 EUR, so 100 USD = 85 EUR
      expect(convertToEUR(100, 'USD')).toBe(85);
    });

    it('should convert GBP to EUR using default rate', () => {
      // 1 GBP = 1.15 EUR, so 100 GBP = 115 EUR
      expect(convertToEUR(100, 'GBP')).toBeCloseTo(115, 2);
    });

    it('should convert CHF to EUR using default rate', () => {
      // 1 CHF = 1.08 EUR, so 100 CHF = 108 EUR
      expect(convertToEUR(100, 'CHF')).toBe(108);
    });

    it('should convert JPY to EUR using default rate', () => {
      // 1 JPY = 0.0054 EUR, so 1000 JPY = 5.4 EUR
      expect(convertToEUR(1000, 'JPY')).toBeCloseTo(5.4, 2);
    });

    it('should convert AUD to EUR using default rate', () => {
      // 1 AUD = 0.57 EUR, so 100 AUD = 57 EUR
      expect(convertToEUR(100, 'AUD')).toBeCloseTo(57, 2);
    });

    it('should convert CAD to EUR using default rate', () => {
      // 1 CAD = 0.62 EUR, so 100 CAD = 62 EUR
      expect(convertToEUR(100, 'CAD')).toBe(62);
    });

    it('should use custom rates when provided', () => {
      const customRates = { ...DEFAULT_FALLBACK_RATES, USD: 0.90 };
      expect(convertToEUR(100, 'USD', customRates)).toBe(90);
    });

    it('should handle zero amounts', () => {
      expect(convertToEUR(0, 'USD')).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(convertToEUR(-100, 'USD')).toBe(-85);
    });
  });

  describe('convertFromEUR', () => {
    it('should return same amount for EUR', () => {
      expect(convertFromEUR(100, 'EUR')).toBe(100);
    });

    it('should convert EUR to USD using default rate', () => {
      // Rate is 0.85, so 85 EUR = 100 USD
      expect(convertFromEUR(85, 'USD')).toBeCloseTo(100, 2);
    });

    it('should convert EUR to GBP using default rate', () => {
      // Rate is 1.15, so 115 EUR = 100 GBP
      expect(convertFromEUR(115, 'GBP')).toBeCloseTo(100, 2);
    });

    it('should handle zero amounts', () => {
      expect(convertFromEUR(0, 'USD')).toBe(0);
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return € for EUR', () => {
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('should return $ for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
    });

    it('should return £ for GBP', () => {
      expect(getCurrencySymbol('GBP')).toBe('£');
    });

    it('should return CHF for CHF', () => {
      expect(getCurrencySymbol('CHF')).toBe('CHF');
    });

    it('should return ¥ for JPY', () => {
      expect(getCurrencySymbol('JPY')).toBe('¥');
    });

    it('should return A$ for AUD', () => {
      expect(getCurrencySymbol('AUD')).toBe('A$');
    });

    it('should return C$ for CAD', () => {
      expect(getCurrencySymbol('CAD')).toBe('C$');
    });
  });

  describe('formatCurrencyValue', () => {
    it('should format EUR with euro symbol', () => {
      expect(formatCurrencyValue(1234.56, 'EUR')).toBe('€1,234.56');
    });

    it('should format USD with dollar symbol', () => {
      expect(formatCurrencyValue(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('should format with comma decimal separator when specified', () => {
      expect(formatCurrencyValue(1234.56, 'EUR', ',')).toBe('€1.234,56');
    });

    it('should format with point decimal separator when specified', () => {
      expect(formatCurrencyValue(1234.56, 'EUR', '.')).toBe('€1,234.56');
    });

    it('should handle zero values', () => {
      expect(formatCurrencyValue(0, 'EUR')).toBe('€0.00');
    });

    it('should handle negative values', () => {
      expect(formatCurrencyValue(-1234.56, 'EUR')).toBe('-€1,234.56');
    });

    it('should format large numbers correctly', () => {
      expect(formatCurrencyValue(1000000, 'EUR')).toBe('€1,000,000.00');
    });

    it('should round to 2 decimal places', () => {
      expect(formatCurrencyValue(1234.567, 'EUR')).toBe('€1,234.57');
    });
  });

  describe('isValidCurrency', () => {
    it('should return true for valid currencies', () => {
      expect(isValidCurrency('EUR')).toBe(true);
      expect(isValidCurrency('USD')).toBe(true);
      expect(isValidCurrency('GBP')).toBe(true);
      expect(isValidCurrency('CHF')).toBe(true);
      expect(isValidCurrency('JPY')).toBe(true);
      expect(isValidCurrency('AUD')).toBe(true);
      expect(isValidCurrency('CAD')).toBe(true);
    });

    it('should return false for invalid currencies', () => {
      expect(isValidCurrency('XYZ')).toBe(false);
      expect(isValidCurrency('')).toBe(false);
      expect(isValidCurrency('eur')).toBe(false); // Case sensitive
    });
  });

  describe('convertAmount', () => {
    it('should convert USD to EUR', () => {
      // 100 USD = 100 * 0.85 = 85 EUR
      expect(convertAmount(100, 'USD', 'EUR', DEFAULT_FALLBACK_RATES)).toBeCloseTo(85, 2);
    });

    it('should convert EUR to USD', () => {
      // 85 EUR = 85 / 0.85 = 100 USD
      expect(convertAmount(85, 'EUR', 'USD', DEFAULT_FALLBACK_RATES)).toBeCloseTo(100, 2);
    });

    it('should convert between two non-EUR currencies', () => {
      // USD to GBP: 100 USD -> EUR -> GBP
      // 100 USD = 85 EUR, 85 EUR = 85/1.15 = 73.91 GBP
      expect(convertAmount(100, 'USD', 'GBP', DEFAULT_FALLBACK_RATES)).toBeCloseTo(73.91, 1);
    });

    it('should return same amount for same currency', () => {
      expect(convertAmount(100, 'USD', 'USD', DEFAULT_FALLBACK_RATES)).toBe(100);
    });
  });

  describe('recalculateFallbackRates', () => {
    it('should recalculate rates when default currency changes from EUR to USD', () => {
      const newRates = recalculateFallbackRates(DEFAULT_FALLBACK_RATES, 'EUR', 'USD');
      
      // USD becomes base (1), EUR becomes 1/0.85 = 1.176
      expect(newRates['USD']).toBeCloseTo(1, 2);
      expect(newRates['EUR']).toBeCloseTo(1 / 0.85, 2);
      // GBP: was 1.15 EUR, now in USD terms: 1.15 / 0.85 = 1.353
      expect(newRates['GBP']).toBeCloseTo(1.15 / 0.85, 2);
    });

    it('should recalculate rates when default currency changes from USD to EUR', () => {
      // Starting from USD-based rates
      const usdBasedRates = {
        USD: 1,
        EUR: 1 / 0.85,  // ~1.176
        GBP: 1.15 / 0.85, // ~1.353
        CHF: 1.08 / 0.85,
        JPY: 0.0054 / 0.85,
        AUD: 0.57 / 0.85,
        CAD: 0.62 / 0.85,
      };
      
      const newRates = recalculateFallbackRates(usdBasedRates, 'USD', 'EUR');
      
      // EUR becomes base (1), USD becomes ~0.85
      expect(newRates['EUR']).toBeCloseTo(1, 2);
      expect(newRates['USD']).toBeCloseTo(0.85, 2);
      expect(newRates['GBP']).toBeCloseTo(1.15, 2);
    });

    it('should return same rates when currency does not change', () => {
      const newRates = recalculateFallbackRates(DEFAULT_FALLBACK_RATES, 'EUR', 'EUR');
      expect(newRates).toEqual(DEFAULT_FALLBACK_RATES);
    });
  });

  describe('convertAssetsToNewCurrency', () => {
    const createMockAsset = (overrides: Partial<Asset> = {}): Asset => ({
      id: 'test-1',
      name: 'Test Asset',
      ticker: 'TEST',
      assetClass: 'STOCKS',
      subAssetType: 'ETF',
      currentValue: 1000,
      originalCurrency: 'EUR',
      originalValue: 1000,
      targetMode: 'PERCENTAGE',
      ...overrides,
    });

    it('should convert asset values from EUR to USD', () => {
      const assets: Asset[] = [
        createMockAsset({ currentValue: 1000, originalCurrency: 'EUR', originalValue: 1000 }),
      ];
      
      // EUR to USD: 1000 EUR = 1000 / 0.85 = 1176.47 USD
      const converted = convertAssetsToNewCurrency(assets, 'EUR', 'USD', DEFAULT_FALLBACK_RATES);
      
      expect(converted[0].currentValue).toBeCloseTo(1176.47, 0);
      expect(converted[0].originalCurrency).toBe('EUR');
      expect(converted[0].originalValue).toBe(1000);
    });

    it('should convert asset values from USD to EUR', () => {
      const assets: Asset[] = [
        createMockAsset({ currentValue: 1000, originalCurrency: 'USD', originalValue: 850 }),
      ];
      
      // 1000 USD * 0.85 = 850 EUR
      const converted = convertAssetsToNewCurrency(assets, 'USD', 'EUR', DEFAULT_FALLBACK_RATES);
      
      expect(converted[0].currentValue).toBeCloseTo(850, 0);
    });

    it('should handle conversion between non-EUR currencies', () => {
      const assets: Asset[] = [
        createMockAsset({ currentValue: 1000, originalCurrency: 'USD', originalValue: 850 }),
      ];
      
      // USD to GBP: 1000 USD -> EUR -> GBP
      // 1000 * 0.85 = 850 EUR, 850 / 1.15 = 739.13 GBP
      const converted = convertAssetsToNewCurrency(assets, 'USD', 'GBP', DEFAULT_FALLBACK_RATES);
      
      expect(converted[0].currentValue).toBeCloseTo(739.13, 0);
    });

    it('should return same values when currency does not change', () => {
      const assets: Asset[] = [
        createMockAsset({ currentValue: 1000, originalCurrency: 'EUR', originalValue: 1000 }),
      ];
      
      const converted = convertAssetsToNewCurrency(assets, 'EUR', 'EUR', DEFAULT_FALLBACK_RATES);
      
      expect(converted[0].currentValue).toBe(1000);
    });

    it('should convert multiple assets', () => {
      const assets: Asset[] = [
        createMockAsset({ id: '1', currentValue: 1000, originalCurrency: 'EUR', originalValue: 1000 }),
        createMockAsset({ id: '2', currentValue: 2000, originalCurrency: 'EUR', originalValue: 2000 }),
        createMockAsset({ id: '3', currentValue: 500, originalCurrency: 'EUR', originalValue: 500 }),
      ];
      
      const converted = convertAssetsToNewCurrency(assets, 'EUR', 'USD', DEFAULT_FALLBACK_RATES);
      
      // All values should be converted from EUR to USD (divide by 0.85)
      expect(converted[0].currentValue).toBeCloseTo(1176.47, 0);
      expect(converted[1].currentValue).toBeCloseTo(2352.94, 0);
      expect(converted[2].currentValue).toBeCloseTo(588.24, 0);
    });

    it('should preserve other asset properties', () => {
      const assets: Asset[] = [
        createMockAsset({
          id: 'test-id',
          name: 'My Asset',
          ticker: 'TICK',
          assetClass: 'BONDS',
          subAssetType: 'SINGLE_BOND',
          currentValue: 1000,
          targetMode: 'SET',
          targetValue: 1500,
          targetPercent: 50,
        }),
      ];
      
      const converted = convertAssetsToNewCurrency(assets, 'EUR', 'USD', DEFAULT_FALLBACK_RATES);
      
      expect(converted[0].id).toBe('test-id');
      expect(converted[0].name).toBe('My Asset');
      expect(converted[0].ticker).toBe('TICK');
      expect(converted[0].assetClass).toBe('BONDS');
      expect(converted[0].subAssetType).toBe('SINGLE_BOND');
      expect(converted[0].targetMode).toBe('SET');
      // targetValue should also be converted
      expect(converted[0].targetValue).toBeCloseTo(1764.71, 0);
      expect(converted[0].targetPercent).toBe(50); // Percentage should NOT be converted
    });

    it('should handle empty asset array', () => {
      const converted = convertAssetsToNewCurrency([], 'EUR', 'USD', DEFAULT_FALLBACK_RATES);
      expect(converted).toEqual([]);
    });

    it('should handle assets with undefined originalCurrency (assume it matches fromCurrency)', () => {
      const assets: Asset[] = [
        createMockAsset({ currentValue: 1000, originalCurrency: undefined, originalValue: undefined }),
      ];
      
      const converted = convertAssetsToNewCurrency(assets, 'EUR', 'USD', DEFAULT_FALLBACK_RATES);
      
      // Should convert 1000 EUR to USD
      expect(converted[0].currentValue).toBeCloseTo(1176.47, 0);
    });
  });
});
