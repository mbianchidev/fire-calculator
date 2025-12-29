import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  saveSettings,
  loadSettings,
  clearSettings,
  DEFAULT_SETTINGS,
  type UserSettings,
} from './settings';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// @ts-ignore - override localStorage for tests
globalThis.localStorage = localStorageMock;

describe('Settings utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      const settings: UserSettings = {
        ...DEFAULT_SETTINGS,
        accountName: 'Test Account',
      };
      
      saveSettings(settings);
      
      const saved = localStorage.getItem('fire-calculator-settings');
      expect(saved).not.toBeNull();
      expect(JSON.parse(saved!).accountName).toBe('Test Account');
    });

    it('should save decimal separator preference', () => {
      const settings: UserSettings = {
        ...DEFAULT_SETTINGS,
        decimalSeparator: ',',
      };
      
      saveSettings(settings);
      
      const saved = localStorage.getItem('fire-calculator-settings');
      expect(JSON.parse(saved!).decimalSeparator).toBe(',');
    });

    it('should save currency settings', () => {
      const settings: UserSettings = {
        ...DEFAULT_SETTINGS,
        currencySettings: {
          defaultCurrency: 'EUR',
          fallbackRates: { EUR: 1, USD: 0.90 },
          useApiRates: false,
          lastApiUpdate: null,
        },
      };
      
      saveSettings(settings);
      
      const saved = localStorage.getItem('fire-calculator-settings');
      expect(JSON.parse(saved!).currencySettings.fallbackRates.USD).toBe(0.90);
    });
  });

  describe('loadSettings', () => {
    it('should return DEFAULT_SETTINGS when no settings saved', () => {
      const loaded = loadSettings();
      
      expect(loaded).toEqual(DEFAULT_SETTINGS);
    });

    it('should load saved settings', () => {
      const settings: UserSettings = {
        ...DEFAULT_SETTINGS,
        accountName: 'My Portfolio',
        decimalSeparator: ',',
      };
      
      localStorage.setItem('fire-calculator-settings', JSON.stringify(settings));
      
      const loaded = loadSettings();
      expect(loaded.accountName).toBe('My Portfolio');
      expect(loaded.decimalSeparator).toBe(',');
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('fire-calculator-settings', 'invalid json');
      
      const loaded = loadSettings();
      expect(loaded).toEqual(DEFAULT_SETTINGS);
    });

    it('should merge with defaults to ensure all fields exist', () => {
      // Save partial settings (missing some fields)
      const partialSettings = {
        accountName: 'Partial Account',
      };
      
      localStorage.setItem('fire-calculator-settings', JSON.stringify(partialSettings));
      
      const loaded = loadSettings();
      expect(loaded.accountName).toBe('Partial Account');
      expect(loaded.decimalSeparator).toBe(DEFAULT_SETTINGS.decimalSeparator);
      expect(loaded.currencySettings).toEqual(DEFAULT_SETTINGS.currencySettings);
    });
  });

  describe('clearSettings', () => {
    it('should clear settings from localStorage', () => {
      const settings: UserSettings = {
        ...DEFAULT_SETTINGS,
        accountName: 'Test',
      };
      
      saveSettings(settings);
      expect(localStorage.getItem('fire-calculator-settings')).not.toBeNull();
      
      clearSettings();
      expect(localStorage.getItem('fire-calculator-settings')).toBeNull();
    });
  });

  describe('DEFAULT_SETTINGS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_SETTINGS.accountName).toBe('My Portfolio');
      expect(DEFAULT_SETTINGS.decimalSeparator).toBe('.');
      expect(DEFAULT_SETTINGS.currencySettings.defaultCurrency).toBe('EUR');
      expect(DEFAULT_SETTINGS.currencySettings.useApiRates).toBe(true);
    });

    it('should have all fallback rates defined', () => {
      const { fallbackRates } = DEFAULT_SETTINGS.currencySettings;
      
      expect(fallbackRates.EUR).toBe(1);
      expect(fallbackRates.USD).toBe(0.85);
      expect(fallbackRates.GBP).toBe(1.15);
      expect(fallbackRates.CHF).toBe(1.08);
      expect(fallbackRates.JPY).toBe(0.0054);
      expect(fallbackRates.AUD).toBe(0.57);
      expect(fallbackRates.CAD).toBe(0.62);
    });
  });
});
