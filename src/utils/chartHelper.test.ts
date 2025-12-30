import { describe, it, expect } from 'vitest';
import { calculateXAxisInterval } from './chartHelper';

describe('Chart Helper - calculateXAxisInterval', () => {
  describe('Small datasets (20 years or less)', () => {
    it('should return "preserveStartEnd" for datasets with 20 or fewer data points', () => {
      // ARRANGE
      const dataLength = 20;
      
      // ACT
      const result = calculateXAxisInterval(dataLength);
      
      // ASSERT
      expect(result).toBe('preserveStartEnd');
    });

    it('should return "preserveStartEnd" for datasets with 15 data points', () => {
      // ARRANGE
      const dataLength = 15;
      
      // ACT
      const result = calculateXAxisInterval(dataLength);
      
      // ASSERT
      expect(result).toBe('preserveStartEnd');
    });

    it('should return "preserveStartEnd" for datasets with 1 data point', () => {
      // ARRANGE
      const dataLength = 1;
      
      // ACT
      const result = calculateXAxisInterval(dataLength);
      
      // ASSERT
      expect(result).toBe('preserveStartEnd');
    });
  });

  describe('Medium datasets (21-40 years)', () => {
    it('should return 1 (show every 2nd tick) for datasets with 30 data points', () => {
      // ARRANGE
      const dataLength = 30;
      
      // ACT
      const result = calculateXAxisInterval(dataLength);
      
      // ASSERT
      expect(result).toBe(1);
    });

    it('should return 1 (show every 2nd tick) for datasets with 40 data points', () => {
      // ARRANGE
      const dataLength = 40;
      
      // ACT
      const result = calculateXAxisInterval(dataLength);
      
      // ASSERT
      expect(result).toBe(1);
    });

    it('should return 1 (show every 2nd tick) for datasets with 21 data points', () => {
      // ARRANGE
      const dataLength = 21;
      
      // ACT
      const result = calculateXAxisInterval(dataLength);
      
      // ASSERT
      expect(result).toBe(1);
    });
  });

  describe('Large datasets (more than 40 years)', () => {
    it('should return 3 (show every 4th tick) for datasets with 60 data points', () => {
      // ARRANGE
      const dataLength = 60;
      
      // ACT
      const result = calculateXAxisInterval(dataLength);
      
      // ASSERT
      expect(result).toBe(3);
    });

    it('should return 3 (show every 4th tick) for datasets with 41 data points', () => {
      // ARRANGE
      const dataLength = 41;
      
      // ACT
      const result = calculateXAxisInterval(dataLength);
      
      // ASSERT
      expect(result).toBe(3);
    });

    it('should return 3 (show every 4th tick) for datasets with 100 data points', () => {
      // ARRANGE
      const dataLength = 100;
      
      // ACT
      const result = calculateXAxisInterval(dataLength);
      
      // ASSERT
      expect(result).toBe(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle 0 data points gracefully', () => {
      // ARRANGE
      const dataLength = 0;
      
      // ACT
      const result = calculateXAxisInterval(dataLength);
      
      // ASSERT
      expect(result).toBe('preserveStartEnd');
    });
  });
});
