import { useState } from 'react';
import { Asset, PortfolioAllocation } from '../types/assetAllocation';
import { calculatePortfolioAllocation, prepareAssetClassChartData, prepareAssetChartData, exportToCSV, importFromCSV, formatAssetName } from '../utils/allocationCalculator';
import { DEFAULT_ASSETS } from '../utils/defaultAssets';
import { AssetClassTable } from './AssetClassTable';
import { AllocationChart } from './AllocationChart';
import { AddAssetDialog } from './AddAssetDialog';
import { CollapsibleAllocationTable } from './CollapsibleAllocationTable';

export const AssetAllocationPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);
  const [currency] = useState<string>('EUR');
  const [allocation, setAllocation] = useState<PortfolioAllocation>(() =>
    calculatePortfolioAllocation(DEFAULT_ASSETS)
  );
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const updateAllocation = (newAssets: Asset[]) => {
    setAssets(newAssets);
    const newAllocation = calculatePortfolioAllocation(newAssets);
    setAllocation(newAllocation);
  };

  const handleUpdateAsset = (assetId: string, updates: Partial<Asset>) => {
    const newAssets = assets.map(asset =>
      asset.id === assetId ? { ...asset, ...updates } : asset
    );
    updateAllocation(newAssets);
  };

  const handleAddAsset = (newAsset: Asset) => {
    updateAllocation([...assets, newAsset]);
  };

  const handleExport = () => {
    const csv = exportToCSV(allocation);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-allocation-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const importedAssets = importFromCSV(csv);
        updateAllocation(importedAssets);
      } catch (error) {
        alert(`Error importing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  const assetClassChartData = prepareAssetClassChartData(allocation.assetClasses);
  const selectedAssetClass = selectedClass 
    ? allocation.assetClasses.find(ac => ac.assetClass === selectedClass)
    : null;
  const assetChartData = selectedAssetClass
    ? prepareAssetChartData(selectedAssetClass.assets, selectedAssetClass.currentTotal)
    : [];

  return (
    <div className="asset-allocation-page">
      <div className="page-header">
        <h1>📊 Asset Allocation Manager</h1>
        <p>
          Manage and visualize your portfolio asset allocation. Set target allocations,
          track current positions, and see recommended actions to rebalance your portfolio.
        </p>
      </div>

      <div className="asset-allocation-manager">
        {!allocation.isValid && (
          <div className="validation-errors">
            <strong>⚠️ Validation Errors:</strong>
            <ul>
              {allocation.validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="manager-actions">
          <button onClick={() => setIsDialogOpen(true)} className="action-btn add-btn">
            ➕ Add Asset
          </button>
          <button onClick={handleExport} className="action-btn export-btn">
            📥 Export CSV
          </button>
          <label className="action-btn import-btn">
            📤 Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className="allocation-section">
          <h3>Asset Class Summary</h3>
          <AssetClassTable
            assetClasses={allocation.assetClasses}
            totalValue={allocation.totalValue}
            currency={currency}
          />
        </div>

        <div className="charts-row">
          <AllocationChart
            data={assetClassChartData}
            title="Portfolio Allocation by Asset Class"
            currency={currency}
          />
          
          {selectedAssetClass && (
            <AllocationChart
              data={assetChartData}
              title={`${selectedAssetClass.assetClass} Breakdown`}
              currency={currency}
            />
          )}
        </div>

        <div className="class-selector">
          <label>View Asset Class Details:</label>
          <select 
            value={selectedClass || ''} 
            onChange={(e) => setSelectedClass(e.target.value || null)}
            className="class-select"
          >
            <option value="">Select Asset Class</option>
            {allocation.assetClasses.map(ac => (
              <option key={ac.assetClass} value={ac.assetClass}>
                {formatAssetName(ac.assetClass)}
              </option>
            ))}
          </select>
        </div>

        <div className="allocation-section">
          <h3>Portfolio Details by Asset Class</h3>
          <CollapsibleAllocationTable
            assets={assets}
            deltas={allocation.deltas}
            currency={currency}
            onUpdateAsset={handleUpdateAsset}
          />
        </div>

        <div className="allocation-info">
          <h4>💡 How to Use</h4>
          <ul>
            <li><strong>Add Asset:</strong> Click the "Add Asset" button to add a new asset with type selection</li>
            <li><strong>Edit Asset:</strong> Click the edit (✎) button in any row to edit the current value and target %</li>
            <li><strong>Collapsible Tables:</strong> Click on an asset class header to expand/collapse and see individual assets</li>
            <li><strong>Target Mode:</strong> Choose "%" for percentage-based allocation, "SET" for fixed amounts, or "OFF" to exclude</li>
            <li><strong>Percentage targets</strong> for active assets should sum to 100%</li>
            <li><strong>Actions:</strong> 
              <span className="info-badge buy">BUY/SAVE</span> = Increase position | 
              <span className="info-badge sell">SELL/INVEST</span> = Decrease position | 
              <span className="info-badge hold">HOLD</span> = Within target range |
              <span className="info-badge excluded">EXCLUDED</span> = Not in allocation
            </li>
          </ul>
        </div>
      </div>

      <AddAssetDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAddAsset}
      />
    </div>
  );
};
