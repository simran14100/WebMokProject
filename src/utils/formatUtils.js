import dayjs from 'dayjs';

/**
 * Format a date string or Date object into a readable format
 * @param {string|Date} date - The date to format
 * @param {string} format - The format string (default: 'DD/MM/YYYY')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return 'N/A';
  return dayjs(date).isValid() ? dayjs(date).format(format) : 'Invalid Date';
};

/**
 * Format a number as currency (Indian Rupees by default)
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency symbol (default: '₹')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '₹', decimals = 2) => {
  if (amount === null || amount === undefined) return `${currency}0.00`;
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return `${currency}0.00`;
  
  // Format number with Indian numbering system (lakhs, crores)
  return `${currency}${numericAmount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

/**
 * Format a string to title case
 * @param {string} str - The string to format
 * @returns {string} Title-cased string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Truncate a string to a specified length and add ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated string with ellipsis if needed
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format a phone number for display
 * @param {string} phone - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  // Remove all non-digit characters
  const cleaned = ('' + phone).replace(/\D/g, '');
  // Check if the phone number is valid
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone; // Return original if format doesn't match
};

export default {
  formatDate,
  formatCurrency,
  toTitleCase,
  truncateText,
  formatPhoneNumber,
};
