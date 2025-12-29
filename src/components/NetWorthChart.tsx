import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { YearProjection } from '../types/calculator';
import { formatCurrency } from '../utils/allocationCalculator';

interface NetWorthChartProps {
  projections: YearProjection[];
  fireTarget: number;
  currentAge: number;
}

type ZoomLevel = 'all' | '10' | '20' | '30';

export const NetWorthChart: React.FC<NetWorthChartProps> = ({ projections, fireTarget, currentAge }) => {
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
      'Net Worth': p.portfolioValue,
      'FIRE Target': fireTarget,
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
        <h3>Net Worth Growth</h3>
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
        <LineChart data={data}>
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
          <Line type="monotone" dataKey="Net Worth" stroke="#4CAF50" strokeWidth={2} />
          <Line type="monotone" dataKey="FIRE Target" stroke="#ff9800" strokeWidth={2} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
