const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/rustycoin.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_steam_id TEXT NOT NULL,
    trade_offer_id TEXT UNIQUE,
    items TEXT NOT NULL,
    total_value REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    FOREIGN KEY (user_steam_id) REFERENCES users(steam_id)
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_steam_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    game_type TEXT NOT NULL,
    trade_offer_id TEXT UNIQUE,
    items TEXT NOT NULL,
    total_value REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    accepted_at DATETIME,
    FOREIGN KEY (user_steam_id) REFERENCES users(steam_id)
  );

  CREATE TABLE IF NOT EXISTS bot_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id TEXT UNIQUE NOT NULL,
    class_id TEXT NOT NULL,
    instance_id TEXT NOT NULL,
    name TEXT NOT NULL,
    market_hash_name TEXT NOT NULL,
    icon_url TEXT,
    value REAL DEFAULT 0,
    tradable INTEGER DEFAULT 1,
    acquired_from_deposit_id INTEGER,
    status TEXT DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (acquired_from_deposit_id) REFERENCES deposits(id)
  );

  CREATE TABLE IF NOT EXISTS trade_offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    offer_id TEXT UNIQUE NOT NULL,
    partner_steam_id TEXT NOT NULL,
    type TEXT NOT NULL,
    items_to_give TEXT,
    items_to_receive TEXT,
    state TEXT NOT NULL,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    steam_id TEXT PRIMARY KEY,
    trade_url TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_steam_id);
  CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
  CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_steam_id);
  CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
  CREATE INDEX IF NOT EXISTS idx_bot_inventory_status ON bot_inventory(status);
  CREATE INDEX IF NOT EXISTS idx_trade_offers_state ON trade_offers(state);
`);

console.log('✅ Database schema created successfully');

// Helper functions
const db_helpers = {
    // Deposits
    createDeposit: (userId, tradeOfferId, items, totalValue) => {
        const stmt = db.prepare(`
      INSERT INTO deposits (user_steam_id, trade_offer_id, items, total_value)
      VALUES (?, ?, ?, ?)
    `);
        return stmt.run(userId, tradeOfferId, JSON.stringify(items), totalValue);
    },

    updateDepositStatus: (tradeOfferId, status, acceptedAt = null) => {
        const stmt = db.prepare(`
      UPDATE deposits 
      SET status = ?, accepted_at = ?
      WHERE trade_offer_id = ?
    `);
        return stmt.run(status, acceptedAt, tradeOfferId);
    },

    getDepositByOfferId: (tradeOfferId) => {
        const stmt = db.prepare('SELECT * FROM deposits WHERE trade_offer_id = ?');
        return stmt.get(tradeOfferId);
    },

    // Withdrawals
    createWithdrawal: (userId, gameId, gameType, items, totalValue) => {
        const stmt = db.prepare(`
      INSERT INTO withdrawals (user_steam_id, game_id, game_type, items, total_value)
      VALUES (?, ?, ?, ?, ?)
    `);
        return stmt.run(userId, gameId, gameType, JSON.stringify(items), totalValue);
    },

    updateWithdrawalOffer: (withdrawalId, tradeOfferId) => {
        const stmt = db.prepare(`
      UPDATE withdrawals 
      SET trade_offer_id = ?, sent_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        return stmt.run(tradeOfferId, withdrawalId);
    },

    updateWithdrawalStatus: (tradeOfferId, status) => {
        const stmt = db.prepare(`
      UPDATE withdrawals 
      SET status = ?, accepted_at = CURRENT_TIMESTAMP
      WHERE trade_offer_id = ?
    `);
        return stmt.run(status, tradeOfferId);
    },

    // Bot Inventory
    addToInventory: (item, depositId = null) => {
        const stmt = db.prepare(`
      INSERT INTO bot_inventory (asset_id, class_id, instance_id, name, market_hash_name, icon_url, value, acquired_from_deposit_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        return stmt.run(
            item.assetid,
            item.classid,
            item.instanceid,
            item.name,
            item.market_hash_name,
            item.icon_url,
            item.value || 0,
            depositId
        );
    },

    removeFromInventory: (assetId) => {
        const stmt = db.prepare('DELETE FROM bot_inventory WHERE asset_id = ?');
        return stmt.run(assetId);
    },

    getAvailableInventory: () => {
        const stmt = db.prepare('SELECT * FROM bot_inventory WHERE status = "available"');
        return stmt.all();
    },

    // Trade Offers
    saveTradeOffer: (offerId, partnerId, type, itemsToGive, itemsToReceive, state) => {
        const stmt = db.prepare(`
      INSERT INTO trade_offers (offer_id, partner_steam_id, type, items_to_give, items_to_receive, state)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        return stmt.run(
            offerId,
            partnerId,
            type,
            JSON.stringify(itemsToGive),
            JSON.stringify(itemsToReceive),
            state
        );
    },

    updateTradeOfferState: (offerId, state) => {
        const stmt = db.prepare(`
      UPDATE trade_offers 
      SET state = ?, updated_at = CURRENT_TIMESTAMP
      WHERE offer_id = ?
    `);
        return stmt.run(state, offerId);
    },

    // User Settings
    saveTradeUrl: (steamId, tradeUrl) => {
        const stmt = db.prepare(`
      INSERT INTO user_settings (steam_id, trade_url)
      VALUES (?, ?)
      ON CONFLICT(steam_id) DO UPDATE SET trade_url = ?, updated_at = CURRENT_TIMESTAMP
    `);
        return stmt.run(steamId, tradeUrl, tradeUrl);
    },

    getTradeUrl: (steamId) => {
        const stmt = db.prepare('SELECT trade_url FROM user_settings WHERE steam_id = ?');
        const result = stmt.get(steamId);
        return result ? result.trade_url : null;
    }
};

module.exports = { db, ...db_helpers };
