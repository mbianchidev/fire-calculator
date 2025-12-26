import { describe, it, expect } from 'vitest';
import {
  redistributeAssetClassPercentages,
  redistributeAssetPercentagesInClass,
  distributeDeltaToAssets,
  handleAssetRemoval,
  AssetClassTargets,
} from './allocationCalculator';
import { Asset } from '../types/assetAllocation';

describe('Asset Class Table Logic', () => {
  describe('redistributeAssetClassPercentages', () => {
    it('should redistribute percentages when editing Stocks from 60% to 30% (Example 1)', () => {
      const currentTargets: AssetClassTargets = {
        STOCKS: { targetMode: 'PERCENTAGE', targetPercent: 60 },
        BONDS: { targetMode: 'PERCENTAGE', targetPercent: 40 },
        CASH: { targetMode: 'SET' },
        CRYPTO: { targetMode: 'PERCENTAGE', targetPercent: 0 },
        REAL_ESTATE: { targetMode: 'PERCENTAGE', targetPercent: 0 },
      };

      const result = redistributeAssetClassPercentages(currentTargets, 'STOCKS', 30);

      expect(result.STOCKS.targetPercent).toBe(30);
      // Bonds was 40% out of 40% total (100%), so it gets all of the remaining 70%
      expect(result.BONDS.targetPercent).toBe(70);
      // Cash remains SET
      expect(result.CASH.targetMode).toBe('SET');
      // Crypto and Real Estate remain at 0% (they had 0% so get 0% of remaining)
      expect(result.CRYPTO.targetPercent).toBe(0);
      expect(result.REAL_ESTATE.targetPercent).toBe(0);
    });

    it('should redistribute percentages when editing Cash to 10% (Example 2)', () => {
      const currentTargets: AssetClassTargets = {
        STOCKS: { targetMode: 'PERCENTAGE', targetPercent: 60 },
        BONDS: { targetMode: 'PERCENTAGE', targetPercent: 35 },
        CASH: { targetMode: 'PERCENTAGE', targetPercent: 5 },
        CRYPTO: { targetMode: 'PERCENTAGE', targetPercent: 0 },
        REAL_ESTATE: { targetMode: 'PERCENTAGE', targetPercent: 0 },
      };

      const result = redistributeAssetClassPercentages(currentTargets, 'CASH', 10);

      expect(result.CASH.targetPercent).toBe(10);
      // Remaining is 90%, original other total was 95% (60+35), so:
      // Stocks: 60/95 * 90 ≈ 56.84%
      // Bonds: 35/95 * 90 ≈ 33.16%
      expect(result.STOCKS.targetPercent).toBeCloseTo(56.84, 1);
      expect(result.BONDS.targetPercent).toBeCloseTo(33.16, 1);
    });

    it('should distribute equally when all other classes have 0%', () => {
      const currentTargets: AssetClassTargets = {
        STOCKS: { targetMode: 'PERCENTAGE', targetPercent: 100 },
        BONDS: { targetMode: 'PERCENTAGE', targetPercent: 0 },
        CASH: { targetMode: 'PERCENTAGE', targetPercent: 0 },
        CRYPTO: { targetMode: 'PERCENTAGE', targetPercent: 0 },
        REAL_ESTATE: { targetMode: 'PERCENTAGE', targetPercent: 0 },
      };

      const result = redistributeAssetClassPercentages(currentTargets, 'STOCKS', 50);

      expect(result.STOCKS.targetPercent).toBe(50);
      // Remaining 50% distributed equally among 4 other classes
      expect(result.BONDS.targetPercent).toBe(12.5);
      expect(result.CASH.targetPercent).toBe(12.5);
      expect(result.CRYPTO.targetPercent).toBe(12.5);
      expect(result.REAL_ESTATE.targetPercent).toBe(12.5);
    });

    it('should not affect SET mode classes during redistribution', () => {
      const currentTargets: AssetClassTargets = {
        STOCKS: { targetMode: 'PERCENTAGE', targetPercent: 60 },
        BONDS: { targetMode: 'PERCENTAGE', targetPercent: 40 },
        CASH: { targetMode: 'SET' },
        CRYPTO: { targetMode: 'OFF' },
        REAL_ESTATE: { targetMode: 'PERCENTAGE', targetPercent: 0 },
      };

      const result = redistributeAssetClassPercentages(currentTargets, 'STOCKS', 50);

      expect(result.STOCKS.targetPercent).toBe(50);
      expect(result.BONDS.targetPercent).toBe(50); // Gets all of remaining since Real Estate is 0%
      expect(result.CASH.targetMode).toBe('SET');
      expect(result.CRYPTO.targetMode).toBe('OFF');
    });
  });
});

describe('Asset-Specific Table Logic', () => {
  describe('redistributeAssetPercentagesInClass', () => {
    it('should redistribute percentages within class when editing VBR to 25% (Example 1)', () => {
      const assets: Asset[] = [
        { id: 'spy', name: 'SPY', ticker: 'SPY', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 12000, targetMode: 'PERCENTAGE', targetPercent: 24 },
        { id: 'vti', name: 'VTI', ticker: 'VTI', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 8000, targetMode: 'PERCENTAGE', targetPercent: 16 },
        { id: 'vxus', name: 'VXUS', ticker: 'VXUS', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 5000, targetMode: 'PERCENTAGE', targetPercent: 10 },
        { id: 'vwo', name: 'VWO', ticker: 'VWO', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 3000, targetMode: 'PERCENTAGE', targetPercent: 6 },
        { id: 'vbr', name: 'VBR', ticker: 'VBR', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 2000, targetMode: 'PERCENTAGE', targetPercent: 4 },
      ];

      // Total was 60%, VBR was 4%, now VBR is 25%
      // Remaining is 60% - 25% = 35% for others (was 56%)
      const result = redistributeAssetPercentagesInClass(assets, 'vbr', 25);

      expect(result.find(a => a.id === 'vbr')?.targetPercent).toBe(25);
      
      // Other assets should be proportionally reduced
      // SPY was 24/56, VTI was 16/56, VXUS was 10/56, VWO was 6/56
      // SPY: 24/56 * 35 = 15
      // VTI: 16/56 * 35 = 10
      // VXUS: 10/56 * 35 = 6.25
      // VWO: 6/56 * 35 = 3.75
      expect(result.find(a => a.id === 'spy')?.targetPercent).toBeCloseTo(15, 1);
      expect(result.find(a => a.id === 'vti')?.targetPercent).toBeCloseTo(10, 1);
      expect(result.find(a => a.id === 'vxus')?.targetPercent).toBeCloseTo(6.25, 1);
      expect(result.find(a => a.id === 'vwo')?.targetPercent).toBeCloseTo(3.75, 1);
    });

    it('should handle redistribution when only one other asset exists', () => {
      const assets: Asset[] = [
        { id: 'bnd', name: 'BND', ticker: 'BND', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 10000, targetMode: 'PERCENTAGE', targetPercent: 50 },
        { id: 'tip', name: 'TIP', ticker: 'TIP', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 10000, targetMode: 'PERCENTAGE', targetPercent: 50 },
      ];

      const result = redistributeAssetPercentagesInClass(assets, 'bnd', 70);

      expect(result.find(a => a.id === 'bnd')?.targetPercent).toBe(70);
      expect(result.find(a => a.id === 'tip')?.targetPercent).toBe(30);
    });
  });

  describe('distributeDeltaToAssets', () => {
    it('should distribute positive delta +30000 EUR according to percentages (Example 1)', () => {
      const assets: Asset[] = [
        { id: 'spy', name: 'SPY', ticker: 'SPY', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 12000, targetMode: 'PERCENTAGE', targetPercent: 40 },
        { id: 'vti', name: 'VTI', ticker: 'VTI', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 8000, targetMode: 'PERCENTAGE', targetPercent: 27 },
        { id: 'vxus', name: 'VXUS', ticker: 'VXUS', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 5000, targetMode: 'PERCENTAGE', targetPercent: 17 },
        { id: 'vwo', name: 'VWO', ticker: 'VWO', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 3000, targetMode: 'PERCENTAGE', targetPercent: 10 },
        { id: 'vbr', name: 'VBR', ticker: 'VBR', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 2000, targetMode: 'PERCENTAGE', targetPercent: 6 },
      ];

      const deltaMap = distributeDeltaToAssets(assets, 'STOCKS', 30000);

      // Total percentage is 100%, so deltas are:
      // SPY: 40% of 30000 = 12000
      // VTI: 27% of 30000 = 8100
      // VXUS: 17% of 30000 = 5100
      // VWO: 10% of 30000 = 3000
      // VBR: 6% of 30000 = 1800
      expect(deltaMap.get('spy')).toBeCloseTo(12000, 2);
      expect(deltaMap.get('vti')).toBeCloseTo(8100, 2);
      expect(deltaMap.get('vxus')).toBeCloseTo(5100, 2);
      expect(deltaMap.get('vwo')).toBeCloseTo(3000, 2);
      expect(deltaMap.get('vbr')).toBeCloseTo(1800, 2);
    });

    it('should distribute negative delta -30000 EUR according to percentages (Example 2)', () => {
      const assets: Asset[] = [
        { id: 'bnd', name: 'BND', ticker: 'BND', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 10000, targetMode: 'PERCENTAGE', targetPercent: 50 },
        { id: 'tip', name: 'TIP', ticker: 'TIP', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 6000, targetMode: 'PERCENTAGE', targetPercent: 30 },
        { id: 'bndx', name: 'BNDX', ticker: 'BNDX', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 4000, targetMode: 'PERCENTAGE', targetPercent: 20 },
      ];

      const deltaMap = distributeDeltaToAssets(assets, 'BONDS', -30000);

      // Total percentage is 100%, so deltas are:
      // BND: 50% of -30000 = -15000
      // TIP: 30% of -30000 = -9000
      // BNDX: 20% of -30000 = -6000
      expect(deltaMap.get('bnd')).toBe(-15000);
      expect(deltaMap.get('tip')).toBe(-9000);
      expect(deltaMap.get('bndx')).toBe(-6000);
    });

    it('should distribute equally when all percentages are 0', () => {
      const assets: Asset[] = [
        { id: 'asset1', name: 'Asset 1', ticker: 'A1', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 1000, targetMode: 'PERCENTAGE', targetPercent: 0 },
        { id: 'asset2', name: 'Asset 2', ticker: 'A2', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 1000, targetMode: 'PERCENTAGE', targetPercent: 0 },
      ];

      const deltaMap = distributeDeltaToAssets(assets, 'STOCKS', 10000);

      expect(deltaMap.get('asset1')).toBe(5000);
      expect(deltaMap.get('asset2')).toBe(5000);
    });

    it('should not include SET or OFF mode assets in delta distribution', () => {
      const assets: Asset[] = [
        { id: 'stock1', name: 'Stock 1', ticker: 'S1', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 5000, targetMode: 'PERCENTAGE', targetPercent: 50 },
        { id: 'stock2', name: 'Stock 2', ticker: 'S2', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 5000, targetMode: 'SET', targetValue: 5000 },
        { id: 'stock3', name: 'Stock 3', ticker: 'S3', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 5000, targetMode: 'OFF' },
      ];

      const deltaMap = distributeDeltaToAssets(assets, 'STOCKS', 10000);

      expect(deltaMap.get('stock1')).toBe(10000); // Gets all since it's the only PERCENTAGE asset
      expect(deltaMap.has('stock2')).toBe(false);
      expect(deltaMap.has('stock3')).toBe(false);
    });
  });

  describe('handleAssetRemoval', () => {
    it('should redistribute removed asset percentage to remaining assets (Example 2 - BNDX removal)', () => {
      // After removing BNDX (which had 20%), remaining assets should absorb it proportionally
      const assetsAfterRemoval: Asset[] = [
        { id: 'bnd', name: 'BND', ticker: 'BND', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 10000, targetMode: 'PERCENTAGE', targetPercent: 50 },
        { id: 'tip', name: 'TIP', ticker: 'TIP', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 6000, targetMode: 'PERCENTAGE', targetPercent: 30 },
      ];

      const removedAsset: Asset = {
        id: 'bndx', name: 'BNDX', ticker: 'BNDX', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 4000, targetMode: 'PERCENTAGE', targetPercent: 20,
      };

      const result = handleAssetRemoval(assetsAfterRemoval, removedAsset);

      // BND was 50/80 = 62.5%, TIP was 30/80 = 37.5%
      // BND gets: 50 + (50/80 * 20) = 50 + 12.5 = 62.5
      // TIP gets: 30 + (30/80 * 20) = 30 + 7.5 = 37.5
      // Together = 100%
      expect(result.find(a => a.id === 'bnd')?.targetPercent).toBeCloseTo(62.5, 1);
      expect(result.find(a => a.id === 'tip')?.targetPercent).toBeCloseTo(37.5, 1);
    });

    it('should distribute equally when remaining assets have 0% each', () => {
      const assetsAfterRemoval: Asset[] = [
        { id: 'asset1', name: 'Asset 1', ticker: 'A1', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 1000, targetMode: 'PERCENTAGE', targetPercent: 0 },
        { id: 'asset2', name: 'Asset 2', ticker: 'A2', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 1000, targetMode: 'PERCENTAGE', targetPercent: 0 },
      ];

      const removedAsset: Asset = {
        id: 'removed', name: 'Removed', ticker: 'R', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 1000, targetMode: 'PERCENTAGE', targetPercent: 60,
      };

      const result = handleAssetRemoval(assetsAfterRemoval, removedAsset);

      // Each should get 30% (60% / 2)
      expect(result.find(a => a.id === 'asset1')?.targetPercent).toBe(30);
      expect(result.find(a => a.id === 'asset2')?.targetPercent).toBe(30);
    });

    it('should not change percentages when removing SET mode asset', () => {
      const assetsAfterRemoval: Asset[] = [
        { id: 'bnd', name: 'BND', ticker: 'BND', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 10000, targetMode: 'PERCENTAGE', targetPercent: 50 },
        { id: 'tip', name: 'TIP', ticker: 'TIP', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 6000, targetMode: 'PERCENTAGE', targetPercent: 50 },
      ];

      const removedAsset: Asset = {
        id: 'cash', name: 'Cash', ticker: 'CASH', assetClass: 'BONDS', subAssetType: 'CHECKING_ACCOUNT', currentValue: 4000, targetMode: 'SET', targetValue: 4000,
      };

      const result = handleAssetRemoval(assetsAfterRemoval, removedAsset);

      expect(result.find(a => a.id === 'bnd')?.targetPercent).toBe(50);
      expect(result.find(a => a.id === 'tip')?.targetPercent).toBe(50);
    });

    it('should handle removal of asset with 0% target', () => {
      const assetsAfterRemoval: Asset[] = [
        { id: 'bnd', name: 'BND', ticker: 'BND', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 10000, targetMode: 'PERCENTAGE', targetPercent: 50 },
        { id: 'tip', name: 'TIP', ticker: 'TIP', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 6000, targetMode: 'PERCENTAGE', targetPercent: 50 },
      ];

      const removedAsset: Asset = {
        id: 'bndx', name: 'BNDX', ticker: 'BNDX', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 0, targetMode: 'PERCENTAGE', targetPercent: 0,
      };

      const result = handleAssetRemoval(assetsAfterRemoval, removedAsset);

      // No change since removed asset had 0%
      expect(result.find(a => a.id === 'bnd')?.targetPercent).toBe(50);
      expect(result.find(a => a.id === 'tip')?.targetPercent).toBe(50);
    });

    it('should only affect assets in the same class', () => {
      const assetsAfterRemoval: Asset[] = [
        { id: 'spy', name: 'SPY', ticker: 'SPY', assetClass: 'STOCKS', subAssetType: 'ETF', currentValue: 10000, targetMode: 'PERCENTAGE', targetPercent: 40 },
        { id: 'bnd', name: 'BND', ticker: 'BND', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 10000, targetMode: 'PERCENTAGE', targetPercent: 50 },
        { id: 'tip', name: 'TIP', ticker: 'TIP', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 6000, targetMode: 'PERCENTAGE', targetPercent: 30 },
      ];

      const removedAsset: Asset = {
        id: 'bndx', name: 'BNDX', ticker: 'BNDX', assetClass: 'BONDS', subAssetType: 'ETF', currentValue: 4000, targetMode: 'PERCENTAGE', targetPercent: 20,
      };

      const result = handleAssetRemoval(assetsAfterRemoval, removedAsset);

      // SPY (STOCKS) should not be affected
      expect(result.find(a => a.id === 'spy')?.targetPercent).toBe(40);
      
      // BND and TIP should absorb the 20%
      // BND: 50 + (50/80 * 20) = 62.5
      // TIP: 30 + (30/80 * 20) = 37.5
      expect(result.find(a => a.id === 'bnd')?.targetPercent).toBeCloseTo(62.5, 1);
      expect(result.find(a => a.id === 'tip')?.targetPercent).toBeCloseTo(37.5, 1);
    });
  });
});
