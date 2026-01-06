/**
 * Currency conversion utilities
 * Exchange rate: 1 USD = ~133 NPR (approximate rate)
 */

const NPR_TO_USD_RATE = 133;

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
 * Format currency amount with proper symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code ('NPR' or 'USD')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'NPR') {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return currency === 'USD' ? '$0.00' : 'Rs. 0';
    }

    if (currency === 'USD') {
        return `$${amount.toFixed(2)}`;
    }

    return `Rs. ${amount.toLocaleString()}`;
}
