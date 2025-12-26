import { Asset } from '../types/assetAllocation';

export const DEFAULT_ASSETS: Asset[] = [
  // Stocks - 60% of portfolio (~300k out of 500k total)
  {
    id: 'stock-1',
    name: 'S&P 500 Index ETF',
    ticker: 'SPY',
    assetClass: 'STOCKS',
    currentValue: 120000,
    targetMode: 'PERCENTAGE',
    targetPercent: 24,
  },
  {
    id: 'stock-2',
    name: 'Vanguard Total Stock Market',
    ticker: 'VTI',
    assetClass: 'STOCKS',
    currentValue: 80000,
    targetMode: 'PERCENTAGE',
    targetPercent: 16,
  },
  {
    id: 'stock-3',
    name: 'International Developed Markets',
    ticker: 'VXUS',
    assetClass: 'STOCKS',
    currentValue: 50000,
    targetMode: 'PERCENTAGE',
    targetPercent: 10,
  },
  {
    id: 'stock-4',
    name: 'Emerging Markets ETF',
    ticker: 'VWO',
    assetClass: 'STOCKS',
    currentValue: 30000,
    targetMode: 'PERCENTAGE',
    targetPercent: 6,
  },
  {
    id: 'stock-5',
    name: 'Small Cap Value',
    ticker: 'VBR',
    assetClass: 'STOCKS',
    currentValue: 20000,
    targetMode: 'PERCENTAGE',
    targetPercent: 4,
  },
  
  // Bonds - 40% of portfolio (~200k out of 500k total)
  {
    id: 'bond-1',
    name: 'Total Bond Market',
    ticker: 'BND',
    assetClass: 'BONDS',
    currentValue: 100000,
    targetMode: 'PERCENTAGE',
    targetPercent: 20,
  },
  {
    id: 'bond-2',
    name: 'Treasury Inflation-Protected',
    ticker: 'TIP',
    assetClass: 'BONDS',
    currentValue: 60000,
    targetMode: 'PERCENTAGE',
    targetPercent: 12,
  },
  {
    id: 'bond-3',
    name: 'International Bond',
    ticker: 'BNDX',
    assetClass: 'BONDS',
    currentValue: 40000,
    targetMode: 'PERCENTAGE',
    targetPercent: 8,
  },
  
  // Cash - approximately 50k
  {
    id: 'cash-1',
    name: 'Emergency Fund',
    ticker: 'CASH',
    assetClass: 'CASH',
    currentValue: 50000,
    targetMode: 'SET',
    targetValue: 50000,
  },
  {
    id: 'cash-2',
    name: 'Broker Cash',
    ticker: 'CASH',
    assetClass: 'CASH',
    currentValue: 2500,
    targetMode: 'PERCENTAGE',
    targetPercent: 0,
  },
];
