import { CalculatorInputs } from '../types/calculator';
import { 
  NetWorthTrackerData, 
  AssetHolding, 
  CashEntry, 
  PensionEntry, 
  FinancialOperation,
  MonthlySnapshot 
} from '../types/netWorthTracker';
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

// Base values coherent with Asset Allocation demo data  
// Total portfolio: €70,000 (€65,000 non-cash + €5,000 cash)
// Stocks: €35,000, Bonds: €30,000, Cash: €5,000
const NET_WORTH_DEMO_BASE = {
  // SPY: 23.921 shares @ €585.21 = €14,000
  spyShares: 23.921,
  spyPrice: 585.21,
  // VWCE: 186.667 shares @ €112.50 = €21,000
  vwceShares: 186.667,
  vwcePrice: 112.50,
  // AGGH: 327.869 shares @ €45.75 = €15,000
  agghShares: 327.869,
  agghPrice: 45.75,
  // TIP: 162.514 shares @ €92.30 = €15,000
  tipShares: 162.514,
  tipPrice: 92.30,
  // Cash totals: €5,000 (€3,500 + €1,500)
  emergencyFund: 3500,
  checking: 1500,
  pension: 25000,
};

// Seeded random for consistent demo data (using seed value)
function seededRandom(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

/**
 * Generate demo net worth data for a specific year
 * @param targetYear - The year to generate demo data for
 * @returns Array of MonthlySnapshot for all 12 months
 */
export function generateDemoNetWorthDataForYear(targetYear: number): MonthlySnapshot[] {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentYear = new Date().getFullYear();
  
  const months: MonthlySnapshot[] = [];
  for (let month = 1; month <= 12; month++) {
    const monthSeed = targetYear * 100 + month;
    
    // SPY (S&P 500 ETF) - shares stay relatively stable
    const spyPriceVariation = seededRandom(monthSeed, -0.08, 0.12);
    const spyPrice = Math.round((NET_WORTH_DEMO_BASE.spyPrice * (1 + spyPriceVariation + month * 0.005)) * 100) / 100;
    
    // VWCE (All-World) - Monthly DCA adds shares
    const vwceSharesGrowth = (month - 1) * 2;
    const vwcePriceVariation = seededRandom(monthSeed + 1, -0.08, 0.12);
    const vwcePrice = Math.round((NET_WORTH_DEMO_BASE.vwcePrice * (1 + vwcePriceVariation + month * 0.005)) * 100) / 100;
    
    // AGGH (Global Agg Bond) - Bond shares stay relatively stable
    const agghPriceVariation = seededRandom(monthSeed + 2, -0.03, 0.03);
    const agghPrice = Math.round((NET_WORTH_DEMO_BASE.agghPrice * (1 + agghPriceVariation)) * 100) / 100;
    
    // TIP (Treasury Inflation-Protected) - Bond shares stay relatively stable
    const tipPriceVariation = seededRandom(monthSeed + 3, -0.03, 0.03);
    const tipPrice = Math.round((NET_WORTH_DEMO_BASE.tipPrice * (1 + tipPriceVariation)) * 100) / 100;
    
    // Cash grows with monthly savings, but fluctuates due to expenses
    const emergencyFundGrowth = (month - 1) * 200;
    const emergencyFundVariation = Math.round(seededRandom(monthSeed + 4, -300, 300));
    const checkingVariation = Math.round(seededRandom(monthSeed + 5, -500, 500));
    
    // Pension grows steadily with small variations
    const pensionGrowth = (month - 1) * 400;
    const pensionVariation = Math.round(seededRandom(monthSeed + 6, -200, 200));
    
    // Only freeze months if target year is current year and month is in the past
    const isFrozen = targetYear === currentYear && month < currentMonth;
    
    const assets: AssetHolding[] = [
      { 
        id: `demo-asset-${targetYear}-${month}-1`, 
        ticker: 'SPY', 
        name: 'S&P 500 Index ETF', 
        shares: NET_WORTH_DEMO_BASE.spyShares, 
        pricePerShare: spyPrice, 
        currency: 'USD' as SupportedCurrency, 
        assetClass: 'STOCKS' as const
      },
      { 
        id: `demo-asset-${targetYear}-${month}-2`, 
        ticker: 'VWCE', 
        name: 'Vanguard FTSE All-World', 
        shares: NET_WORTH_DEMO_BASE.vwceShares + vwceSharesGrowth, 
        pricePerShare: vwcePrice, 
        currency: 'EUR' as SupportedCurrency, 
        assetClass: 'STOCKS' as const
      },
      { 
        id: `demo-asset-${targetYear}-${month}-3`, 
        ticker: 'AGGH', 
        name: 'iShares Global Agg Bond', 
        shares: NET_WORTH_DEMO_BASE.agghShares, 
        pricePerShare: agghPrice, 
        currency: 'EUR' as SupportedCurrency, 
        assetClass: 'BONDS' as const
      },
      { 
        id: `demo-asset-${targetYear}-${month}-4`, 
        ticker: 'TIP', 
        name: 'Treasury Inflation-Protected', 
        shares: NET_WORTH_DEMO_BASE.tipShares, 
        pricePerShare: tipPrice, 
        currency: 'EUR' as SupportedCurrency, 
        assetClass: 'BONDS' as const
      },
    ];
    
    const cashEntries: CashEntry[] = [
      { 
        id: `demo-cash-${targetYear}-${month}-1`, 
        accountName: 'Emergency Fund', 
        accountType: 'SAVINGS' as const, 
        balance: Math.max(2000, NET_WORTH_DEMO_BASE.emergencyFund + emergencyFundGrowth + emergencyFundVariation), 
        currency: 'EUR' as SupportedCurrency 
      },
      { 
        id: `demo-cash-${targetYear}-${month}-2`, 
        accountName: 'Main Checking', 
        accountType: 'CHECKING' as const, 
        balance: Math.max(500, NET_WORTH_DEMO_BASE.checking + checkingVariation), 
        currency: 'EUR' as SupportedCurrency 
      },
    ];
    
    const pensions: PensionEntry[] = [
      { 
        id: `demo-pension-${targetYear}-${month}`, 
        name: 'State Pension', 
        pensionType: 'STATE' as const, 
        currentValue: NET_WORTH_DEMO_BASE.pension + pensionGrowth + pensionVariation, 
        currency: 'EUR' as SupportedCurrency 
      },
    ];
    
    const operations: FinancialOperation[] = month % 3 === 0 ? [
      { id: `demo-op-${targetYear}-${month}-1`, date: `${targetYear}-${String(month).padStart(2, '0')}-15`, type: 'PURCHASE' as const, description: 'Monthly DCA - VWCE', amount: 500, currency: 'EUR' as SupportedCurrency },
      { id: `demo-op-${targetYear}-${month}-2`, date: `${targetYear}-${String(month).padStart(2, '0')}-20`, type: 'DIVIDEND' as const, description: 'VWCE Dividend', amount: Math.round(seededRandom(monthSeed + 7, 80, 150)), currency: 'EUR' as SupportedCurrency },
    ] : [
      { id: `demo-op-${targetYear}-${month}-1`, date: `${targetYear}-${String(month).padStart(2, '0')}-15`, type: 'PURCHASE' as const, description: 'Monthly DCA - VWCE', amount: 500, currency: 'EUR' as SupportedCurrency },
    ];
    
    months.push({
      year: targetYear,
      month,
      assets,
      cashEntries,
      pensions,
      operations,
      isFrozen,
    });
  }
  
  return months;
}

// Demo data for Net Worth Tracker - generates 12 months of data for current year with randomized variations
export function getDemoNetWorthData(): NetWorthTrackerData {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  const months = generateDemoNetWorthDataForYear(currentYear);
  
  return {
    years: [
      {
        year: currentYear,
        months,
        isArchived: false,
      },
    ],
    currentYear,
    currentMonth,
    defaultCurrency: 'EUR',
    settings: {
      showPensionInNetWorth: true,
      includeUnrealizedGains: true,
      syncWithAssetAllocation: true, // Enable sync by default in demo data
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

// Demo data for Asset Allocation - coherent with Net Worth demo data for current month
// Portfolio structure:
// - Total: €70,000 (€65,000 non-cash + €5,000 cash)
// - Stocks: €35,000 (50% actual) with 50% target = +€0 delta
// - Bonds: €30,000 (42.86% actual) with 43% target = ±€0 delta (rounded)
// - Cash: €5,000 (7.14% actual) with 7% target = +€0 delta
// Asset class targets are portfolio-wide: Stocks 50%, Bonds 43%, Cash 7%
export function getDemoAssetAllocationData(): { 
  assets: Asset[]; 
  assetClassTargets: Record<AssetClass, { targetMode: AllocationMode; targetPercent?: number }>;
} {
  // Portfolio totals: €70,000 with €35k stocks, €30k bonds, €5k cash
  // Using realistic prices and fractional shares
  
  // SPY (S&P 500 ETF): €14,000 value
  // Real price: 683.17 USD/share ≈ 585.21 EUR/share (at 1.167 USD/EUR)
  // Shares needed: 14,000 / 585.21 = 23.921 shares
  const spyShares = 23.921;
  const spyPrice = 585.21;
  
  // VWCE (Vanguard All-World): €21,000 value
  // Price: €112.50/share
  // Shares needed: 21,000 / 112.50 = 186.667 shares
  const vwceShares = 186.667;
  const vwcePrice = 112.50;
  
  // AGGH (Global Aggregate Bond): €15,000 value
  // Price: €45.75/share
  // Shares needed: 15,000 / 45.75 = 327.869 shares
  const aggh1Shares = 327.869;
  const aggh1Price = 45.75;
  
  // TIP (Treasury Inflation-Protected): €15,000 value
  // Price: €92.30/share
  // Shares needed: 15,000 / 92.30 = 162.514 shares
  const tipShares = 162.514;
  const tipPrice = 92.30;
  
  return {
    assets: [
      {
        id: 'demo-aa-1',
        name: 'S&P 500 Index ETF',
        ticker: 'SPY',
        assetClass: 'STOCKS' as AssetClass,
        subAssetType: 'ETF' as SubAssetType,
        currentValue: Math.round(spyShares * spyPrice * 100) / 100,
        shares: spyShares,
        pricePerShare: spyPrice,
        targetMode: 'PERCENTAGE' as AllocationMode,
        targetPercent: 40, // 40% of STOCKS allocation
        originalCurrency: 'USD' as SupportedCurrency,
      },
      {
        id: 'demo-aa-2',
        name: 'Vanguard FTSE All-World',
        ticker: 'VWCE',
        assetClass: 'STOCKS' as AssetClass,
        subAssetType: 'ETF' as SubAssetType,
        currentValue: Math.round(vwceShares * vwcePrice * 100) / 100,
        shares: vwceShares,
        pricePerShare: vwcePrice,
        targetMode: 'PERCENTAGE' as AllocationMode,
        targetPercent: 60, // 60% of STOCKS allocation
      },
      {
        id: 'demo-aa-3',
        name: 'iShares Global Agg Bond',
        ticker: 'AGGH',
        assetClass: 'BONDS' as AssetClass,
        subAssetType: 'ETF' as SubAssetType,
        currentValue: Math.round(aggh1Shares * aggh1Price * 100) / 100,
        shares: aggh1Shares,
        pricePerShare: aggh1Price,
        targetMode: 'PERCENTAGE' as AllocationMode,
        targetPercent: 50, // 50% of BONDS allocation
      },
      {
        id: 'demo-aa-4',
        name: 'Treasury Inflation-Protected',
        ticker: 'TIP',
        assetClass: 'BONDS' as AssetClass,
        subAssetType: 'ETF' as SubAssetType,
        currentValue: Math.round(tipShares * tipPrice * 100) / 100,
        shares: tipShares,
        pricePerShare: tipPrice,
        targetMode: 'PERCENTAGE' as AllocationMode,
        targetPercent: 50, // 50% of BONDS allocation
      },
      {
        id: 'demo-aa-5',
        name: 'Emergency Fund',
        ticker: '',
        assetClass: 'CASH' as AssetClass,
        subAssetType: 'SAVINGS_ACCOUNT' as SubAssetType,
        currentValue: 3500,
        targetMode: 'PERCENTAGE' as AllocationMode,
        targetPercent: 70, // 70% of CASH allocation
      },
      {
        id: 'demo-aa-6',
        name: 'Main Checking',
        ticker: '',
        assetClass: 'CASH' as AssetClass,
        subAssetType: 'CHECKING_ACCOUNT' as SubAssetType,
        currentValue: 1500,
        targetMode: 'PERCENTAGE' as AllocationMode,
        targetPercent: 30, // 30% of CASH allocation
      },
    ],
    assetClassTargets: {
      STOCKS: { targetMode: 'PERCENTAGE', targetPercent: 50 }, // 50% of portfolio
      BONDS: { targetMode: 'PERCENTAGE', targetPercent: 43 }, // 43% of portfolio
      REAL_ESTATE: { targetMode: 'OFF' },
      CRYPTO: { targetMode: 'OFF' },
      CASH: { targetMode: 'PERCENTAGE', targetPercent: 7 }, // 7% of portfolio
    },
  };
}
