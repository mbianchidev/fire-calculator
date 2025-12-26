import { Asset } from '../types/assetAllocation';

// Default portfolio value is 50,000 EUR
export const DEFAULT_PORTFOLIO_VALUE = 50000;

export const DEFAULT_ASSETS: Asset[] = [
  // Stocks - 60% of portfolio (~30k out of 50k total)
  {
    id: 'stock-1',
    name: 'S&P 500 Index ETF',
    ticker: 'SPY',
    assetClass: 'STOCKS',
    subAssetType: 'ETF',
    currentValue: 12000,
    targetMode: 'PERCENTAGE',
    targetPercent: 24,
  },
  {
    id: 'stock-2',
    name: 'Vanguard Total Stock Market',
    ticker: 'VTI',
    assetClass: 'STOCKS',
    subAssetType: 'ETF',
    currentValue: 8000,
    targetMode: 'PERCENTAGE',
    targetPercent: 16,
  },
  {
    id: 'stock-3',
    name: 'International Developed Markets',
    ticker: 'VXUS',
    assetClass: 'STOCKS',
    subAssetType: 'ETF',
    currentValue: 5000,
    targetMode: 'PERCENTAGE',
    targetPercent: 10,
  },
  {
    id: 'stock-4',
    name: 'Emerging Markets ETF',
    ticker: 'VWO',
    assetClass: 'STOCKS',
    subAssetType: 'ETF',
    currentValue: 3000,
    targetMode: 'PERCENTAGE',
    targetPercent: 6,
  },
  {
    id: 'stock-5',
    name: 'Small Cap Value',
    ticker: 'VBR',
    assetClass: 'STOCKS',
    subAssetType: 'ETF',
    currentValue: 2000,
    targetMode: 'PERCENTAGE',
    targetPercent: 4,
  },
  
  // Bonds - 40% of portfolio (~20k out of 50k total)
  {
    id: 'bond-1',
    name: 'Total Bond Market',
    ticker: 'BND',
    assetClass: 'BONDS',
    subAssetType: 'ETF',
    currentValue: 10000,
    targetMode: 'PERCENTAGE',
    targetPercent: 20,
  },
  {
    id: 'bond-2',
    name: 'Treasury Inflation-Protected',
    ticker: 'TIP',
    assetClass: 'BONDS',
    subAssetType: 'ETF',
    currentValue: 6000,
    targetMode: 'PERCENTAGE',
    targetPercent: 12,
  },
  {
    id: 'bond-3',
    name: 'International Bond',
    ticker: 'BNDX',
    assetClass: 'BONDS',
    subAssetType: 'ETF',
    currentValue: 4000,
    targetMode: 'PERCENTAGE',
    targetPercent: 8,
  },
  
  // Cash - approximately 5k
  {
    id: 'cash-1',
    name: 'Emergency Fund',
    ticker: 'CASH',
    assetClass: 'CASH',
    subAssetType: 'SAVINGS_ACCOUNT',
    currentValue: 4750,
    targetMode: 'SET',
    targetValue: 5000,
  },
  {
    id: 'cash-2',
    name: 'Broker Cash',
    ticker: 'CASH',
    assetClass: 'CASH',
    subAssetType: 'CHECKING_ACCOUNT',
    currentValue: 250,
    targetMode: 'PERCENTAGE',
    targetPercent: 0,
  },
];
