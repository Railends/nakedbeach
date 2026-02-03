const express = require('express');
const router = express.Router();
const bot = require('../bot/steamBot');
const db = require('../db/database');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

// Public bot status endpoint (no auth required)
router.get('/bot/status', (req, res) => {
    try {
        const isLoggedIn = bot.client && bot.client.steamID;
        res.json({
            online: isLoggedIn,
            steamId: isLoggedIn ? bot.client.steamID.getSteamID64() : null,
            status: isLoggedIn ? 'Bot is online and ready' : 'Bot is offline'
        });
    } catch (error) {
        res.json({
            online: false,
            status: 'Bot status unknown',
            error: error.message
        });
    }
});

// Save user's trade URL
router.post('/trade-url', requireAuth, (req, res) => {
    try {
        const { tradeUrl } = req.body;
        const steamId = req.user.steamid;

        if (!tradeUrl || !tradeUrl.includes('steamcommunity.com/tradeoffer')) {
            return res.status(400).json({ error: 'Invalid trade URL' });
        }

        db.saveTradeUrl(steamId, tradeUrl);
        res.json({ success: true, message: 'Trade URL saved' });
    } catch (error) {
        console.error('Error saving trade URL:', error);
        res.status(500).json({ error: 'Failed to save trade URL' });
    }
});

// Get user's trade URL
router.get('/trade-url', requireAuth, (req, res) => {
    try {
        const steamId = req.user.steamid;
        const tradeUrl = db.getTradeUrl(steamId);
        res.json({ tradeUrl });
    } catch (error) {
        console.error('Error getting trade URL:', error);
        res.status(500).json({ error: 'Failed to get trade URL' });
    }
});

// Initiate deposit
router.post('/deposit/initiate', requireAuth, async (req, res) => {
    try {
        const { items } = req.body;
        const steamId = req.user.steamid;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }

        // Calculate total value
        const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0);

        // Create trade offer
        const result = await bot.createDepositOffer(steamId, items);

        // Save to database
        db.createDeposit(steamId, result.offerId, items, totalValue);

        res.json({
            success: true,
            offerId: result.offerId,
            tradeUrl: result.tradeUrl,
            message: 'Trade offer created. Please accept it in Steam.'
        });
    } catch (error) {
        console.error('Error creating deposit:', error);
        res.status(500).json({ error: 'Failed to create deposit offer' });
    }
});

// Check deposit status
router.get('/deposit/status/:offerId', requireAuth, (req, res) => {
    try {
        const { offerId } = req.params;
        const deposit = db.getDepositByOfferId(offerId);

        if (!deposit) {
            return res.status(404).json({ error: 'Deposit not found' });
        }

        res.json({
            status: deposit.status,
            items: JSON.parse(deposit.items),
            totalValue: deposit.total_value,
            createdAt: deposit.created_at,
            acceptedAt: deposit.accepted_at
        });
    } catch (error) {
        console.error('Error checking deposit status:', error);
        res.status(500).json({ error: 'Failed to check deposit status' });
    }
});

// Initiate withdrawal (called when user wins)
router.post('/withdraw/send', requireAuth, async (req, res) => {
    try {
        const { gameId, gameType, items } = req.body;
        const steamId = req.user.steamid;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items to withdraw' });
        }

        // Get user's trade URL
        const tradeUrl = db.getTradeUrl(steamId);
        if (!tradeUrl) {
            return res.status(400).json({ error: 'Trade URL not set. Please set it in your profile.' });
        }

        // Calculate total value
        const totalValue = items.reduce((sum, item) => sum + (item.value || 0), 0);

        // Create withdrawal record
        const withdrawal = db.createWithdrawal(steamId, gameId, gameType, items, totalValue);

        // Create trade offer
        const result = await bot.createWithdrawalOffer(steamId, tradeUrl, items);

        // Update withdrawal with trade offer ID
        db.updateWithdrawalOffer(withdrawal.lastInsertRowid, result.offerId);

        res.json({
            success: true,
            offerId: result.offerId,
            message: 'Withdrawal offer sent! Check your Steam for the trade.'
        });
    } catch (error) {
        console.error('Error creating withdrawal:', error);
        res.status(500).json({ error: error.message || 'Failed to create withdrawal offer' });
    }
});

// Get bot inventory (for admin/debugging)
router.get('/bot/inventory', requireAuth, async (req, res) => {
    try {
        // Only allow for admins (you can add admin check here)
        const inventory = await bot.getBotInventory();
        res.json({ inventory });
    } catch (error) {
        console.error('Error getting bot inventory:', error);
        res.status(500).json({ error: 'Failed to get bot inventory' });
    }
});

// Get user's deposit history
router.get('/deposits/history', requireAuth, (req, res) => {
    try {
        const steamId = req.user.steamid;
        const stmt = db.db.prepare('SELECT * FROM deposits WHERE user_steam_id = ? ORDER BY created_at DESC LIMIT 20');
        const deposits = stmt.all(steamId);

        res.json({
            deposits: deposits.map(d => ({
                ...d,
                items: JSON.parse(d.items)
            }))
        });
    } catch (error) {
        console.error('Error getting deposit history:', error);
        res.status(500).json({ error: 'Failed to get deposit history' });
    }
});

// Get user's withdrawal history
router.get('/withdrawals/history', requireAuth, (req, res) => {
    try {
        const steamId = req.user.steamid;
        const stmt = db.db.prepare('SELECT * FROM withdrawals WHERE user_steam_id = ? ORDER BY created_at DESC LIMIT 20');
        const withdrawals = stmt.all(steamId);

        res.json({
            withdrawals: withdrawals.map(w => ({
                ...w,
                items: JSON.parse(w.items)
            }))
        });
    } catch (error) {
        console.error('Error getting withdrawal history:', error);
        res.status(500).json({ error: 'Failed to get withdrawal history' });
    }
});

// ===== PRICING ENDPOINTS =====
const pricing = require('../services/pricing');

// Get price for a single item
router.get('/price/:marketHashName', async (req, res) => {
    try {
        const { marketHashName } = req.params;
        const price = await pricing.getItemPrice(decodeURIComponent(marketHashName));

        res.json({
            item: marketHashName,
            price,
            currency: 'USD'
        });
    } catch (error) {
        console.error('Error fetching price:', error);
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

// Get prices for multiple items
router.post('/prices/bulk', async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Items array required' });
        }

        const prices = await pricing.getMultipleItemPrices(items);

        res.json({
            prices,
            currency: 'USD',
            cached: pricing.getCacheStats()
        });
    } catch (error) {
        console.error('Error fetching bulk prices:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

// Get cache statistics (admin only)
router.get('/prices/cache/stats', (req, res) => {
    const stats = pricing.getCacheStats();
    res.json(stats);
});

// Clear price cache (admin only)
router.post('/prices/cache/clear', (req, res) => {
    pricing.clearCache();
    res.json({ success: true, message: 'Price cache cleared' });
});

module.exports = router;
