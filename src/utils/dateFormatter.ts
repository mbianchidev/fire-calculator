/**
 * Date formatting utilities
 * Handles date formatting according to user preferences
 */

import { DateFormat } from './cookieSettings';

/**
 * Format a date according to the specified format
 * @param date - Date to format (Date object or ISO string)
 * @param format - Date format to use (default: 'DD/MM/YYYY')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: DateFormat = 'DD/MM/YYYY'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
    default:
      return `${day}/${month}/${year}`;
  }
}
