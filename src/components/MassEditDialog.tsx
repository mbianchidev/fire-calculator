import { useState, useEffect } from 'react';
import { Asset, AssetClass } from '../types/assetAllocation';
import { AssetClassTargets } from '../utils/allocationCalculator';

interface MassEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'assetClass' | 'asset';
  // For asset class mode
  assetClassTargets?: AssetClassTargets;
  onSaveAssetClassTargets?: (targets: AssetClassTargets) => void;
  // For asset mode  
  assets?: Asset[];
  assetClass?: AssetClass;
  onSaveAssets?: (assets: Asset[]) => void;
}

export const MassEditDialog: React.FC<MassEditDialogProps> = ({
  isOpen,
  onClose,
  mode,
  assetClassTargets,
  onSaveAssetClassTargets,
  assets,
  assetClass,
  onSaveAssets,
}) => {
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    if (mode === 'assetClass' && assetClassTargets) {
      const values: Record<string, number> = {};
      (Object.keys(assetClassTargets) as AssetClass[]).forEach(cls => {
        if (assetClassTargets[cls].targetMode === 'PERCENTAGE') {
          values[cls] = assetClassTargets[cls].targetPercent || 0;
        }
      });
      setEditValues(values);
    } else if (mode === 'asset' && assets && assetClass) {
      const values: Record<string, number> = {};
      assets
        .filter(a => a.assetClass === assetClass && a.targetMode === 'PERCENTAGE')
        .forEach(a => {
          values[a.id] = a.targetPercent || 0;
        });
      setEditValues(values);
    }
  }, [isOpen, mode, assetClassTargets, assets, assetClass]);

// Tolerance for floating point comparison when checking if percentages sum to 100%
const PERCENTAGE_TOLERANCE = 0.01;

  useEffect(() => {
    const sum = Object.values(editValues).reduce((acc, val) => acc + val, 0);
    setTotal(sum);
    
    if (Math.abs(sum - 100) > PERCENTAGE_TOLERANCE) {
      setError(`Total must be 100%. Current: ${sum.toFixed(2)}%`);
    } else {
      setError(null);
    }
  }, [editValues]);

  const handleChange = (key: string, value: string) => {
    // Handle empty string or invalid input explicitly
    const parsed = parseFloat(value);
    const numValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setEditValues(prev => ({
      ...prev,
      [key]: numValue,
    }));
  };

  const handleSave = () => {
    if (error) return;
    
    if (mode === 'assetClass' && assetClassTargets && onSaveAssetClassTargets) {
      const newTargets = { ...assetClassTargets };
      (Object.keys(editValues) as AssetClass[]).forEach(cls => {
        if (newTargets[cls]) {
          newTargets[cls] = {
            ...newTargets[cls],
            targetPercent: editValues[cls],
          };
        }
      });
      onSaveAssetClassTargets(newTargets);
    } else if (mode === 'asset' && assets && onSaveAssets) {
      const newAssets = assets.map(a => {
        if (editValues[a.id] !== undefined) {
          return { ...a, targetPercent: editValues[a.id] };
        }
        return a;
      });
      onSaveAssets(newAssets);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  const items = mode === 'assetClass' && assetClassTargets
    ? (Object.keys(assetClassTargets) as AssetClass[])
        .filter(cls => assetClassTargets[cls].targetMode === 'PERCENTAGE')
        .map(cls => ({ id: cls, name: cls.charAt(0) + cls.slice(1).toLowerCase().replace('_', ' ') }))
    : assets
        ?.filter(a => a.assetClass === assetClass && a.targetMode === 'PERCENTAGE')
        .map(a => ({ id: a.id, name: a.name })) || [];

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content mass-edit-dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>📝 Mass Edit Percentages</h3>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        
        <div className="mass-edit-info">
          <p>Edit all percentages below. Total must equal 100% to save.</p>
          <p className={`total-display ${Math.abs(total - 100) < 0.01 ? 'valid' : 'invalid'}`}>
            Total: {total.toFixed(2)}%
          </p>
        </div>
        
        <div className="mass-edit-form">
          {items.map(item => (
            <div key={item.id} className="mass-edit-row">
              <label>{item.name}</label>
              <div className="mass-edit-input-group">
                <input
                  type="number"
                  value={editValues[item.id] || 0}
                  onChange={e => handleChange(item.id, e.target.value)}
                  className="mass-edit-input"
                  min="0"
                  max="100"
                />
                <span className="percent-suffix">%</span>
              </div>
            </div>
          ))}
        </div>
        
        {error && <div className="mass-edit-error">{error}</div>}
        
        <div className="dialog-actions">
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button 
            onClick={handleSave} 
            className="btn-submit"
            disabled={!!error}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
