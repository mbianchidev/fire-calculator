/**
 * User Settings utilities
 * Handles saving/loading user preferences to/from localStorage
 */

import {
  CurrencySettings,
  DEFAULT_CURRENCY_SETTINGS,
} from '../types/currency';

export interface UserSettings {
  accountName: string;
  decimalSeparator: '.' | ',';
  currencySettings: CurrencySettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  accountName: 'My Portfolio',
  decimalSeparator: '.',
  currencySettings: DEFAULT_CURRENCY_SETTINGS,
};

const SETTINGS_KEY = 'fire-calculator-settings';

/**
 * Save user settings to localStorage
 * @param settings - The settings to save
 */
export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
    throw new Error('Failed to save settings to local storage. Storage may be full or disabled.');
  }
}

/**
 * Load user settings from localStorage
 * @returns The saved settings, or DEFAULT_SETTINGS if none saved
 */
export function loadSettings(): UserSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        currencySettings: {
          ...DEFAULT_SETTINGS.currencySettings,
          ...(parsed.currencySettings || {}),
          fallbackRates: {
            ...DEFAULT_SETTINGS.currencySettings.fallbackRates,
            ...(parsed.currencySettings?.fallbackRates || {}),
          },
        },
      };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Clear user settings from localStorage
 */
export function clearSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to clear settings from localStorage:', error);
  }
}

/**
 * Update a single fallback rate
 * @param settings - Current settings
 * @param currency - Currency to update
 * @param rate - New rate
 * @returns Updated settings
 */
export function updateFallbackRate(
  settings: UserSettings,
  currency: string,
  rate: number
): UserSettings {
  return {
    ...settings,
    currencySettings: {
      ...settings.currencySettings,
      fallbackRates: {
        ...settings.currencySettings.fallbackRates,
        [currency]: rate,
      },
    },
  };
}

/**
 * Validate user settings
 * @param settings - Settings to validate
 * @returns Validation result with any errors
 */
export function validateSettings(settings: Partial<UserSettings>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (settings.accountName !== undefined) {
    if (typeof settings.accountName !== 'string') {
      errors.push('Account name must be a string');
    } else if (settings.accountName.length > 100) {
      errors.push('Account name must be 100 characters or less');
    }
  }

  if (settings.decimalSeparator !== undefined) {
    if (settings.decimalSeparator !== '.' && settings.decimalSeparator !== ',') {
      errors.push('Decimal separator must be "." or ","');
    }
  }

  if (settings.currencySettings?.fallbackRates) {
    for (const [currency, rate] of Object.entries(settings.currencySettings.fallbackRates)) {
      if (typeof rate !== 'number' || rate <= 0) {
        errors.push(`Invalid rate for ${currency}: must be a positive number`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
