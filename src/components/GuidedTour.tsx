import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadTourCompleted, saveTourCompleted } from '../utils/tourPreferences';
import { saveFireCalculatorInputs, saveAssetAllocation, saveExpenseTrackerData, saveNetWorthTrackerData, clearAllData, loadFireCalculatorInputs, loadAssetAllocation } from '../utils/cookieStorage';
import { saveSettings, loadSettings, DEFAULT_SETTINGS } from '../utils/cookieSettings';
import { DEFAULT_INPUTS, getDemoNetWorthData, getDemoAssetAllocationData } from '../utils/defaults';
import { generateDemoExpenseData } from '../utils/demoExpenseData';
import { DEFAULT_FALLBACK_RATES, type SupportedCurrency } from '../types/currency';
import './GuidedTour.css';

interface TourStep {
  title: string;
  content: React.ReactNode;
  icon: string;
}

interface InteractiveStep {
  page: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  elementSelector?: string; // CSS selector to highlight specific element
  inputSelector?: string; // CSS selector for input to validate (required when starting fresh)
  inputLabel?: string; // Label for the input field for validation message
  allowZero?: boolean; // Whether zero is a valid value for this field
  clickAction?: string; // CSS selector for button to click to open dialog
  dialogSelector?: string; // CSS selector for dialog to wait for
  isDialogStep?: boolean; // Whether this step is inside a dialog
  closeDialogAfter?: boolean; // Whether to close the dialog after this step
}

type TourPhase = 'overview' | 'data-choice' | 'interactive-prompt' | 'interactive' | 'dialog' | 'end';

interface GuidedTourProps {
  onTourComplete?: () => void;
}

export function GuidedTour({ onTourComplete }: GuidedTourProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [demoDataLoaded, setDemoDataLoaded] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [tourPhase, setTourPhase] = useState<TourPhase>('overview');
  const [interactiveStep, setInteractiveStep] = useState(0);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [currentPageTour, setCurrentPageTour] = useState<string | null>(null);
  const [keepDemoData, setKeepDemoData] = useState(true);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hadExistingData, setHadExistingData] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Check if tour should be shown on mount
  useEffect(() => {
    const tourCompleted = loadTourCompleted();
    if (!tourCompleted) {
      setIsVisible(true);
      // Check if user already has data (for first visit, they won't)
      const existingFireData = loadFireCalculatorInputs();
      const existingAssetData = loadAssetAllocation();
      const hasExistingData = !!(existingFireData || existingAssetData?.assets?.length);
      setHadExistingData(hasExistingData);
    }
  }, []);

  const loadDemoData = useCallback(() => {
    if (demoDataLoaded) return;

    // Reset settings to EUR as default currency
    const settings = loadSettings();
    const newSettings = {
      ...settings,
      currencySettings: {
        ...settings.currencySettings,
        defaultCurrency: 'EUR' as SupportedCurrency,
        fallbackRates: { ...DEFAULT_FALLBACK_RATES },
      },
    };
    saveSettings(newSettings);

    // Load demo FIRE Calculator data
    saveFireCalculatorInputs(DEFAULT_INPUTS);

    // Load demo Asset Allocation data
    const { assets, assetClassTargets } = getDemoAssetAllocationData();
    saveAssetAllocation(assets, assetClassTargets);

    // Load demo Cashflow Tracker data
    const cashflowData = generateDemoExpenseData();
    saveExpenseTrackerData(cashflowData);

    // Load demo Net Worth Tracker data
    const netWorthData = getDemoNetWorthData();
    saveNetWorthTrackerData(netWorthData);

    setDemoDataLoaded(true);
  }, [demoDataLoaded]);

  // Load demo data when entering the "how tools work together" step
  useEffect(() => {
    if (currentStep >= 2 && !demoDataLoaded) {
      loadDemoData();
    }
  }, [currentStep, demoDataLoaded, loadDemoData]);

  // Add/remove tour-interactive-mode class on body during interactive tour
  useEffect(() => {
    if (tourPhase === 'interactive' && currentPageTour) {
      document.body.classList.add('tour-interactive-mode');
    } else {
      document.body.classList.remove('tour-interactive-mode');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('tour-interactive-mode');
    };
  }, [tourPhase, currentPageTour]);

  // Highlight elements during interactive tour
  useEffect(() => {
    if (tourPhase !== 'interactive' || !currentPageTour) {
      // Clean up highlight when not in interactive mode
      if (highlightedElement) {
        highlightedElement.classList.remove('tour-highlight');
        setHighlightedElement(null);
      }
      return;
    }

    const currentTour = pageTours[currentPageTour];
    const currentInteractiveStep = currentTour?.steps[interactiveStep];
    
    // Remove highlight from previous element
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
    }

    // Add highlight to new element
    if (currentInteractiveStep?.elementSelector) {
      // Small delay to ensure DOM is ready after navigation
      const timeoutId = setTimeout(() => {
        const element = document.querySelector(currentInteractiveStep.elementSelector!) as HTMLElement;
        if (element) {
          element.classList.add('tour-highlight');
          setHighlightedElement(element);
          // Scroll element into view
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      setHighlightedElement(null);
    }
  }, [tourPhase, currentPageTour, interactiveStep, highlightedElement]);

  // Validate input when trying to proceed (only when starting fresh)
  const validateCurrentStep = useCallback((): boolean => {
    // If user kept demo data, no validation needed
    if (keepDemoData) {
      setValidationError(null);
      return true;
    }

    if (tourPhase !== 'interactive' || !currentPageTour) {
      return true;
    }

    const currentTour = pageTours[currentPageTour];
    const currentInteractiveStep = currentTour?.steps[interactiveStep];

    // If no input selector, no validation needed
    if (!currentInteractiveStep?.inputSelector) {
      setValidationError(null);
      return true;
    }

    // Find the input and check if it has a value
    const input = document.querySelector(currentInteractiveStep.inputSelector) as HTMLInputElement;
    if (input) {
      const value = input.value?.trim();
      const isZero = value === '0' || parseFloat(value) === 0;
      const isEmpty = !value || value === '';
      
      // Allow zero if the step specifies allowZero: true
      if (isEmpty || (isZero && !currentInteractiveStep.allowZero)) {
        setValidationError(`Please enter a value for ${currentInteractiveStep.inputLabel || 'this field'} to continue`);
        input.focus();
        return false;
      }
    }

    setValidationError(null);
    return true;
  }, [keepDemoData, tourPhase, currentPageTour, interactiveStep]);

  const tourSteps: TourStep[] = [
    {
      title: 'Welcome to Fire Tools! 🚀',
      icon: '👋',
      content: (
        <div className="tour-step-content">
          <p>
            Welcome! Fire Tools is a comprehensive suite of financial planning tools 
            designed to help you achieve <strong>Financial Independence and Retire Early (FIRE)</strong>.
          </p>
          <p>
            This quick tour will show you the main features and how to get the most 
            out of the application. We'll also load some demo data so you can see 
            everything in action.
          </p>
          <p className="tour-privacy-note">
            <span className="tour-note-icon">🔒</span>
            <span>All your data stays on your device - we never send it anywhere.</span>
          </p>
        </div>
      ),
    },
    {
      title: 'Asset Allocation Manager 📊',
      icon: '📊',
      content: (
        <div className="tour-step-content">
          <p>
            <strong>Track and manage your investment portfolio</strong> with intelligent 
            asset allocation tools.
          </p>
          <ul className="tour-feature-list">
            <li><span className="tour-feature-icon">💼</span> Add stocks, bonds, ETFs, and other assets</li>
            <li><span className="tour-feature-icon">⚖️</span> Set target allocations and see rebalancing recommendations</li>
            <li><span className="tour-feature-icon">📉</span> Use the DCA (Dollar Cost Averaging) helper for regular investments</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Cashflow Tracker 💰',
      icon: '💰',
      content: (
        <div className="tour-step-content">
          <p>
            <strong>Monitor your income and expenses</strong> to understand your spending 
            patterns and savings rate.
          </p>
          <ul className="tour-feature-list">
            <li><span className="tour-feature-icon">📝</span> Log income and expenses by category</li>
            <li><span className="tour-feature-icon">💵</span> Set budgets using the 50/30/20 rule</li>
            <li><span className="tour-feature-icon">📊</span> View charts and analytics of your spending</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Net Worth Tracker 📈',
      icon: '📈',
      content: (
        <div className="tour-step-content">
          <p>
            <strong>Track your financial progress over time</strong> with monthly snapshots 
            of your net worth.
          </p>
          <ul className="tour-feature-list">
            <li><span className="tour-feature-icon">💼</span> Monitor assets, cash, and pension accounts</li>
            <li><span className="tour-feature-icon">📈</span> See historical charts of your wealth growth</li>
            <li><span className="tour-feature-icon">🔄</span> Sync with Asset Allocation for consistency</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'FIRE Calculator 🔥',
      icon: '🔥',
      content: (
        <div className="tour-step-content">
          <p>
            <strong>Calculate your path to Financial Independence</strong> with detailed 
            projections and timeline analysis.
          </p>
          <ul className="tour-feature-list">
            <li><span className="tour-feature-icon">📊</span> Visual projections of your net worth over time</li>
            <li><span className="tour-feature-icon">🎯</span> See exactly when you can reach FIRE</li>
            <li><span className="tour-feature-icon">⚙️</span> Adjust parameters to see different scenarios</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Monte Carlo Simulations 🎲',
      icon: '🎲',
      content: (
        <div className="tour-step-content">
          <p>
            <strong>Assess the probability of reaching your FIRE goals</strong> by running 
            thousands of simulations with randomized market returns.
          </p>
          <ul className="tour-feature-list">
            <li><span className="tour-feature-icon">🎯</span> See your success probability percentage</li>
            <li><span className="tour-feature-icon">📉</span> Account for market volatility and black swan events</li>
            <li><span className="tour-feature-icon">⚡</span> Understand the range of possible outcomes</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Tools Work Together 🔗',
      icon: '🔗',
      content: (
        <div className="tour-step-content">
          <p>
            <strong>The real power comes from using tools together!</strong> Here's how 
            they connect:
          </p>
          <div className="tour-integration-diagram">
            <div className="tour-integration-item">
              <span className="tour-integration-icon">📊</span>
              <span className="tour-integration-arrow">→</span>
              <span className="tour-integration-icon">🔥</span>
              <span className="tour-integration-text">Asset values flow into FIRE Calculator</span>
            </div>
            <div className="tour-integration-item">
              <span className="tour-integration-icon">💰</span>
              <span className="tour-integration-arrow">→</span>
              <span className="tour-integration-icon">🔥</span>
              <span className="tour-integration-text">Income/expenses update savings calculations</span>
            </div>
            <div className="tour-integration-item">
              <span className="tour-integration-icon">📈</span>
              <span className="tour-integration-arrow">↔</span>
              <span className="tour-integration-icon">📊</span>
              <span className="tour-integration-text">Net Worth syncs with Asset Allocation</span>
            </div>
          </div>
          <p className="tour-tip">
            <strong>💡 Tip:</strong> Each tool can also work independently if you prefer!
          </p>
        </div>
      ),
    },
  ];

  // Interactive tour steps for each page
  const fireCalculatorSteps: InteractiveStep[] = [
    {
      page: '/fire-calculator',
      title: '💰 Initial Savings',
      description: 'Enter your current savings or portfolio value. This is your starting point for FIRE calculations.',
      position: 'center',
      elementSelector: '[data-tour="initial-savings"]',
      inputSelector: '#initial-savings',
      inputLabel: 'Initial Savings',
      allowZero: true, // Zero is valid for someone just starting
    },
    {
      page: '/fire-calculator',
      title: '💵 Annual Income',
      description: 'Enter your annual net labor income. This determines how much you can save each year toward FIRE.',
      position: 'center',
      elementSelector: '[data-tour="income-section"]',
      inputSelector: '#labor-income',
      inputLabel: 'Annual Income',
    },
    {
      page: '/fire-calculator',
      title: '🏠 Annual Expenses',
      description: 'Set your current annual expenses. Lower expenses mean a faster path to FIRE!',
      position: 'center',
      elementSelector: '[data-tour="expenses-section"]',
      inputSelector: '#current-expenses',
      inputLabel: 'Annual Expenses',
    },
    {
      page: '/fire-calculator',
      title: '📊 Withdrawal Rate',
      description: 'The withdrawal rate (typically 3-4%) determines your FIRE target. A 4% rate means you need 25x your annual expenses.',
      position: 'center',
      elementSelector: '[data-tour="fire-params"]',
      inputSelector: '#withdrawal-rate',
      inputLabel: 'Withdrawal Rate',
    },
    {
      page: '/fire-calculator',
      title: '⚙️ Integration Options',
      description: 'These options connect tools together: sync portfolio values from Asset Allocation, or use actual income/expenses from Cashflow Tracker for more accurate calculations.',
      position: 'center',
      elementSelector: '[data-tour="options-section"]',
    },
    {
      page: '/fire-calculator',
      title: '🎯 FIRE Metrics',
      description: 'See your FIRE target, years to FIRE, and projected portfolio value. These are your key milestones!',
      position: 'center',
      elementSelector: '[data-tour="results-section"]',
    },
    {
      page: '/fire-calculator',
      title: '📈 Growth Charts',
      description: 'Visualize your journey! The Net Worth Growth chart shows your portfolio over time, and Income vs Expenses shows your cash flow.',
      position: 'center',
      elementSelector: '[data-tour="charts-section"]',
    },
  ];

  const assetAllocationSteps: InteractiveStep[] = [
    {
      page: '/asset-allocation',
      title: '📊 Your Assets',
      description: 'This table shows your portfolio holdings. You can see each asset\'s current value, target allocation, and recommended action (BUY/SELL/HOLD).',
      position: 'center',
      elementSelector: '[data-tour="asset-list"]',
    },
    {
      page: '/asset-allocation',
      title: '➕ Add New Assets',
      description: 'Click "Add Asset" to add a new holding to your portfolio. Let\'s open the dialog to see how it works!',
      position: 'center',
      elementSelector: '[data-tour="add-asset-button"]',
      clickAction: '[data-tour="add-asset-button"] button',
      dialogSelector: '.dialog',
    },
    // Add Asset Dialog steps
    {
      page: '/asset-allocation',
      title: '📝 Asset Class Selection',
      description: 'First, choose the asset class (Stocks, Bonds, Cash, Crypto, or Real Estate). This determines how the asset is categorized in your portfolio.',
      position: 'center',
      elementSelector: '.dialog',
      isDialogStep: true,
    },
    {
      page: '/asset-allocation',
      title: '🏷️ Asset Details',
      description: 'Enter the asset name, ticker symbol (e.g., AAPL, VTI), number of shares you own, and the price per share. The total value is calculated automatically.',
      position: 'center',
      elementSelector: '.dialog',
      isDialogStep: true,
    },
    {
      page: '/asset-allocation',
      title: '🎯 Target Allocation',
      description: 'Set your target allocation mode: "%" for percentage of the asset class, "SET" for a fixed amount, or "OFF" to exclude from rebalancing.',
      position: 'center',
      elementSelector: '.dialog',
      isDialogStep: true,
      closeDialogAfter: true,
    },
    {
      page: '/asset-allocation',
      title: '⚖️ Target Allocations',
      description: 'Set your target percentages for each asset class. The tool calculates what to buy or sell to reach your targets.',
      position: 'center',
      elementSelector: '[data-tour="target-allocations"]',
    },
    {
      page: '/asset-allocation',
      title: '💹 DCA Helper',
      description: 'The DCA (Dollar Cost Averaging) Helper calculates how to split a lump sum investment. Let\'s see how it works!',
      position: 'center',
      elementSelector: '[data-tour="dca-helper"]',
      clickAction: '[data-tour="dca-helper"] button',
      dialogSelector: '.dca-dialog',
    },
    // DCA Helper Dialog steps
    {
      page: '/asset-allocation',
      title: '💰 Enter Investment Amount',
      description: 'Enter the amount you want to invest. The DCA Helper will calculate how to split it across your assets according to your target allocations.',
      position: 'center',
      elementSelector: '.dca-dialog',
      isDialogStep: true,
    },
    {
      page: '/asset-allocation',
      title: '📊 Investment Breakdown',
      description: 'After calculating, you\'ll see exactly how much to invest in each asset and how many shares to buy. Current prices are fetched from Yahoo Finance.',
      position: 'center',
      elementSelector: '.dca-dialog',
      isDialogStep: true,
    },
    {
      page: '/asset-allocation',
      title: '✅ Confirm Investments',
      description: 'After making your investments, you can confirm the actual shares purchased to track deviations from the suggested amounts.',
      position: 'center',
      elementSelector: '.dca-dialog',
      isDialogStep: true,
      closeDialogAfter: true,
    },
  ];

  const expenseTrackerSteps: InteractiveStep[] = [
    {
      page: '/expense-tracker',
      title: '📝 Add Transactions',
      description: 'Track your income and expenses here. Let\'s see how to add income first!',
      position: 'center',
      elementSelector: '[data-tour="transaction-actions"]',
      clickAction: '.btn-add.income',
      dialogSelector: '.dialog',
    },
    // Add Income Dialog steps
    {
      page: '/expense-tracker',
      title: '📅 Date & Amount',
      description: 'Select the date when you received the income and enter the amount. This helps track your income over time.',
      position: 'center',
      elementSelector: '.dialog',
      isDialogStep: true,
    },
    {
      page: '/expense-tracker',
      title: '💼 Income Source',
      description: 'Choose the income source: Salary, Bonus, Dividend, Freelance, Investment, Rental, or Other. This categorizes your income for better analytics.',
      position: 'center',
      elementSelector: '.dialog',
      isDialogStep: true,
      closeDialogAfter: true,
    },
    {
      page: '/expense-tracker',
      title: '💸 Add Expense',
      description: 'Now let\'s see how to add an expense. Click "Add Expense" to record your spending.',
      position: 'center',
      elementSelector: '[data-tour="transaction-actions"]',
      clickAction: '.btn-add.expense',
      dialogSelector: '.dialog',
    },
    // Add Expense Dialog steps
    {
      page: '/expense-tracker',
      title: '📅 Expense Details',
      description: 'Enter the date, amount, and a description of the expense. Be specific to help you track spending patterns.',
      position: 'center',
      elementSelector: '.dialog',
      isDialogStep: true,
    },
    {
      page: '/expense-tracker',
      title: '🏷️ Category & Type',
      description: 'Select a category (Housing, Food, Transport, etc.) and classify as Need or Want. This powers the 50/30/20 budget analysis.',
      position: 'center',
      elementSelector: '.dialog',
      isDialogStep: true,
      closeDialogAfter: true,
    },
    {
      page: '/expense-tracker',
      title: '📊 50/30/20 Budget Rule',
      description: 'See how your spending compares to the 50/30/20 rule: 50% for needs (housing, food), 30% for wants (entertainment), and 20% for savings.',
      position: 'center',
      elementSelector: '[data-tour="budget-analysis"]',
    },
    {
      page: '/expense-tracker',
      title: '💵 Set Budgets',
      description: 'Go to the Budgets tab to set monthly spending limits for each category. Track your progress with visual indicators.',
      position: 'center',
      elementSelector: '[data-tour="budgets-tab"]',
    },
    {
      page: '/expense-tracker',
      title: '📈 Analytics',
      description: 'The Analytics tab shows spending trends, category breakdowns, and monthly comparisons to help you understand your financial habits.',
      position: 'center',
      elementSelector: '[data-tour="analytics-tab"]',
    },
  ];

  const netWorthSteps: InteractiveStep[] = [
    {
      page: '/net-worth-tracker',
      title: '💰 Monthly Data Entry',
      description: 'Log your assets, cash, pensions, and financial operations. Let\'s see how to log an asset!',
      position: 'center',
      elementSelector: '[data-tour="assets-section"]',
      clickAction: '.btn-entry.asset',
      dialogSelector: '.dialog',
    },
    // Log Asset Dialog steps
    {
      page: '/net-worth-tracker',
      title: '📊 Asset Information',
      description: 'Enter the asset class, name, and ticker symbol. Choose from Stocks, Bonds, Cash, Crypto, or Real Estate.',
      position: 'center',
      elementSelector: '.dialog',
      isDialogStep: true,
    },
    {
      page: '/net-worth-tracker',
      title: '💵 Shares & Price',
      description: 'Enter the number of shares you hold and the current price per share. The total value is calculated automatically.',
      position: 'center',
      elementSelector: '.dialog',
      isDialogStep: true,
      closeDialogAfter: true,
    },
    {
      page: '/net-worth-tracker',
      title: '📝 Log Operations',
      description: 'Track financial operations like dividends, purchases, and sales. Let\'s see how!',
      position: 'center',
      elementSelector: '[data-tour="assets-section"]',
      clickAction: '.btn-entry.operation',
      dialogSelector: '.net-worth-dialog',
    },
    // Log Operation Dialog steps
    {
      page: '/net-worth-tracker',
      title: '📅 Operation Details',
      description: 'Select the date and operation type: Dividend, Purchase, Sale, Deposit, Withdrawal, Interest, or Tax.',
      position: 'center',
      elementSelector: '.net-worth-dialog',
      isDialogStep: true,
    },
    {
      page: '/net-worth-tracker',
      title: '💰 Amount & Description',
      description: 'Enter the amount and a description. Income operations (dividends, interest) increase your net worth; expenses (taxes) decrease it.',
      position: 'center',
      elementSelector: '.net-worth-dialog',
      isDialogStep: true,
      closeDialogAfter: true,
    },
    {
      page: '/net-worth-tracker',
      title: '📈 Historical Chart',
      description: 'Watch your wealth grow over time! The chart shows your net worth progression with monthly variations and forecasted growth.',
      position: 'center',
      elementSelector: '[data-tour="historical-chart"]',
    },
    {
      page: '/net-worth-tracker',
      title: '🔄 Asset Allocation Sync',
      description: 'Enable sync to automatically keep your asset data consistent between Net Worth Tracker and Asset Allocation Manager.',
      position: 'center',
      elementSelector: '[data-tour="sync-options"]',
    },
  ];

  // Monte Carlo Simulation steps
  const monteCarloSteps: InteractiveStep[] = [
    {
      page: '/monte-carlo',
      title: '🎲 Monte Carlo Overview',
      description: 'Monte Carlo simulations run thousands of possible market scenarios to show the probability of reaching your FIRE goals. This accounts for market volatility and uncertainty.',
      position: 'center',
      elementSelector: '[data-tour="monte-carlo-overview"]',
    },
    {
      page: '/monte-carlo',
      title: '⚙️ Simulation Parameters',
      description: 'Adjust the simulation settings: number of simulations, stock/bond volatility, and black swan event probability. These affect how conservative or optimistic your projections are.',
      position: 'center',
      elementSelector: '[data-tour="monte-carlo-params"]',
    },
    {
      page: '/monte-carlo',
      title: '📊 Results & Success Rate',
      description: 'After running simulations, see your success probability, median outcome, and the range of possible results. Green means high probability of success!',
      position: 'center',
      elementSelector: '[data-tour="monte-carlo-results"]',
    },
  ];

  const pageTours: Record<string, { steps: InteractiveStep[]; nextPage: string | null; previousPage: string | null; pageName: string }> = {
    '/fire-calculator': { steps: fireCalculatorSteps, nextPage: '/asset-allocation', previousPage: null, pageName: 'Asset Allocation' },
    '/asset-allocation': { steps: assetAllocationSteps, nextPage: '/expense-tracker', previousPage: '/fire-calculator', pageName: 'Cashflow Tracker' },
    '/expense-tracker': { steps: expenseTrackerSteps, nextPage: '/net-worth-tracker', previousPage: '/asset-allocation', pageName: 'Net Worth Tracker' },
    '/net-worth-tracker': { steps: netWorthSteps, nextPage: '/monte-carlo', previousPage: '/expense-tracker', pageName: 'Monte Carlo' },
    '/monte-carlo': { steps: monteCarloSteps, nextPage: null, previousPage: '/net-worth-tracker', pageName: '' },
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // After overview tour, first ask about demo data
      setTourPhase('data-choice');
      setShowEndDialog(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Show end dialog to ask about demo data
    if (demoDataLoaded) {
      setTourPhase('data-choice');
      setShowEndDialog(true);
    } else {
      // If demo data wasn't loaded, just close the tour
      completeTour();
    }
  };

  const completeTour = (keepData = true) => {
    if (!keepData) {
      clearAllData();
      // Reset settings to defaults
      saveSettings(DEFAULT_SETTINGS);
    }
    saveTourCompleted(true);
    setIsVisible(false);
    setShowEndDialog(false);
    setTourPhase('overview');
    onTourComplete?.();
    
    // Reload the page to reflect data changes
    if (!keepData) {
      window.location.reload();
    }
  };

  // Handle keeping demo data and proceed to interactive tour prompt
  const handleKeepDataAndContinue = () => {
    setKeepDemoData(true);
    setTourPhase('interactive-prompt');
  };

  // Handle clearing data and proceed to interactive tour prompt
  const handleClearDataAndContinue = () => {
    setKeepDemoData(false);
    clearAllData();
    saveSettings(DEFAULT_SETTINGS);
    setTourPhase('interactive-prompt');
  };

  // Handle keeping current user data (when restarting tour)
  const handleKeepCurrentDataAndContinue = () => {
    setKeepDemoData(true);
    // Don't load demo data or clear anything - just proceed
    setTourPhase('interactive-prompt');
  };

  // Finish tour without interactive walkthrough
  const finishWithoutInteractive = () => {
    saveTourCompleted(true);
    setIsVisible(false);
    setShowEndDialog(false);
    onTourComplete?.();
    navigate('/');
    // Reload if data was cleared
    if (!keepDemoData) {
      window.location.reload();
    }
  };

  // Start the interactive tour
  const startInteractiveTour = () => {
    setShowEndDialog(false);
    setTourPhase('interactive');
    setCurrentPageTour('/fire-calculator');
    setInteractiveStep(0);
    setValidationError(null);
    navigate('/fire-calculator');
  };

  // Handle next step in interactive tour
  const handleInteractiveNext = () => {
    if (!currentPageTour) return;
    
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }
    
    const currentTour = pageTours[currentPageTour];
    if (!currentTour) return;

    const currentInteractiveStep = currentTour.steps[interactiveStep];
    const nextStepIndex = interactiveStep + 1;
    const nextStep = nextStepIndex < currentTour.steps.length ? currentTour.steps[nextStepIndex] : null;

    // If current step has closeDialogAfter, close the dialog first
    if (currentInteractiveStep?.closeDialogAfter && dialogOpen) {
      // Find and click the close button or overlay
      const closeButton = document.querySelector('.dialog-close, .dialog-overlay') as HTMLElement;
      if (closeButton) {
        if (closeButton.classList.contains('dialog-overlay')) {
          // Find the actual close button inside
          const actualClose = document.querySelector('.dialog-close') as HTMLElement;
          if (actualClose) actualClose.click();
        } else {
          closeButton.click();
        }
      }
      setDialogOpen(false);
    }

    // If next step has clickAction (needs to open a dialog), handle it
    if (nextStep?.clickAction) {
      // Move to next step first
      setInteractiveStep(nextStepIndex);
      setValidationError(null);
      
      // Small delay to allow UI to update, then click the button
      setTimeout(() => {
        const button = document.querySelector(nextStep.clickAction!) as HTMLElement;
        if (button) {
          button.click();
          setDialogOpen(true);
          
          // Wait for dialog to appear
          const waitForDialog = () => {
            const dialog = document.querySelector(nextStep.dialogSelector || '.dialog');
            if (dialog) {
              // Move to the first dialog step (which is the next step after this one)
              setTimeout(() => {
                setInteractiveStep(nextStepIndex + 1);
              }, 300);
            } else {
              // Keep waiting
              setTimeout(waitForDialog, 100);
            }
          };
          setTimeout(waitForDialog, 200);
        }
      }, 200);
      return;
    }

    if (nextStepIndex < currentTour.steps.length) {
      setInteractiveStep(nextStepIndex);
      setValidationError(null);
    } else {
      // Show prompt to continue to next page or finish
      // First close any open dialog
      if (dialogOpen) {
        const closeButton = document.querySelector('.dialog-close') as HTMLElement;
        if (closeButton) closeButton.click();
        setDialogOpen(false);
      }
      setShowContinuePrompt(true);
    }
  };

  // Handle previous step in interactive tour
  const handleInteractivePrev = () => {
    const currentTour = currentPageTour ? pageTours[currentPageTour] : null;
    const currentInteractiveStep = currentTour?.steps[interactiveStep];
    
    // If we're in a dialog, going back should stay in dialog or close it
    if (currentInteractiveStep?.isDialogStep) {
      // Check if previous step is also a dialog step
      const prevStep = interactiveStep > 0 ? currentTour?.steps[interactiveStep - 1] : null;
      if (prevStep?.isDialogStep) {
        // Stay in dialog, go to previous step
        setInteractiveStep(interactiveStep - 1);
        setValidationError(null);
        return;
      } else if (prevStep?.clickAction) {
        // Previous step is the one that opened the dialog, close dialog and go back
        const closeButton = document.querySelector('.dialog-close') as HTMLElement;
        if (closeButton) closeButton.click();
        setDialogOpen(false);
        setInteractiveStep(interactiveStep - 1);
        setValidationError(null);
        return;
      }
    }
    
    if (interactiveStep > 0) {
      setInteractiveStep(interactiveStep - 1);
      setValidationError(null);
    } else if (currentPageTour) {
      // At start of page - go to previous page's last step
      if (currentTour?.previousPage) {
        const prevPageTour = pageTours[currentTour.previousPage];
        if (prevPageTour) {
          // Close any open dialog first
          if (dialogOpen) {
            const closeButton = document.querySelector('.dialog-close') as HTMLElement;
            if (closeButton) closeButton.click();
            setDialogOpen(false);
          }
          setCurrentPageTour(currentTour.previousPage);
          setInteractiveStep(prevPageTour.steps.length - 1);
          setValidationError(null);
          navigate(currentTour.previousPage);
        }
      }
    }
  };

  // Continue to next page in interactive tour
  const continueToNextPage = () => {
    if (!currentPageTour) return;
    
    // Close any open dialog first
    if (dialogOpen) {
      const closeButton = document.querySelector('.dialog-close') as HTMLElement;
      if (closeButton) closeButton.click();
      setDialogOpen(false);
    }
    
    const currentTour = pageTours[currentPageTour];
    if (currentTour?.nextPage) {
      setCurrentPageTour(currentTour.nextPage);
      setInteractiveStep(0);
      setShowContinuePrompt(false);
      setValidationError(null);
      navigate(currentTour.nextPage);
    } else {
      finishInteractiveTour();
    }
  };

  // Finish the interactive tour
  const finishInteractiveTour = () => {
    // Close any open dialog first
    if (dialogOpen) {
      const closeButton = document.querySelector('.dialog-close') as HTMLElement;
      if (closeButton) closeButton.click();
      setDialogOpen(false);
    }
    
    // Clean up tour state
    setShowContinuePrompt(false);
    saveTourCompleted(true);
    setIsVisible(false);
    setShowEndDialog(false);
    setTourPhase('overview');
    setCurrentPageTour(null);
    
    // Remove tour-interactive-mode class to restore all inputs
    document.body.classList.remove('tour-interactive-mode');
    
    // Remove any highlight from elements
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
      setHighlightedElement(null);
    }
    
    onTourComplete?.();
    navigate('/');
  };

  // Skip interactive tour and go to end
  const skipInteractiveTour = () => {
    // Close any open dialog first
    if (dialogOpen) {
      const closeButton = document.querySelector('.dialog-close') as HTMLElement;
      if (closeButton) closeButton.click();
      setDialogOpen(false);
    }
    
    // Clean up tour state
    setShowContinuePrompt(false);
    saveTourCompleted(true);
    setIsVisible(false);
    setShowEndDialog(false);
    setTourPhase('overview');
    setCurrentPageTour(null);
    
    // Remove tour-interactive-mode class to restore all inputs
    document.body.classList.remove('tour-interactive-mode');
    
    // Remove any highlight from elements
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
      setHighlightedElement(null);
    }
    
    onTourComplete?.();
    
    // Force page refresh to ensure all inputs are clickable again
    window.location.href = '/';
  };

  if (!isVisible) return null;

  // Interactive tour - show continue prompt
  if (showContinuePrompt && currentPageTour) {
    const currentTour = pageTours[currentPageTour];
    const hasNextPage = currentTour?.nextPage;
    
    return (
      <div className="tour-overlay tour-overlay-transparent" role="dialog" aria-modal="true">
        <div className="tour-modal tour-continue-modal">
          <div className="tour-continue-header">
            <span className="tour-continue-icon">✨</span>
            <h2>Page Tour Complete!</h2>
          </div>
          <div className="tour-continue-content">
            {hasNextPage ? (
              <>
                <p>
                  You've explored this page. Would you like to continue with the <strong>{currentTour.pageName}</strong> tour?
                </p>
                <div className="tour-continue-actions">
                  <button 
                    className="tour-btn tour-btn-secondary"
                    onClick={finishInteractiveTour}
                  >
                    Finish Tour
                  </button>
                  <button 
                    className="tour-btn tour-btn-primary"
                    onClick={continueToNextPage}
                  >
                    Continue to {currentTour.pageName} →
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  You've completed the interactive tour of all pages!
                </p>
                <div className="tour-continue-actions">
                  <button 
                    className="tour-btn tour-btn-primary"
                    onClick={finishInteractiveTour}
                  >
                    Finish Tour
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Interactive tour - show step tooltip with dimmed background
  if (tourPhase === 'interactive' && currentPageTour) {
    const currentTour = pageTours[currentPageTour];
    const currentInteractiveStep = currentTour?.steps[interactiveStep];
    const hasInputValidation = !keepDemoData && currentInteractiveStep?.inputSelector;
    
    if (currentInteractiveStep) {
      return (
        <>
          {/* Dimmed background overlay */}
          <div className="tour-interactive-overlay" />
          
          {/* Tooltip */}
          <div className="tour-tooltip-container">
            <div className="tour-tooltip">
              <div className="tour-tooltip-header">
                <h3>{currentInteractiveStep.title}</h3>
                <button 
                  className="tour-tooltip-skip"
                  onClick={skipInteractiveTour}
                  aria-label="Skip interactive tour"
                >
                  Skip
                </button>
              </div>
              <p>{currentInteractiveStep.description}</p>
              {hasInputValidation && (
                <p className="tour-tooltip-hint">
                  <span className="tour-hint-icon">✏️</span>
                  Enter a value in the highlighted field to continue
                </p>
              )}
              {validationError && (
                <p className="tour-tooltip-error">
                  <span className="tour-error-icon">⚠️</span>
                  {validationError}
                </p>
              )}
              <div className="tour-tooltip-footer">
                <button
                  className="tour-btn tour-btn-secondary tour-btn-small"
                  onClick={handleInteractivePrev}
                  disabled={interactiveStep === 0 && !currentTour.previousPage}
                >
                  ← Back
                </button>
                <span className="tour-tooltip-count">
                  {interactiveStep + 1} / {currentTour.steps.length}
                </span>
                <button
                  className="tour-btn tour-btn-primary tour-btn-small"
                  onClick={handleInteractiveNext}
                >
                  {interactiveStep === currentTour.steps.length - 1 ? 'Done' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }
  }

  if (showEndDialog) {
    // Data choice phase - ask about keeping/clearing demo data first
    if (tourPhase === 'data-choice') {
      return (
        <div className="tour-overlay" role="dialog" aria-modal="true" aria-labelledby="tour-end-title">
          <div className="tour-modal tour-end-modal">
            <div className="tour-end-header">
              <span className="tour-end-icon">🎉</span>
              <h2 id="tour-end-title">Overview Complete!</h2>
            </div>
            <div className="tour-end-content">
              <p>
                Great! You've seen an overview of Fire Tools. {hadExistingData ? 'You have existing data in the app.' : 'We\'ve loaded demo data so you can explore.'}
              </p>
              <p className="tour-end-question">
                <strong>What would you like to do?</strong>
              </p>
            </div>
            <div className="tour-end-actions">
              <button 
                className="tour-btn tour-btn-secondary"
                onClick={handleClearDataAndContinue}
              >
                <span className="tour-btn-icon">🗑️</span>
                Start Fresh
                <span className="tour-btn-hint">Clear all data</span>
              </button>
              {hadExistingData ? (
                <button 
                  className="tour-btn tour-btn-primary"
                  onClick={handleKeepCurrentDataAndContinue}
                >
                  <span className="tour-btn-icon">📁</span>
                  Keep My Data
                  <span className="tour-btn-hint">Keep your current data</span>
                </button>
              ) : (
                <button 
                  className="tour-btn tour-btn-primary"
                  onClick={handleKeepDataAndContinue}
                >
                  <span className="tour-btn-icon">✨</span>
                  Keep Demo Data
                  <span className="tour-btn-hint">Explore with sample data</span>
                </button>
              )}
            </div>
            <p className="tour-end-note">
              <span className="tour-note-icon">💡</span>
              You can restart this tour anytime from Settings → Restart Tour
            </p>
          </div>
        </div>
      );
    }
    
    // Interactive tour prompt - ask if user wants guided walkthrough
    if (tourPhase === 'interactive-prompt') {
      return (
        <div className="tour-overlay" role="dialog" aria-modal="true" aria-labelledby="tour-prompt-title">
          <div className="tour-modal tour-end-modal">
            <div className="tour-end-header">
              <span className="tour-end-icon">🎯</span>
              <h2 id="tour-prompt-title">Interactive Walkthrough</h2>
            </div>
            <div className="tour-end-content">
              <p>
                Would you like a hands-on walkthrough of each page? We'll guide you through the key features and show you how everything works.
              </p>
              <p className="tour-end-question">
                <strong>Learn by doing!</strong> We'll walk you through each tool step by step.
              </p>
            </div>
            <div className="tour-end-actions">
              <button 
                className="tour-btn tour-btn-secondary"
                onClick={finishWithoutInteractive}
              >
                <span className="tour-btn-icon">✨</span>
                Explore on My Own
                <span className="tour-btn-hint">Skip walkthrough</span>
              </button>
              <button 
                className="tour-btn tour-btn-primary"
                onClick={startInteractiveTour}
              >
                <span className="tour-btn-icon">🎯</span>
                Yes, Guide Me!
                <span className="tour-btn-hint">Interactive walkthrough</span>
              </button>
            </div>
            <p className="tour-end-note">
              <span className="tour-note-icon">💡</span>
              You can restart this tour anytime from Settings → Restart Tour
            </p>
          </div>
        </div>
      );
    }
  }

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="tour-modal">
        <div className="tour-header">
          <div className="tour-step-indicator">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`tour-step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                aria-label={`Step ${index + 1} of ${tourSteps.length}`}
              />
            ))}
          </div>
          <button
            className="tour-skip-btn"
            onClick={handleSkip}
            aria-label="Skip tour"
          >
            Skip tour
          </button>
        </div>

        <div className="tour-body">
          <div className="tour-icon-large">{step.icon}</div>
          <h2 id="tour-title" className="tour-title">{step.title}</h2>
          {step.content}
        </div>

        <div className="tour-footer">
          <button
            className="tour-btn tour-btn-secondary"
            onClick={handlePrev}
            disabled={isFirstStep}
            aria-label="Previous step"
          >
            ← Back
          </button>
          <span className="tour-step-count">
            {currentStep + 1} / {tourSteps.length}
          </span>
          <button
            className="tour-btn tour-btn-primary"
            onClick={handleNext}
            aria-label={isLastStep ? 'Finish tour' : 'Next step'}
          >
            {isLastStep ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
