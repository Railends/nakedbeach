const axios = require('axios');

/**
 * Rust Item Pricing Service
 * Uses Steam Market API for real-time pricing
 * Includes caching to avoid rate limits
 */

class PricingService {
    constructor() {
        // Cache prices for 10 minutes
        this.priceCache = new Map();
        this.CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
        this.RUST_APP_ID = 252490; // Rust's Steam App ID
    }

    /**
     * Get price for a single item
     * @param {string} marketHashName - Steam market hash name (e.g., "AK47 | Redline (Field-Tested)")
     * @returns {Promise<number>} Price in USD
     */
    async getItemPrice(marketHashName) {
        // Check cache first
        const cached = this.priceCache.get(marketHashName);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            console.log(`💰 Using cached price for ${marketHashName}: $${cached.price}`);
            return cached.price;
        }

        try {
            // Fetch from Steam Market API
            const url = `https://steamcommunity.com/market/priceoverview/?appid=${this.RUST_APP_ID}&currency=1&market_hash_name=${encodeURIComponent(marketHashName)}`;

            const response = await axios.get(url, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.data && response.data.lowest_price) {
                // Parse price (format: "$1.23")
                const priceStr = response.data.lowest_price.replace('$', '').replace(',', '');
                const price = parseFloat(priceStr);

                // Cache the price
                this.priceCache.set(marketHashName, {
                    price,
                    timestamp: Date.now()
                });

                console.log(`💰 Fetched price for ${marketHashName}: $${price}`);
                return price;
            }

            // Fallback if no price available
            console.warn(`⚠️ No price found for ${marketHashName}, using $0.00`);
            return 0.00;

        } catch (error) {
            console.error(`❌ Error fetching price for ${marketHashName}:`, error.message);

            // Return cached price even if expired, or 0
            if (cached) {
                console.log(`⚠️ Using expired cache for ${marketHashName}`);
                return cached.price;
            }

            return 0.00;
        }
    }

    /**
     * Get prices for multiple items
     * @param {Array<string>} marketHashNames - Array of market hash names
     * @returns {Promise<Object>} Object mapping hash names to prices
     */
    async getMultipleItemPrices(marketHashNames) {
        const prices = {};

        // Process items with delay to avoid rate limiting
        for (const name of marketHashNames) {
            prices[name] = await this.getItemPrice(name);

            // Add small delay between requests (Steam rate limits)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return prices;
    }

    /**
     * Get price for an item from inventory data
     * @param {Object} item - Inventory item object
     * @returns {Promise<number>} Price in USD
     */
    async getPriceForInventoryItem(item) {
        // Use market_hash_name if available, otherwise construct it
        const marketHashName = item.market_hash_name || item.name;
        return await this.getItemPrice(marketHashName);
    }

    /**
     * Clear price cache (useful for testing or manual refresh)
     */
    clearCache() {
        this.priceCache.clear();
        console.log('🗑️ Price cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;

        for (const [name, data] of this.priceCache.entries()) {
            if (now - data.timestamp < this.CACHE_DURATION) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        }

        return {
            totalEntries: this.priceCache.size,
            validEntries,
            expiredEntries,
            cacheDuration: this.CACHE_DURATION / 1000 / 60 + ' minutes'
        };
    }
}

// Export singleton instance
module.exports = new PricingService();
