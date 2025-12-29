import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { YearProjection } from '../types/calculator';
import { formatCurrency } from '../utils/allocationCalculator';

interface IncomeExpensesChartProps {
  projections: YearProjection[];
  currentAge: number;
}

type ZoomLevel = 'all' | '10' | '20' | '30';

export const IncomeExpensesChart: React.FC<IncomeExpensesChartProps> = ({ projections, currentAge }) => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('all');

  // Filter data based on zoom level
  const getFilteredData = () => {
    let filtered = projections;
    
    if (zoomLevel !== 'all') {
      const years = parseInt(zoomLevel);
      filtered = projections.filter(p => p.age <= currentAge + years);
    }
    
    return filtered.map(p => ({
      year: p.year,
      age: p.age,
      'Labor Income': p.laborIncome,
      'Investment Yield': p.investmentYield,
      'Expenses': p.expenses,
    }));
  };

  const data = getFilteredData();

  // Format large numbers for Y axis (e.g., 1M, 5M, 10M)
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>Income vs Expenses</h3>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setZoomLevel('10')}
            className={`zoom-button ${zoomLevel === '10' ? 'active' : ''}`}
            style={{
              padding: '5px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: zoomLevel === '10' ? '#4CAF50' : 'white',
              color: zoomLevel === '10' ? 'white' : 'black',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            10 Years
          </button>
          <button
            onClick={() => setZoomLevel('20')}
            className={`zoom-button ${zoomLevel === '20' ? 'active' : ''}`}
            style={{
              padding: '5px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: zoomLevel === '20' ? '#4CAF50' : 'white',
              color: zoomLevel === '20' ? 'white' : 'black',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            20 Years
          </button>
          <button
            onClick={() => setZoomLevel('30')}
            className={`zoom-button ${zoomLevel === '30' ? 'active' : ''}`}
            style={{
              padding: '5px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: zoomLevel === '30' ? '#4CAF50' : 'white',
              color: zoomLevel === '30' ? 'white' : 'black',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            30 Years
          </button>
          <button
            onClick={() => setZoomLevel('all')}
            className={`zoom-button ${zoomLevel === 'all' ? 'active' : ''}`}
            style={{
              padding: '5px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: zoomLevel === 'all' ? '#4CAF50' : 'white',
              color: zoomLevel === 'all' ? 'white' : 'black',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            All Years
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
          <YAxis 
            tickFormatter={formatYAxis}
            domain={[0, 'auto']}
            allowDataOverflow={false}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(Number(value))} 
            labelFormatter={(label) => `Age ${label}`}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar dataKey="Labor Income" fill="#4CAF50" />
          <Bar dataKey="Investment Yield" fill="#2196F3" />
          <Bar dataKey="Expenses" fill="#f44336" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
