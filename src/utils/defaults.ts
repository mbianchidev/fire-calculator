import { CalculatorInputs } from '../types/calculator';
import { NetWorthTrackerData } from '../types/netWorthTracker';
import { ExpenseTrackerData } from '../types/expenseTracker';
import { Asset, AssetClass, AllocationMode, SubAssetType } from '../types/assetAllocation';
import { SupportedCurrency } from '../types/currency';

// Calculate default savings rate: (income - expenses) / income * 100
const defaultIncome = 60000;
const defaultExpenses = 40000;
const defaultSavingsRate = ((defaultIncome - defaultExpenses) / defaultIncome) * 100;

// Default years of expenses for FIRE target (equivalent to 3% withdrawal rate)
const defaultYearsOfExpenses = 100 / 3; // ~33.33 years

export const DEFAULT_INPUTS: CalculatorInputs = {
  initialSavings: 50000,
  stocksPercent: 70,
  bondsPercent: 20,
  cashPercent: 10,
  currentAnnualExpenses: defaultExpenses,
  fireAnnualExpenses: 40000,
  annualLaborIncome: defaultIncome,
  laborIncomeGrowthRate: 3,
  savingsRate: defaultSavingsRate,
  desiredWithdrawalRate: 3,
  yearsOfExpenses: defaultYearsOfExpenses,
  expectedStockReturn: 7,
  expectedBondReturn: 2,
  expectedCashReturn: -2,
  yearOfBirth: 1990,
  retirementAge: 67,
  statePensionIncome: 0,
  privatePensionIncome: 0,
  otherIncome: 0,
  stopWorkingAtFIRE: true,
  maxAge: 100,
  useAssetAllocationValue: false,
  useExpenseTrackerExpenses: false,
  useExpenseTrackerIncome: false,
};

// Demo data for Net Worth Tracker
export function getDemoNetWorthData(): NetWorthTrackerData {
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  
  return {
    years: [
      {
        year: prevYear,
        months: [
          {
            year: prevYear,
            month: 10,
            assets: [
              { id: 'demo-asset-1', ticker: 'VWCE', name: 'Vanguard FTSE All-World', shares: 80, pricePerShare: 105, currency: 'EUR' as SupportedCurrency, assetClass: 'ETF' },
              { id: 'demo-asset-2', ticker: 'AGGH', name: 'iShares Global Agg Bond', shares: 50, pricePerShare: 45, currency: 'EUR' as SupportedCurrency, assetClass: 'BONDS' },
            ],
            cashEntries: [
              { id: 'demo-cash-1', accountName: 'Emergency Fund', accountType: 'SAVINGS', balance: 12000, currency: 'EUR' as SupportedCurrency },
              { id: 'demo-cash-2', accountName: 'Main Checking', accountType: 'CHECKING', balance: 3500, currency: 'EUR' as SupportedCurrency },
            ],
            pensions: [
              { id: 'demo-pension-1', name: 'State Pension', pensionType: 'STATE', currentValue: 25000, currency: 'EUR' as SupportedCurrency },
            ],
            operations: [],
            isFrozen: true,
          },
          {
            year: prevYear,
            month: 11,
            assets: [
              { id: 'demo-asset-3', ticker: 'VWCE', name: 'Vanguard FTSE All-World', shares: 85, pricePerShare: 108, currency: 'EUR' as SupportedCurrency, assetClass: 'ETF' },
              { id: 'demo-asset-4', ticker: 'AGGH', name: 'iShares Global Agg Bond', shares: 50, pricePerShare: 44, currency: 'EUR' as SupportedCurrency, assetClass: 'BONDS' },
            ],
            cashEntries: [
              { id: 'demo-cash-3', accountName: 'Emergency Fund', accountType: 'SAVINGS', balance: 12500, currency: 'EUR' as SupportedCurrency },
              { id: 'demo-cash-4', accountName: 'Main Checking', accountType: 'CHECKING', balance: 2800, currency: 'EUR' as SupportedCurrency },
            ],
            pensions: [
              { id: 'demo-pension-2', name: 'State Pension', pensionType: 'STATE', currentValue: 25500, currency: 'EUR' as SupportedCurrency },
            ],
            operations: [
              { id: 'demo-op-1', date: `${prevYear}-11-15`, type: 'PURCHASE', description: 'Monthly DCA - VWCE', amount: 500, currency: 'EUR' as SupportedCurrency },
            ],
            isFrozen: true,
          },
          {
            year: prevYear,
            month: 12,
            assets: [
              { id: 'demo-asset-5', ticker: 'VWCE', name: 'Vanguard FTSE All-World', shares: 90, pricePerShare: 112, currency: 'EUR' as SupportedCurrency, assetClass: 'ETF' },
              { id: 'demo-asset-6', ticker: 'AGGH', name: 'iShares Global Agg Bond', shares: 55, pricePerShare: 46, currency: 'EUR' as SupportedCurrency, assetClass: 'BONDS' },
            ],
            cashEntries: [
              { id: 'demo-cash-5', accountName: 'Emergency Fund', accountType: 'SAVINGS', balance: 13000, currency: 'EUR' as SupportedCurrency },
              { id: 'demo-cash-6', accountName: 'Main Checking', accountType: 'CHECKING', balance: 4200, currency: 'EUR' as SupportedCurrency },
            ],
            pensions: [
              { id: 'demo-pension-3', name: 'State Pension', pensionType: 'STATE', currentValue: 26000, currency: 'EUR' as SupportedCurrency },
            ],
            operations: [
              { id: 'demo-op-2', date: `${prevYear}-12-15`, type: 'PURCHASE', description: 'Monthly DCA - VWCE', amount: 500, currency: 'EUR' as SupportedCurrency },
              { id: 'demo-op-3', date: `${prevYear}-12-20`, type: 'DIVIDEND', description: 'VWCE Dividend', amount: 120, currency: 'EUR' as SupportedCurrency },
            ],
            isFrozen: true,
          },
        ],
        isArchived: false,
      },
      {
        year: currentYear,
        months: [
          {
            year: currentYear,
            month: 1,
            assets: [
              { id: 'demo-asset-7', ticker: 'VWCE', name: 'Vanguard FTSE All-World', shares: 95, pricePerShare: 115, currency: 'EUR' as SupportedCurrency, assetClass: 'ETF' },
              { id: 'demo-asset-8', ticker: 'AGGH', name: 'iShares Global Agg Bond', shares: 55, pricePerShare: 47, currency: 'EUR' as SupportedCurrency, assetClass: 'BONDS' },
            ],
            cashEntries: [
              { id: 'demo-cash-7', accountName: 'Emergency Fund', accountType: 'SAVINGS', balance: 13500, currency: 'EUR' as SupportedCurrency },
              { id: 'demo-cash-8', accountName: 'Main Checking', accountType: 'CHECKING', balance: 3100, currency: 'EUR' as SupportedCurrency },
            ],
            pensions: [
              { id: 'demo-pension-4', name: 'State Pension', pensionType: 'STATE', currentValue: 26500, currency: 'EUR' as SupportedCurrency },
            ],
            operations: [
              { id: 'demo-op-4', date: `${currentYear}-01-15`, type: 'PURCHASE', description: 'Monthly DCA - VWCE', amount: 500, currency: 'EUR' as SupportedCurrency },
            ],
            isFrozen: false,
          },
        ],
        isArchived: false,
      },
    ],
    currentYear,
    currentMonth: 1,
    defaultCurrency: 'EUR',
    settings: {
      showPensionInNetWorth: true,
      includeUnrealizedGains: true,
    },
  };
}

// Demo data for Cashflow Tracker
export function getDemoCashflowData(): ExpenseTrackerData {
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  
  return {
    years: [
      {
        year: prevYear,
        months: [
          {
            year: prevYear,
            month: 12,
            incomes: [
              { id: 'demo-inc-1', date: `${prevYear}-12-01`, amount: 5000, description: 'Monthly Salary', type: 'income', source: 'SALARY' },
            ],
            expenses: [
              { id: 'demo-exp-1', date: `${prevYear}-12-01`, amount: 1200, description: 'Rent', type: 'expense', category: 'HOUSING', expenseType: 'NEED' },
              { id: 'demo-exp-2', date: `${prevYear}-12-05`, amount: 350, description: 'Groceries', type: 'expense', category: 'GROCERIES', expenseType: 'NEED' },
              { id: 'demo-exp-3', date: `${prevYear}-12-10`, amount: 150, description: 'Utilities', type: 'expense', category: 'UTILITIES', expenseType: 'NEED' },
              { id: 'demo-exp-4', date: `${prevYear}-12-15`, amount: 200, description: 'Dining Out', type: 'expense', category: 'DINING_OUT', expenseType: 'WANT' },
              { id: 'demo-exp-5', date: `${prevYear}-12-20`, amount: 100, description: 'Entertainment', type: 'expense', category: 'ENTERTAINMENT', expenseType: 'WANT' },
            ],
            budgets: [],
          },
        ],
        isArchived: false,
      },
      {
        year: currentYear,
        months: [
          {
            year: currentYear,
            month: 1,
            incomes: [
              { id: 'demo-inc-2', date: `${currentYear}-01-01`, amount: 5000, description: 'Monthly Salary', type: 'income', source: 'SALARY' },
              { id: 'demo-inc-3', date: `${currentYear}-01-15`, amount: 200, description: 'Freelance Work', type: 'income', source: 'FREELANCE' },
            ],
            expenses: [
              { id: 'demo-exp-6', date: `${currentYear}-01-01`, amount: 1200, description: 'Rent', type: 'expense', category: 'HOUSING', expenseType: 'NEED' },
              { id: 'demo-exp-7', date: `${currentYear}-01-05`, amount: 380, description: 'Groceries', type: 'expense', category: 'GROCERIES', expenseType: 'NEED' },
              { id: 'demo-exp-8', date: `${currentYear}-01-10`, amount: 160, description: 'Utilities', type: 'expense', category: 'UTILITIES', expenseType: 'NEED' },
              { id: 'demo-exp-9', date: `${currentYear}-01-12`, amount: 50, description: 'Streaming Services', type: 'expense', category: 'SUBSCRIPTIONS', expenseType: 'WANT' },
              { id: 'demo-exp-10', date: `${currentYear}-01-18`, amount: 180, description: 'Dining Out', type: 'expense', category: 'DINING_OUT', expenseType: 'WANT' },
            ],
            budgets: [],
          },
        ],
        isArchived: false,
      },
    ],
    currentYear,
    currentMonth: 1,
    currency: 'EUR',
    globalBudgets: [],
  };
}

// Demo data for Asset Allocation
export function getDemoAssetAllocationData(): { 
  assets: Asset[]; 
  assetClassTargets: Record<AssetClass, { targetMode: AllocationMode; targetPercent?: number }>;
} {
  return {
    assets: [
      {
        id: 'demo-aa-1',
        name: 'Vanguard FTSE All-World',
        ticker: 'VWCE',
        assetClass: 'STOCKS' as AssetClass,
        subAssetType: 'ETF' as SubAssetType,
        currentValue: 10925, // 95 shares * 115
        targetMode: 'OFF' as AllocationMode,
      },
      {
        id: 'demo-aa-2',
        name: 'iShares Global Agg Bond',
        ticker: 'AGGH',
        assetClass: 'BONDS' as AssetClass,
        subAssetType: 'ETF' as SubAssetType,
        currentValue: 2585, // 55 shares * 47
        targetMode: 'OFF' as AllocationMode,
      },
      {
        id: 'demo-aa-3',
        name: 'Emergency Fund',
        ticker: '',
        assetClass: 'CASH' as AssetClass,
        subAssetType: 'SAVINGS_ACCOUNT' as SubAssetType,
        currentValue: 13500,
        targetMode: 'OFF' as AllocationMode,
      },
      {
        id: 'demo-aa-4',
        name: 'Main Checking',
        ticker: '',
        assetClass: 'CASH' as AssetClass,
        subAssetType: 'CHECKING_ACCOUNT' as SubAssetType,
        currentValue: 3100,
        targetMode: 'OFF' as AllocationMode,
      },
    ],
    assetClassTargets: {
      STOCKS: { targetMode: 'PERCENTAGE', targetPercent: 70 },
      BONDS: { targetMode: 'PERCENTAGE', targetPercent: 20 },
      REAL_ESTATE: { targetMode: 'OFF' },
      CRYPTO: { targetMode: 'OFF' },
      CASH: { targetMode: 'PERCENTAGE', targetPercent: 10 },
    },
  };
}
