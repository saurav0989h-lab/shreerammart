/**
 * Currency conversion utilities
 * Exchange rates (approximate):
 * 1 USD = ~133 NPR
 * 1 INR = ~1.6 NPR
 */

const NPR_TO_USD_RATE = 133;
const NPR_TO_INR_RATE = 1.6; // 1 INR = 1.6 NPR, so 1 NPR = 1/1.6 INR

/**
 * Convert Nepali Rupees (NPR) to US Dollars (USD)
 * @param {number} amountNPR - Amount in Nepali Rupees
 * @returns {number} Amount in US Dollars
 */
export function convertToUSD(amountNPR) {
    if (typeof amountNPR !== 'number' || isNaN(amountNPR)) {
        return 0;
    }
    return amountNPR / NPR_TO_USD_RATE;
}

/**
 * Convert US Dollars (USD) to Nepali Rupees (NPR)
 * @param {number} amountUSD - Amount in US Dollars
 * @returns {number} Amount in Nepali Rupees
 */
export function convertToNPR(amountUSD) {
    if (typeof amountUSD !== 'number' || isNaN(amountUSD)) {
        return 0;
    }
    return amountUSD * NPR_TO_USD_RATE;
}

/**
 * Convert Nepali Rupees (NPR) to Indian Rupees (INR)
 * @param {number} amountNPR - Amount in Nepali Rupees
 * @returns {number} Amount in Indian Rupees
 */
export function convertToINR(amountNPR) {
    if (typeof amountNPR !== 'number' || isNaN(amountNPR)) {
        return 0;
    }
    return amountNPR / NPR_TO_INR_RATE;
}

/**
 * Convert Indian Rupees (INR) to Nepali Rupees (NPR)
 * @param {number} amountINR - Amount in Indian Rupees
 * @returns {number} Amount in Nepali Rupees
 */
export function convertINRToNPR(amountINR) {
    if (typeof amountINR !== 'number' || isNaN(amountINR)) {
        return 0;
    }
    return amountINR * NPR_TO_INR_RATE;
}

/**
 * Format currency amount with proper symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code ('NPR', 'USD', or 'INR')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'NPR') {
    if (typeof amount !== 'number' || isNaN(amount)) {
        if (currency === 'USD') return '$0.00';
        if (currency === 'INR') return '₹0.00';
        return 'Rs. 0';
    }

    if (currency === 'USD') {
        return `$${amount.toFixed(2)}`;
    }

    if (currency === 'INR') {
        return `₹${amount.toFixed(2)}`;
    }

    return `Rs. ${amount.toLocaleString()}`;
}

/**
 * Convert amount from NPR to specified currency
 * @param {number} amountNPR - Amount in Nepali Rupees
 * @param {string} targetCurrency - Target currency code ('USD' or 'INR')
 * @returns {number} Converted amount
 */
export function convertFromNPR(amountNPR, targetCurrency) {
    if (targetCurrency === 'USD') {
        return convertToUSD(amountNPR);
    }
    if (targetCurrency === 'INR') {
        return convertToINR(amountNPR);
    }
    return amountNPR;
}

/**
 * Format and convert NPR to target currency
 * @param {number} amountNPR - Amount in Nepali Rupees
 * @param {string} targetCurrency - Target currency code ('USD' or 'INR')
 * @returns {string} Formatted currency string
 */
export function formatConvertedPrice(amountNPR, targetCurrency) {
    const converted = convertFromNPR(amountNPR, targetCurrency);
    return formatCurrency(converted, targetCurrency);
}
