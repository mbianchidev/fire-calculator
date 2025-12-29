import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadSettings, saveSettings, DEFAULT_SETTINGS, type UserSettings } from '../utils/settings';
import { SUPPORTED_CURRENCIES, DEFAULT_FALLBACK_RATES, type SupportedCurrency } from '../types/currency';
import { exportFireCalculatorToCSV, exportAssetAllocationToCSV, importFireCalculatorFromCSV, importAssetAllocationFromCSV } from '../utils/csvExport';
import { loadFireCalculatorInputs, loadAssetAllocation, saveFireCalculatorInputs, saveAssetAllocation, clearAllData } from '../utils/localStorage';
import { DEFAULT_INPUTS } from '../utils/defaults';
import './SettingsPage.css';

interface SettingsPageProps {
  onSettingsChange?: (settings: UserSettings) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsChange }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setIsLoading(false);
  }, []);

  // Show temporary message
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Handle settings change
  const handleSettingChange = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    onSettingsChange?.(newSettings);
    showMessage('success', 'Settings saved!');
  };

  // Handle fallback rate change
  const handleFallbackRateChange = (currency: SupportedCurrency, rate: number) => {
    if (rate <= 0) {
      showMessage('error', 'Rate must be a positive number');
      return;
    }
    
    const newSettings = {
      ...settings,
      currencySettings: {
        ...settings.currencySettings,
        fallbackRates: {
          ...settings.currencySettings.fallbackRates,
          [currency]: rate,
        },
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    onSettingsChange?.(newSettings);
    showMessage('success', `${currency} rate updated!`);
  };

  // Reset fallback rates to defaults
  const handleResetFallbackRates = () => {
    const newSettings = {
      ...settings,
      currencySettings: {
        ...settings.currencySettings,
        fallbackRates: { ...DEFAULT_FALLBACK_RATES },
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    onSettingsChange?.(newSettings);
    showMessage('success', 'Fallback rates reset to defaults!');
  };

  // Export all data
  const handleExportAll = () => {
    try {
      // Export FIRE Calculator data
      const fireInputs = loadFireCalculatorInputs() || DEFAULT_INPUTS;
      const fireCSV = exportFireCalculatorToCSV(fireInputs);
      downloadCSV(fireCSV, `fire-calculator-data-${getDateString()}.csv`);

      // Export Asset Allocation data
      const { assets, assetClassTargets } = loadAssetAllocation();
      if (assets && assetClassTargets) {
        const assetCSV = exportAssetAllocationToCSV(assets, assetClassTargets);
        downloadCSV(assetCSV, `asset-allocation-data-${getDateString()}.csv`);
      }

      showMessage('success', 'Data exported successfully!');
    } catch (error) {
      showMessage('error', `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper to download CSV
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to get date string for filenames
  const getDateString = () => new Date().toISOString().split('T')[0];

  // Import FIRE Calculator data
  const handleImportFire = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const imported = importFireCalculatorFromCSV(csv);
        saveFireCalculatorInputs(imported);
        showMessage('success', 'FIRE Calculator data imported successfully!');
      } catch (error) {
        showMessage('error', `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Import Asset Allocation data
  const handleImportAssets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const imported = importAssetAllocationFromCSV(csv);
        saveAssetAllocation(imported.assets, imported.assetClassTargets);
        showMessage('success', 'Asset Allocation data imported successfully!');
      } catch (error) {
        showMessage('error', `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Reset all data
  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset ALL data? This will clear all saved data from localStorage and cannot be undone.')) {
      clearAllData();
      showMessage('success', 'All data has been reset!');
    }
  };

  if (isLoading) {
    return <div className="settings-page loading">Loading settings...</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>⚙️ Settings</h1>
        </div>

        {message && (
          <div className={`settings-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Account Settings */}
        <section className="settings-section">
          <h2>👤 Account</h2>
          <div className="setting-item">
            <label htmlFor="accountName">Account Name</label>
            <input
              id="accountName"
              type="text"
              value={settings.accountName}
              onChange={(e) => handleSettingChange('accountName', e.target.value)}
              maxLength={100}
              placeholder="My Portfolio"
            />
            <span className="setting-help">This name will be displayed throughout the app</span>
          </div>
        </section>

        {/* Display Settings */}
        <section className="settings-section">
          <h2>🎨 Display</h2>
          <div className="setting-item">
            <label>Decimal Separator</label>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${settings.decimalSeparator === '.' ? 'active' : ''}`}
                onClick={() => handleSettingChange('decimalSeparator', '.')}
              >
                Point (1,000.00)
              </button>
              <button
                className={`toggle-btn ${settings.decimalSeparator === ',' ? 'active' : ''}`}
                onClick={() => handleSettingChange('decimalSeparator', ',')}
              >
                Comma (1.000,00)
              </button>
            </div>
          </div>
        </section>

        {/* Currency Settings */}
        <section className="settings-section">
          <h2>💱 Currency Conversion Fallback Rates</h2>
          <p className="section-description">
            These rates are used when the live exchange rate API is unavailable.
            All values convert to EUR (the default currency).
          </p>
          <div className="fallback-rates-grid">
            {SUPPORTED_CURRENCIES.filter(c => c.code !== 'EUR').map((currency) => (
              <div key={currency.code} className="rate-item">
                <label htmlFor={`rate-${currency.code}`}>
                  {currency.code} ({currency.name})
                </label>
                <div className="rate-input-wrapper">
                  <span className="rate-prefix">1 {currency.code} =</span>
                  <input
                    id={`rate-${currency.code}`}
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={settings.currencySettings.fallbackRates[currency.code] ?? DEFAULT_FALLBACK_RATES[currency.code]}
                    onChange={(e) => handleFallbackRateChange(currency.code, parseFloat(e.target.value))}
                  />
                  <span className="rate-suffix">EUR</span>
                </div>
              </div>
            ))}
          </div>
          <button className="secondary-btn" onClick={handleResetFallbackRates}>
            Reset to Default Rates
          </button>
        </section>

        {/* Data Management */}
        <section className="settings-section">
          <h2>💾 Data Management</h2>
          
          <div className="data-management-group">
            <h3>Export Data</h3>
            <p className="setting-help">Download your data as CSV files</p>
            <button className="primary-btn" onClick={handleExportAll}>
              📥 Export All Data
            </button>
          </div>

          <div className="data-management-group">
            <h3>Import Data</h3>
            <p className="setting-help">Import data from CSV files. Make sure the files are in the correct format.</p>
            <div className="import-buttons">
              <label className="primary-btn import-label">
                📤 Import FIRE Calculator
                <input type="file" accept=".csv" onChange={handleImportFire} hidden />
              </label>
              <label className="primary-btn import-label">
                📤 Import Asset Allocation
                <input type="file" accept=".csv" onChange={handleImportAssets} hidden />
              </label>
            </div>
          </div>

          <div className="data-management-group danger-zone">
            <h3>⚠️ Danger Zone</h3>
            <p className="setting-help">This action cannot be undone</p>
            <button className="danger-btn" onClick={handleResetAll}>
              🗑️ Reset All Data
            </button>
          </div>
        </section>

        {/* Currency Disclaimer */}
        <section className="settings-section disclaimer">
          <h2>⚠️ Disclaimer</h2>
          <p>
            Exchange rates are fetched from publicly available APIs and may not reflect real-time rates.
            Fallback rates are used when the API is unavailable. For accurate financial decisions,
            please verify rates with your financial institution.
          </p>
        </section>
      </div>
    </div>
  );
};
