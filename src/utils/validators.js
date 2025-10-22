/**
 * Validation Utilities
 */
const Validators = {
    /**
     * Validate email
     */
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate username
     */
    username(username) {
        const { minLength, maxLength, pattern } = AppConfig.validation.username;
        if (username.length < minLength || username.length > maxLength) {
            return false;
        }
        return pattern.test(username);
    },

    /**
     * Validate wallet address
     */
    walletAddress(address) {
        return AppConfig.validation.address.pattern.test(address);
    },

    /**
     * Validate keyword
     */
    keyword(keyword) {
        const { minLength, maxLength } = AppConfig.validation.keyword;
        return keyword.length >= minLength && keyword.length <= maxLength;
    }
};