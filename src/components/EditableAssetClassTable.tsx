import { useState, useEffect, useRef } from 'react';
import { AssetClassSummary, AllocationMode, AssetClass } from '../types/assetAllocation';
import { formatCurrency, formatPercent, formatAssetName, AssetClassTargets } from '../utils/allocationCalculator';
import { MassEditDialog } from './MassEditDialog';

interface EditableAssetClassTableProps {
  assetClasses: AssetClassSummary[];
  assetClassTargets: AssetClassTargets;
  totalValue: number;
  currency: string;
  onUpdateAssetClass: (assetClass: AssetClass, updates: { targetMode?: AllocationMode; targetPercent?: number }) => void;
  onUpdateAssetClassTargets: (targets: AssetClassTargets) => void;
}

export const EditableAssetClassTable: React.FC<EditableAssetClassTableProps> = ({
  assetClasses,
  assetClassTargets,
  totalValue,
  currency,
  onUpdateAssetClass,
  onUpdateAssetClassTargets,
}) => {
  const [editingClass, setEditingClass] = useState<AssetClass | null>(null);
  const [editMode, setEditMode] = useState<AllocationMode>('PERCENTAGE');
  const [editPercent, setEditPercent] = useState<number>(0);
  const [isMassEditOpen, setIsMassEditOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Click outside to save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingClass && tableRef.current && !tableRef.current.contains(event.target as Node)) {
        console.log('[Asset Classes Table] Click outside detected, saving changes');
        saveEditing();
      }
    };

    if (editingClass) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingClass, editMode, editPercent]);

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'BUY':
      case 'SAVE':
        return 'var(--color-action-buy)';
      case 'SELL':
      case 'INVEST':
        return 'var(--color-action-sell)';
      case 'HOLD':
        return 'var(--color-action-hold)';
      case 'EXCLUDED':
        return 'var(--color-action-excluded)';
      default:
        return '#666';
    }
  };

  const startEditing = (ac: AssetClassSummary) => {
    // Use the asset class targets state for editing, not the derived values
    const target = assetClassTargets[ac.assetClass];
    console.log('[Asset Classes Table] Starting to edit:', ac.assetClass);
    console.log('[Asset Classes Table] Current target mode:', target?.targetMode);
    console.log('[Asset Classes Table] Current target percent:', target?.targetPercent);
    setEditingClass(ac.assetClass);
    setEditMode(target?.targetMode || 'PERCENTAGE');
    setEditPercent(target?.targetPercent || 0);
  };

  const saveEditing = () => {
    if (editingClass) {
      console.log('[Asset Classes Table] Saving changes for:', editingClass);
      console.log('[Asset Classes Table] New target mode:', editMode);
      console.log('[Asset Classes Table] New target percent:', editPercent);
      onUpdateAssetClass(editingClass, {
        targetMode: editMode,
        targetPercent: editMode === 'PERCENTAGE' ? editPercent : undefined,
      });
    }
    setEditingClass(null);
  };

  const cancelEditing = () => {
    console.log('[Asset Classes Table] Canceling edit for:', editingClass);
    setEditingClass(null);
  };

  return (
    <div className="asset-class-table-container" ref={tableRef}>
      <table className="asset-class-table">
        <thead>
          <tr>
            <th>Asset Class</th>
            <th>Target Mode</th>
            <th>% Target (class)</th>
            <th>% Current</th>
            <th>Absolute Current</th>
            <th>Absolute Target</th>
            <th>Delta</th>
            <th>Action</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {assetClasses.map(ac => {
            const isEditing = editingClass === ac.assetClass;
            // Get the target from assetClassTargets state (independent from assets)
            const target = assetClassTargets[ac.assetClass];
            const displayTargetMode = target?.targetMode || ac.targetMode;
            const displayTargetPercent = target?.targetPercent;
            
            return (
              <tr 
                key={ac.assetClass} 
                className={`${displayTargetMode === 'OFF' ? 'excluded-row' : ''} ${isEditing ? 'editing-row' : ''}`}
                onClick={() => !isEditing && startEditing(ac)}
              >
                <td>
                  <span className={`asset-class-badge ${ac.assetClass.toLowerCase()}`}>
                    {formatAssetName(ac.assetClass)}
                  </span>
                </td>
                <td>
                  {isEditing ? (
                    <select
                      value={editMode}
                      onChange={(e) => setEditMode(e.target.value as AllocationMode)}
                      onClick={(e) => e.stopPropagation()}
                      className="edit-select-small"
                    >
                      <option value="PERCENTAGE">%</option>
                      <option value="SET">SET</option>
                      <option value="OFF">OFF</option>
                    </select>
                  ) : (
                    displayTargetMode === 'SET' ? (
                      <span className="set-label">SET</span>
                    ) : displayTargetMode === 'OFF' ? (
                      <span className="off-label">OFF</span>
                    ) : (
                      <span>%</span>
                    )
                  )}
                </td>
                <td>
                  {isEditing && editMode === 'PERCENTAGE' ? (
                    <input
                      type="number"
                      value={editPercent}
                      onChange={(e) => setEditPercent(parseFloat(e.target.value) || 0)}
                      onClick={(e) => e.stopPropagation()}
                      className="edit-input"
                      min="0"
                      max="100"
                    />
                  ) : (
                    displayTargetMode === 'PERCENTAGE' && displayTargetPercent !== undefined
                      ? formatPercent(displayTargetPercent)
                      : displayTargetMode === 'SET'
                      ? 'SET'
                      : 'OFF'
                  )}
                </td>
                <td>{formatPercent(ac.currentPercent)}</td>
                <td className="currency-value">{formatCurrency(ac.currentTotal, currency)}</td>
                <td className="currency-value">
                  {ac.targetTotal !== undefined ? formatCurrency(ac.targetTotal, currency) : '-'}
                </td>
                <td className={`currency-value ${ac.delta > 0 ? 'positive' : ac.delta < 0 ? 'negative' : ''}`}>
                  {ac.delta > 0 ? '+' : ''}{formatCurrency(ac.delta, currency)}
                </td>
                <td>
                  <span 
                    className="action-badge"
                    style={{ backgroundColor: getActionColor(ac.action) }}
                  >
                    {ac.action}
                  </span>
                </td>
                <td>
                  {isEditing ? (
                    <div className="edit-actions">
                      <button onClick={saveEditing} className="btn-save" title="Save">✓</button>
                      <button onClick={cancelEditing} className="btn-cancel-edit" title="Cancel">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => startEditing(ac)} className="btn-edit" title="Edit">✎</button>
                  )}
                </td>
              </tr>
            );
          })}
          <tr className="total-row">
            <td><strong>Total Portfolio</strong></td>
            <td colSpan={3}></td>
            <td className="currency-value"><strong>{formatCurrency(totalValue, currency)}</strong></td>
            <td colSpan={4}></td>
          </tr>
        </tbody>
      </table>
      <div className="mass-edit-button-container">
        <button 
          onClick={() => setIsMassEditOpen(true)} 
          className="action-btn mass-edit-btn"
          title="Edit all percentages at once"
        >
          📝 Mass Edit Percentages
        </button>
      </div>
      <MassEditDialog
        isOpen={isMassEditOpen}
        onClose={() => setIsMassEditOpen(false)}
        mode="assetClass"
        assetClassTargets={assetClassTargets}
        onSaveAssetClassTargets={onUpdateAssetClassTargets}
      />
    </div>
  );
};
