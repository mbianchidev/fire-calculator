import { useState, useEffect } from 'react';
import { Asset, AssetClass, AllocationMode } from '../types/assetAllocation';

interface MassEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Record<string, number>) => void;
  assets: Asset[];
  assetClass: AssetClass | null;
  title: string;
  mode: 'assetClass' | 'asset'; // 'assetClass' for Asset Classes table, 'asset' for asset-specific table
  // For asset class mode
  assetClassTargets?: Record<AssetClass, { targetMode: AllocationMode; targetPercent?: number }>;
}

export const MassEditDialog: React.FC<MassEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  assets,
  assetClass,
  title,
  mode,
  assetClassTargets,
}) => {
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [error, setError] = useState<string>('');

  // Initialize values when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'assetClass' && assetClassTargets) {
        // Initialize with current asset class targets
        const initialValues: Record<string, number> = {};
        Object.entries(assetClassTargets).forEach(([cls, target]) => {
          if (target.targetMode === 'PERCENTAGE') {
            initialValues[cls] = target.targetPercent || 0;
          }
        });
        setEditValues(initialValues);
      } else if (mode === 'asset' && assetClass) {
        // Initialize with current asset percentages
        const classAssets = assets.filter(a => 
          a.assetClass === assetClass && 
          a.targetMode === 'PERCENTAGE'
        );
        const initialValues: Record<string, number> = {};
        classAssets.forEach(asset => {
          initialValues[asset.id] = asset.targetPercent || 0;
        });
        setEditValues(initialValues);
      }
      setError('');
    }
  }, [isOpen, mode, assetClass, assets, assetClassTargets]);

  if (!isOpen) return null;

  const total = Object.values(editValues).reduce((sum, val) => sum + (val || 0), 0);
  const isValid = Math.abs(total - 100) < 0.01;

  const handleValueChange = (id: string, value: number) => {
    setEditValues(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = () => {
    if (!isValid) {
      setError(`Total must equal 100%. Current total: ${total.toFixed(2)}%`);
      return;
    }
    onSave(editValues);
    onClose();
  };

  const renderAssetClassMode = () => {
    if (!assetClassTargets) return null;

    const percentageClasses = Object.entries(assetClassTargets)
      .filter(([_, target]) => target.targetMode === 'PERCENTAGE');

    return (
      <div className="mass-edit-list">
        {percentageClasses.map(([cls]) => (
          <div key={cls} className="mass-edit-row">
            <span className={`asset-class-badge ${cls.toLowerCase()}`}>
              {cls.replace('_', ' ')}
            </span>
            <div className="mass-edit-input-group">
              <label htmlFor={`mass-edit-${cls}`} className="visually-hidden">
                {cls.replace('_', ' ')} percentage
              </label>
              <input
                id={`mass-edit-${cls}`}
                type="text"
                value={editValues[cls] ?? 0}
                onChange={(e) => handleValueChange(cls, parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                className="mass-edit-input"
                aria-label={`${cls.replace('_', ' ')} percentage`}
              />
              <span className="percent-sign">%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAssetMode = () => {
    if (!assetClass) return null;

    const classAssets = assets.filter(a => 
      a.assetClass === assetClass && 
      a.targetMode === 'PERCENTAGE'
    );

    return (
      <div className="mass-edit-list">
        {classAssets.map(asset => (
          <div key={asset.id} className="mass-edit-row">
            <span className="asset-name">{asset.name} ({asset.ticker})</span>
            <div className="mass-edit-input-group">
              <label htmlFor={`mass-edit-${asset.id}`} className="visually-hidden">
                {asset.name} percentage
              </label>
              <input
                id={`mass-edit-${asset.id}`}
                type="text"
                value={editValues[asset.id] ?? 0}
                onChange={(e) => handleValueChange(asset.id, parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                className="mass-edit-input"
                aria-label={`${asset.name} percentage`}
              />
              <span className="percent-sign">%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dialog-overlay" onClick={onClose} role="presentation">
      <div className="dialog-content mass-edit-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="mass-edit-dialog-title">
        <div className="dialog-header">
          <h3 id="mass-edit-dialog-title">{title}</h3>
          <button className="dialog-close" onClick={onClose} aria-label="Close dialog">×</button>
        </div>

        <div className="mass-edit-body">
          <p className="mass-edit-instructions">
            Edit all percentages at once. Total must equal 100% to save.
          </p>

          {mode === 'assetClass' ? renderAssetClassMode() : renderAssetMode()}

          <div className={`mass-edit-total ${isValid ? 'valid' : 'invalid'}`} role="status" aria-live="polite" aria-label="Total percentage validation">
            <span>Total:</span>
            <span className="total-value">{total.toFixed(2)}%</span>
            {isValid ? (
              <span className="valid-icon" aria-label="Valid">✓</span>
            ) : (
              <span className="invalid-icon" aria-label="Invalid">✗</span>
            )}
          </div>

          {error && <div className="mass-edit-error" role="alert" aria-live="assertive">{error}</div>}
        </div>

        <div className="dialog-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="btn-submit" 
            onClick={handleSubmit}
            disabled={!isValid}
            aria-disabled={!isValid}
          >
            Save All
          </button>
        </div>
      </div>
    </div>
  );
};
