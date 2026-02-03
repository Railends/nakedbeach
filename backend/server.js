const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();

// Import trading infrastructure
const tradingRoutes = require('./routes/trading');
const bot = require('./bot/steamBot');
const db = require('./db/database');

// Passport session setup
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Configure Passport with Steam Strategy
passport.use(new SteamStrategy({
    returnURL: 'http://localhost:5000/auth/steam/return',
    realm: 'http://localhost:5000/',
    apiKey: process.env.STEAM_API_KEY // User must provide this in .env
},
    (identifier, profile, done) => {
        // profile contains the Steam user data
        return done(null, profile);
    }
));

app.use(session({
    secret: 'rustycoin secret key',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json()); // Parse JSON bodies
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
    credentials: true
}));

// Initialize Steam bot
console.log('🤖 Initializing Steam bot...');
bot.login();

// Trading routes
app.use('/api', tradingRoutes);

// Routes
app.get('/auth/steam',
    passport.authenticate('steam'),
    (req, res) => {
        // The request will be redirected to Steam for authentication, so
        // this function will not be called.
    });

app.get('/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('http://localhost:5173');
    });

// Authenticated User Endpoint
app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ loggedIn: true, user: req.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Steam Inventory Proxy Endpoint
app.get('/api/inventory', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const steamId = req.user.steamid;
        const appId = 252490; // Rust
        const contextId = 2;

        // Fetch from public steam inventory API
        const response = await axios.get(`https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=english&count=5000`);

        if (response.data && response.data.assets && response.data.descriptions) {
            const assets = response.data.assets;
            const descriptions = response.data.descriptions;

            // Map assets to descriptions
            const inventory = assets.map(asset => {
                const desc = descriptions.find(d => d.classid === asset.classid && d.instanceid === asset.instanceid);
                if (!desc) return null;

                // Mock price logic (since inventory API doesn't give price)
                const seed = desc.market_hash_name.length + desc.market_hash_name.charCodeAt(0);
                const mockPrice = (seed % 100) + (seed % 10) * 0.5 + 5;

                return {
                    assetid: asset.assetid,
                    name: desc.name,
                    market_hash_name: desc.market_hash_name,
                    icon: `https://community.cloudflare.steamstatic.com/fx/economy/image/${desc.icon_url}`,
                    price: mockPrice,
                    tradable: desc.tradable
                };
            }).filter(item => item !== null && item.tradable);

            res.json(inventory);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Steam Inventory Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch inventory. Profile might be private.' });
    }
});

app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('http://localhost:5173');
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
