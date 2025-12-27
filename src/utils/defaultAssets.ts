import { Asset } from '../types/assetAllocation';

// Default portfolio value is 50000 EUR
export const DEFAULT_PORTFOLIO_VALUE = 50000;

export const DEFAULT_ASSETS: Asset[] = [
  // Stocks - 60% of portfolio (~30k out of 50k total)
  {
    id: 'stock-1',
    name: 'S&P 500 Index ETF',
    ticker: 'SPY',
    isin: 'US78462F1030',
    assetClass: 'STOCKS',
    subAssetType: 'ETF',
    currentValue: 12000,
    targetMode: 'PERCENTAGE',
    targetPercent: 40, // 40% of stocks
  },
  {
    id: 'stock-2',
    name: 'Vanguard Total Stock Market',
    ticker: 'VTI',
    isin: 'US9229087690',
    assetClass: 'STOCKS',
    subAssetType: 'ETF',
    currentValue: 8000,
    targetMode: 'PERCENTAGE',
    targetPercent: 27, // 27% of stocks
  },
  {
    id: 'stock-3',
    name: 'International Developed Markets',
    ticker: 'VXUS',
    isin: 'US9219097683',
    assetClass: 'STOCKS',
    subAssetType: 'ETF',
    currentValue: 5000,
    targetMode: 'PERCENTAGE',
    targetPercent: 17, // 17% of stocks
  },
  {
    id: 'stock-4',
    name: 'Emerging Markets ETF',
    ticker: 'VWO',
    isin: 'US9220428588',
    assetClass: 'STOCKS',
    subAssetType: 'ETF',
    currentValue: 3000,
    targetMode: 'PERCENTAGE',
    targetPercent: 10, // 10% of stocks
  },
  {
    id: 'stock-5',
    name: 'Small Cap Value',
    ticker: 'VBR',
    isin: 'US9219097766',
    assetClass: 'STOCKS',
    subAssetType: 'ETF',
    currentValue: 2000,
    targetMode: 'PERCENTAGE',
    targetPercent: 6, // 6% of stocks = 100% total
  },
  
  // Bonds - 40% of portfolio (~20k out of 50k total)
  {
    id: 'bond-1',
    name: 'Total Bond Market',
    ticker: 'BND',
    isin: 'US9219378356',
    assetClass: 'BONDS',
    subAssetType: 'ETF',
    currentValue: 10000,
    targetMode: 'PERCENTAGE',
    targetPercent: 50, // 50% of bonds
  },
  {
    id: 'bond-2',
    name: 'Treasury Inflation-Protected',
    ticker: 'TIP',
    isin: 'US4642874659',
    assetClass: 'BONDS',
    subAssetType: 'ETF',
    currentValue: 6000,
    targetMode: 'PERCENTAGE',
    targetPercent: 30, // 30% of bonds
  },
  {
    id: 'bond-3',
    name: 'International Bond',
    ticker: 'BNDX',
    isin: 'US9219378273',
    assetClass: 'BONDS',
    subAssetType: 'ETF',
    currentValue: 4000,
    targetMode: 'PERCENTAGE',
    targetPercent: 20, // 20% of bonds = 100% total
  },
  
  // Cash - approximately 5k (SET to 5k target)
  {
    id: 'cash-1',
    name: 'Primary bank cash',
    ticker: 'CASH',
    assetClass: 'CASH',
    subAssetType: 'SAVINGS_ACCOUNT',
    currentValue: 5000,
    targetMode: 'SET',
    targetValue: 5000,
  },
];
