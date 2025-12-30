/**
 * Calculate the appropriate interval for X-axis ticks based on data length
 * 
 * @param dataLength - Number of data points to display
 * @returns Either "preserveStartEnd" for small datasets or a number representing the interval
 * 
 * Interval logic:
 * - 0-20 data points: "preserveStartEnd" (show all ticks)
 * - 21-40 data points: 1 (show every 2nd tick, i.e., skip 1)
 * - 41+ data points: 3 (show every 4th tick, i.e., skip 3)
 */
export function calculateXAxisInterval(dataLength: number): 'preserveStartEnd' | number {
  if (dataLength <= 20) {
    return 'preserveStartEnd';
  } else if (dataLength <= 40) {
    return 1;
  } else {
    return 3;
  }
}
