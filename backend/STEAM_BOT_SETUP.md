# Steam Trading System Setup Guide

## Prerequisites
1. A dedicated Steam account for the bot
2. Steam Guard Mobile Authenticator enabled
3. Steam API key
4. Trade URL enabled on bot account

## Step 1: Create Bot Steam Account

1. Create a new Steam account at https://store.steampowered.com/join/
2. **Important**: Use a unique email and strong password
3. Add at least $5 to the account (required for full features)
4. Enable Steam Guard Mobile Authenticator

## Step 2: Get Steam API Key

1. Log into your bot account
2. Visit https://steamcommunity.com/dev/apikey
3. Register a new key with domain: `localhost` (for development)
4. Copy the API key

## Step 3: Get 2FA Secrets

You need the `shared_secret` and `identity_secret` from Steam Guard.

### Option A: Using Steam Desktop Authenticator (Recommended)
1. Download Steam Desktop Authenticator: https://github.com/Jessecar96/SteamDesktopAuthenticator
2. Add your bot account
3. Open the `.maFile` for your account (in `maFiles/` folder)
4. Copy `shared_secret` and `identity_secret` values

### Option B: Using WinAuth
1. Download WinAuth: https://github.com/winauth/winauth
2. Add Steam authenticator for your bot account
3. Right-click → Show SteamGuard and Revocation Code
4. Copy the secrets

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values:
   ```env
   STEAM_API_KEY=ABC123...
   BOT_USERNAME=your_bot_username
   BOT_PASSWORD=your_bot_password
   BOT_SHARED_SECRET=xyz789...
   BOT_IDENTITY_SECRET=abc456...
   BOT_STEAM_ID=76561198012345678
   ```

## Step 5: Test the Bot

1. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```

2. Look for these messages:
   ```
   🔐 Logging in to Steam...
   ✅ Steam Bot logged in successfully
   ✅ Web session created
   ```

3. If you see errors, check:
   - Username/password are correct
   - 2FA secrets are valid
   - Steam Guard is enabled
   - Account is not limited

## Step 6: Enable Trading

1. Log into bot account on Steam website
2. Go to Settings → Privacy Settings
3. Set "Inventory" to Public
4. Set "Trade URL" to Public
5. Get your trade URL from: https://steamcommunity.com/id/me/tradeoffers/privacy

## Security Checklist

- [ ] Bot account has unique strong password
- [ ] 2FA is enabled
- [ ] `.env` file is in `.gitignore`
- [ ] API key is kept secret
- [ ] Bot account email is secure
- [ ] Trade confirmations are enabled

## Troubleshooting

### "Invalid Password"
- Check username/password in `.env`
- Make sure no extra spaces

### "SteamGuardMachine"
- Your `shared_secret` is incorrect
- Regenerate 2FA and get new secrets

### "RateLimitExceeded"
- Steam is rate limiting you
- Wait 30 minutes and try again

### "Trade Hold"
- Bot account needs Mobile Authenticator for 7+ days
- Or both parties need it for 15+ days

## Testing Deposits

1. Log in to frontend with your personal Steam account
2. Click "Deposit Items"
3. Select items
4. Bot should automatically accept the trade
5. Check database: `SELECT * FROM deposits;`

## Next Steps

Once the bot is working:
1. Test full deposit flow
2. Test withdrawal flow
3. Add item pricing integration
4. Set up monitoring/alerts
5. Consider using a VPS for 24/7 operation
