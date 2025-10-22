/**
 * Formatting Utilities
 */
const Formatters = {
    /**
     * Format currency
     */
    currency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Format percentage
     */
    percentage(value, decimals = 2) {
        return `${(value * 100).toFixed(decimals)}%`;
    },

    /**
     * Truncate text
     */
    truncate(text, length = 100) {
        if (text.length <= length) return text;
        return text.substr(0, length) + '...';
    },

    /**
     * Format address
     */
    address(address, start = 6, end = 4) {
        if (!address) return '';
        return `${address.slice(0, start)}...${address.slice(-end)}`;
    }
};