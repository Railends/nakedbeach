const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const TradeOfferManager = require('steam-tradeoffer-manager');
const SteamCommunity = require('steamcommunity');
const db = require('../db/database');

class SteamBot {
    constructor() {
        this.client = new SteamUser();
        this.community = new SteamCommunity();
        this.manager = new TradeOfferManager({
            steam: this.client,
            community: this.community,
            language: 'en'
        });

        this.isReady = false;
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Client logged in
        this.client.on('loggedOn', () => {
            console.log('✅ Steam Bot logged in successfully');
            this.client.setPersona(SteamUser.EPersonaState.Online);
            this.client.gamesPlayed([252490]); // Rust App ID
        });

        // Web session created
        this.client.on('webSession', (sessionid, cookies) => {
            console.log('✅ Web session created');
            this.manager.setCookies(cookies);
            this.community.setCookies(cookies);
            this.isReady = true;
        });

        // New trade offer received
        this.manager.on('newOffer', (offer) => {
            console.log(`📬 New trade offer #${offer.id} from ${offer.partner.getSteamID64()}`);
            this.handleIncomingOffer(offer);
        });

        // Trade offer state changed
        this.manager.on('sentOfferChanged', (offer, oldState) => {
            console.log(`📊 Offer #${offer.id} changed: ${TradeOfferManager.ETradeOfferState[oldState]} → ${TradeOfferManager.ETradeOfferState[offer.state]}`);
            this.handleOfferStateChange(offer, oldState);
        });

        // Errors
        this.client.on('error', (err) => {
            console.error('❌ Steam client error:', err);
        });

        this.manager.on('pollFailure', (err) => {
            console.error('❌ Poll failure:', err);
        });
    }

    login() {
        const logOnOptions = {
            accountName: process.env.BOT_USERNAME,
            password: process.env.BOT_PASSWORD
        };

        // Add 2FA code if shared secret is available
        if (process.env.BOT_SHARED_SECRET) {
            logOnOptions.twoFactorCode = SteamTotp.generateAuthCode(process.env.BOT_SHARED_SECRET);
        }

        console.log('🔐 Logging in to Steam...');
        this.client.logOn(logOnOptions);
    }

    async handleIncomingOffer(offer) {
        // This handles deposits from users
        try {
            // Check if this is a deposit we're expecting
            const deposit = db.getDepositByOfferId(offer.id);

            if (!deposit) {
                console.log(`⚠️ Unexpected offer #${offer.id}, declining`);
                offer.decline();
                return;
            }

            // Verify the offer matches what we expect
            const itemsToReceive = offer.itemsToReceive;
            const expectedItems = JSON.parse(deposit.items);

            if (itemsToReceive.length !== expectedItems.length) {
                console.log(`⚠️ Offer #${offer.id} item count mismatch`);
                offer.decline();
                db.updateDepositStatus(offer.id, 'rejected');
                return;
            }

            // Accept the offer
            offer.accept((err, status) => {
                if (err) {
                    console.error(`❌ Failed to accept offer #${offer.id}:`, err);
                    db.updateDepositStatus(offer.id, 'failed');
                    return;
                }

                console.log(`✅ Accepted deposit offer #${offer.id}`);

                // Confirm the trade if we have identity secret
                if (process.env.BOT_IDENTITY_SECRET && status === 'pending') {
                    this.community.acceptConfirmationForObject(
                        process.env.BOT_IDENTITY_SECRET,
                        offer.id,
                        (err) => {
                            if (err) {
                                console.error(`❌ Failed to confirm offer #${offer.id}:`, err);
                            } else {
                                console.log(`✅ Confirmed offer #${offer.id}`);
                            }
                        }
                    );
                }
            });
        } catch (error) {
            console.error('Error handling incoming offer:', error);
        }
    }

    handleOfferStateChange(offer, oldState) {
        const newState = offer.state;
        const offerId = offer.id;

        // Update database
        db.updateTradeOfferState(offerId, TradeOfferManager.ETradeOfferState[newState]);

        // If offer was accepted, update deposit/withdrawal status
        if (newState === TradeOfferManager.ETradeOfferState.Accepted) {
            // Check if it's a deposit
            const deposit = db.getDepositByOfferId(offerId);
            if (deposit) {
                db.updateDepositStatus(offerId, 'accepted', new Date().toISOString());

                // Add items to bot inventory
                offer.itemsToReceive.forEach(item => {
                    db.addToInventory({
                        assetid: item.assetid,
                        classid: item.classid,
                        instanceid: item.instanceid,
                        name: item.name || item.market_hash_name,
                        market_hash_name: item.market_hash_name,
                        icon_url: item.icon_url,
                        value: 0 // Will be updated by pricing service
                    }, deposit.id);
                });

                console.log(`✅ Deposit #${deposit.id} completed, ${offer.itemsToReceive.length} items added to inventory`);
            }

            // Check if it's a withdrawal
            const withdrawal = db.db.prepare('SELECT * FROM withdrawals WHERE trade_offer_id = ?').get(offerId);
            if (withdrawal) {
                db.updateWithdrawalStatus(offerId, 'accepted');

                // Remove items from bot inventory
                const items = JSON.parse(withdrawal.items);
                items.forEach(item => {
                    db.removeFromInventory(item.assetid);
                });

                console.log(`✅ Withdrawal completed for user ${withdrawal.user_steam_id}`);
            }
        }
    }

    async createDepositOffer(userSteamId, items) {
        if (!this.isReady) {
            throw new Error('Bot is not ready yet');
        }

        return new Promise((resolve, reject) => {
            const offer = this.manager.createOffer(userSteamId);

            // We want to receive these items
            offer.addTheirItems(items.map(item => ({
                appid: 252490,
                contextid: 2,
                assetid: item.assetid
            })));

            offer.setMessage('RustyCoin - Deposit your items to play!');

            offer.send((err, status) => {
                if (err) {
                    console.error('Failed to send deposit offer:', err);
                    reject(err);
                    return;
                }

                console.log(`✅ Deposit offer sent: #${offer.id} (${status})`);

                // Save to database
                db.saveTradeOffer(
                    offer.id,
                    userSteamId,
                    'deposit',
                    [],
                    items,
                    status
                );

                resolve({
                    offerId: offer.id,
                    tradeUrl: `https://steamcommunity.com/tradeoffer/${offer.id}`,
                    status: status
                });
            });
        });
    }

    async createWithdrawalOffer(userSteamId, tradeUrl, items) {
        if (!this.isReady) {
            throw new Error('Bot is not ready yet');
        }

        return new Promise((resolve, reject) => {
            const offer = this.manager.createOffer(tradeUrl);

            // Get items from bot inventory
            const botInventory = db.getAvailableInventory();
            const itemsToSend = [];

            items.forEach(requestedItem => {
                const botItem = botInventory.find(i => i.asset_id === requestedItem.assetid);
                if (botItem) {
                    itemsToSend.push({
                        appid: 252490,
                        contextid: 2,
                        assetid: botItem.asset_id
                    });
                }
            });

            if (itemsToSend.length === 0) {
                reject(new Error('No items available in bot inventory'));
                return;
            }

            offer.addMyItems(itemsToSend);
            offer.setMessage('🎉 Congratulations! Here are your winnings from RustyCoin!');

            offer.send((err, status) => {
                if (err) {
                    console.error('Failed to send withdrawal offer:', err);
                    reject(err);
                    return;
                }

                console.log(`✅ Withdrawal offer sent: #${offer.id} (${status})`);

                // Auto-confirm if we have identity secret
                if (process.env.BOT_IDENTITY_SECRET && status === 'pending') {
                    this.community.acceptConfirmationForObject(
                        process.env.BOT_IDENTITY_SECRET,
                        offer.id,
                        (err) => {
                            if (err) {
                                console.error(`❌ Failed to auto-confirm withdrawal #${offer.id}:`, err);
                            } else {
                                console.log(`✅ Auto-confirmed withdrawal #${offer.id}`);
                            }
                        }
                    );
                }

                // Save to database
                db.saveTradeOffer(
                    offer.id,
                    userSteamId,
                    'withdrawal',
                    itemsToSend,
                    [],
                    status
                );

                resolve({
                    offerId: offer.id,
                    status: status
                });
            });
        });
    }

    async getBotInventory() {
        return new Promise((resolve, reject) => {
            this.manager.getInventoryContents(252490, 2, true, (err, inventory) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(inventory);
            });
        });
    }
}

// Create singleton instance
const bot = new SteamBot();

module.exports = bot;
