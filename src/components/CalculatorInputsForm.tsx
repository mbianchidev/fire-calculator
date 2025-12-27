import { CalculatorInputs } from '../types/calculator';
import { NumberInput } from './NumberInput';

interface CalculatorInputsProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

export const CalculatorInputsForm: React.FC<CalculatorInputsProps> = ({ inputs, onChange }) => {
  const handleChange = (field: keyof CalculatorInputs, value: number | boolean) => {
    const newInputs = { ...inputs, [field]: value };
    
    // Auto-calculate savings rate when income or expenses change
    if (field === 'annualLaborIncome' || field === 'currentAnnualExpenses') {
      const income = field === 'annualLaborIncome' ? value as number : inputs.annualLaborIncome;
      const expenses = field === 'currentAnnualExpenses' ? value as number : inputs.currentAnnualExpenses;
      
      if (income > 0) {
        const calculatedSavingsRate = ((income - expenses) / income) * 100;
        // Allow negative savings rate to represent deficit, but cap at 100% max
        newInputs.savingsRate = Math.min(100, calculatedSavingsRate);
      } else {
        // If income is 0, set savings rate to 0
        newInputs.savingsRate = 0;
      }
    }
    
    onChange(newInputs);
  };

  return (
    <div className="inputs-form">
      <h2>FIRE Calculator Inputs</h2>
      
      <div className="form-section">
        <h3>💰 Initial Values</h3>
        <div className="form-group">
          <label htmlFor="initial-savings">Initial Savings / Portfolio Value (€)</label>
          <NumberInput
            id="initial-savings"
            value={inputs.initialSavings}
            onChange={(value) => handleChange('initialSavings', value)}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>📊 Asset Allocation</h3>
        <div className="form-group">
          <label htmlFor="stocks-percent">Stocks (%)</label>
          <NumberInput
            id="stocks-percent"
            value={inputs.stocksPercent}
            onChange={(value) => handleChange('stocksPercent', value)}
            min={0}
            max={100}
            aria-describedby="allocation-sum"
          />
        </div>
        <div className="form-group">
          <label htmlFor="bonds-percent">Bonds (%)</label>
          <NumberInput
            id="bonds-percent"
            value={inputs.bondsPercent}
            onChange={(value) => handleChange('bondsPercent', value)}
            min={0}
            max={100}
            aria-describedby="allocation-sum"
          />
        </div>
        <div className="form-group">
          <label htmlFor="cash-percent">Cash (%)</label>
          <NumberInput
            id="cash-percent"
            value={inputs.cashPercent}
            onChange={(value) => handleChange('cashPercent', value)}
            min={0}
            max={100}
            aria-describedby="allocation-sum"
          />
        </div>
        <div className="allocation-sum" id="allocation-sum" role="status" aria-live="polite">
          Total: {inputs.stocksPercent + inputs.bondsPercent + inputs.cashPercent}%
          {Math.abs((inputs.stocksPercent + inputs.bondsPercent + inputs.cashPercent) - 100) > 0.01 && 
            <span className="warning"> ⚠️ Should equal 100%</span>
          }
        </div>
      </div>

      <div className="form-section">
        <h3>💵 Income</h3>
        <div className="form-group">
          <label htmlFor="annual-labor-income">Annual Labor Income (Net) (€)</label>
          <NumberInput
            id="annual-labor-income"
            value={inputs.annualLaborIncome}
            onChange={(value) => handleChange('annualLaborIncome', value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="labor-income-growth-rate">Labor Income Growth Rate (%)</label>
          <NumberInput
            id="labor-income-growth-rate"
            value={inputs.laborIncomeGrowthRate}
            onChange={(value) => handleChange('laborIncomeGrowthRate', value)}
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="state-pension-income">State Pension Income (Annual) (€)</label>
          <NumberInput
            id="state-pension-income"
            value={inputs.statePensionIncome}
            onChange={(value) => handleChange('statePensionIncome', value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="private-pension-income">Private Pension Income (Annual) (€)</label>
          <NumberInput
            id="private-pension-income"
            value={inputs.privatePensionIncome}
            onChange={(value) => handleChange('privatePensionIncome', value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="other-income">Other Income (Annual) (€)</label>
          <NumberInput
            id="other-income"
            value={inputs.otherIncome}
            onChange={(value) => handleChange('otherIncome', value)}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>💸 Expenses & Savings</h3>
        <div className="form-group">
          <label htmlFor="current-annual-expenses">Current Annual Expenses (€)</label>
          <NumberInput
            id="current-annual-expenses"
            value={inputs.currentAnnualExpenses}
            onChange={(value) => handleChange('currentAnnualExpenses', value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="fire-annual-expenses">FIRE Annual Expenses (€)</label>
          <NumberInput
            id="fire-annual-expenses"
            value={inputs.fireAnnualExpenses}
            onChange={(value) => handleChange('fireAnnualExpenses', value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="savings-rate">Savings Rate (%) <span className="calculated-label">- Auto-calculated</span></label>
          <input
            id="savings-rate"
            type="number"
            value={(inputs.savingsRate ?? 0).toFixed(2)}
            readOnly
            className="calculated-field"
            aria-readonly="true"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>🎯 FIRE Target</h3>
        <div className="form-group">
          <label htmlFor="desired-withdrawal-rate">Desired Withdrawal Rate (%)</label>
          <NumberInput
            id="desired-withdrawal-rate"
            value={inputs.desiredWithdrawalRate}
            onChange={(value) => handleChange('desiredWithdrawalRate', value)}
            step="0.1"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>📈 Expected Returns</h3>
        <div className="form-group">
          <label htmlFor="expected-stock-return">Expected Stock Return (%)</label>
          <NumberInput
            id="expected-stock-return"
            value={inputs.expectedStockReturn}
            onChange={(value) => handleChange('expectedStockReturn', value)}
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="expected-bond-return">Expected Bond Return (%)</label>
          <NumberInput
            id="expected-bond-return"
            value={inputs.expectedBondReturn}
            onChange={(value) => handleChange('expectedBondReturn', value)}
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="expected-cash-return">Cash / Inflation Rate (%)</label>
          <NumberInput
            id="expected-cash-return"
            value={inputs.expectedCashReturn}
            onChange={(value) => handleChange('expectedCashReturn', value)}
            step="0.1"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>👤 Personal Information</h3>
        <div className="form-group">
          <label htmlFor="year-of-birth">Year of Birth</label>
          <NumberInput
            id="year-of-birth"
            value={inputs.yearOfBirth}
            onChange={(value) => handleChange('yearOfBirth', value)}
            allowDecimals={false}
          />
        </div>
        <div className="form-group">
          <label htmlFor="retirement-age">Retirement Age for State Pension</label>
          <NumberInput
            id="retirement-age"
            value={inputs.retirementAge}
            onChange={(value) => handleChange('retirementAge', value)}
            allowDecimals={false}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>⚙️ Options</h3>
        <div className="form-group checkbox-group">
          <label htmlFor="stop-working-at-fire">
            <input
              id="stop-working-at-fire"
              type="checkbox"
              checked={inputs.stopWorkingAtFIRE}
              onChange={(e) => handleChange('stopWorkingAtFIRE', e.target.checked)}
            />
            Stop working when reaching FIRE number
          </label>
        </div>
      </div>
    </div>
  );
};
