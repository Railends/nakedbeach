# RustyCoin VPS Deployment Guide

## Step 1: Create a VPS

### Option A: Hetzner (Recommended - Cheapest)
**Cost:** €4.51/month (~$5)

1. Go to https://www.hetzner.com/cloud
2. Click "Sign Up" (top right)
3. Create account with email
4. Verify email
5. Click "New Project" → Name it "RustyCoin"
6. Click "Add Server"
7. **Location:** Choose closest to your users (Nuremberg, Helsinki, or Ashburn)
8. **Image:** Ubuntu 22.04
9. **Type:** CPX11 (2 vCPU, 2GB RAM, €4.51/month)
10. **SSH Key:** 
    - Click "Add SSH Key"
    - On Windows: Open PowerShell and run:
      ```powershell
      ssh-keygen -t rsa -b 4096
      # Press Enter 3 times (default location, no passphrase)
      cat ~/.ssh/id_rsa.pub
      ```
    - Copy the output and paste into Hetzner
11. **Name:** rustycoin-server
12. Click "Create & Buy Now"
13. **Copy the IP address** shown (e.g., 123.45.67.89)

### Option B: DigitalOcean
**Cost:** $6/month

1. Go to https://www.digitalocean.com
2. Sign up (get $200 free credit for 60 days with GitHub Student Pack)
3. Click "Create" → "Droplets"
4. **Image:** Ubuntu 22.04 LTS
5. **Plan:** Basic ($6/month - 1GB RAM)
6. **Datacenter:** Choose closest region
7. **Authentication:** SSH Key (same process as Hetzner above)
8. **Hostname:** rustycoin-server
9. Click "Create Droplet"
10. **Copy the IP address**

### Option C: Vultr
**Cost:** $6/month

1. Go to https://www.vultr.com
2. Sign up
3. Click "Deploy New Server"
4. **Server Type:** Cloud Compute - Shared CPU
5. **Location:** Choose closest
6. **Image:** Ubuntu 22.04 LTS
7. **Plan:** $6/month (1GB RAM)
8. **SSH Keys:** Add your public key
9. Deploy
10. **Copy the IP address**

---

## Step 2: Connect to Your VPS

### On Windows (PowerShell):
```powershell
ssh root@YOUR_VPS_IP
# Example: ssh root@123.45.67.89
```

First time you'll see:
```
The authenticity of host '123.45.67.89' can't be established.
Are you sure you want to continue connecting (yes/no)?
```
Type `yes` and press Enter.

You should now see:
```
root@rustycoin-server:~#
```

---

## Step 3: Initial Server Setup

Run these commands one by one:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install other tools
apt install -y nginx git build-essential

# Install PM2 (process manager)
npm install -g pm2

# Create a non-root user (more secure)
adduser rustycoin
# Set a password when prompted
# Press Enter for all other questions

# Give user sudo privileges
usermod -aG sudo rustycoin

# Switch to new user
su - rustycoin
```

---

## Step 4: Setup Git and Clone Your Project

### Option A: If you have GitHub repo
```bash
# Generate SSH key for GitHub
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# Press Enter 3 times

# Show public key
cat ~/.ssh/id_rsa.pub
# Copy this and add to GitHub: Settings → SSH Keys → New SSH Key

# Clone your repo
git clone git@github.com:yourusername/rustycoin.git
cd rustycoin
```

### Option B: If no GitHub repo yet
```bash
# Create directory
mkdir rustycoin
cd rustycoin

# You'll upload files later (see Step 5B)
```

---

## Step 5: Upload Your Code

### Option A: Using Git (Recommended)
```bash
# On your local machine (Windows PowerShell):
cd C:\Users\Railends Lipkis\.gemini\antigravity\scratch\rustycoin

# Initialize git if not already
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
# Then on VPS: git clone (see Step 4)
```

### Option B: Using SCP (Direct Upload)
```powershell
# On your local machine (Windows PowerShell):
cd "C:\Users\Railends Lipkis\.gemini\antigravity\scratch\rustycoin"

# Upload backend
scp -r backend rustycoin@YOUR_VPS_IP:~/rustycoin/

# Upload frontend (built version)
npm run build
scp -r dist rustycoin@YOUR_VPS_IP:~/rustycoin/
```

---

## Step 6: Setup Backend

```bash
# On VPS, in ~/rustycoin directory
cd backend

# Install dependencies
npm install

# Create .env file
nano .env
```

Paste your configuration:
```env
STEAM_API_KEY=your_key_here
BOT_USERNAME=your_bot_username
BOT_PASSWORD=your_bot_password
BOT_SHARED_SECRET=your_shared_secret
BOT_IDENTITY_SECRET=your_identity_secret
BOT_STEAM_ID=your_bot_steam_id
PORT=5000
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

```bash
# Create data directory for database
mkdir -p data

# Test backend
node server.js
# You should see: "🤖 Initializing Steam bot..."
# Press Ctrl+C to stop

# Start with PM2 (runs 24/7)
pm2 start server.js --name rustycoin-backend
pm2 save
pm2 startup
# Copy and run the command it shows
```

---

## Step 7: Setup Frontend with Nginx

```bash
# Build frontend (if not already built)
cd ~/rustycoin
npm install
npm run build

# Copy to web directory
sudo mkdir -p /var/www/rustycoin
sudo cp -r dist/* /var/www/rustycoin/

# Configure Nginx
sudo nano /etc/nginx/sites-available/rustycoin
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_VPS_IP;  # Replace with your IP or domain

    # Frontend
    location / {
        root /var/www/rustycoin;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth routes
    location /auth {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Save and exit (`Ctrl+X`, `Y`, `Enter`).

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/rustycoin /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 8: Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (for later)
sudo ufw enable
# Type 'y' when prompted
```

---

## Step 9: Update Frontend API URLs

Your frontend is currently pointing to `localhost:5000`. Update it:

```bash
# On your local machine, edit these files:
# src/components/InventoryModal.jsx
# src/components/TradeUrlModal.jsx
# src/components/TradeStatusModal.jsx
# src/App.jsx

# Change all instances of:
http://localhost:5000
# To:
http://YOUR_VPS_IP

# Then rebuild and re-upload:
npm run build
scp -r dist/* rustycoin@YOUR_VPS_IP:/var/www/rustycoin/
```

---

## Step 10: Test Your Site!

1. Open browser
2. Go to: `http://YOUR_VPS_IP`
3. You should see RustyCoin!
4. Try logging in with Steam
5. Test deposit flow

---

## Step 11: Get a Domain (Optional but Recommended)

### Buy Domain
- **Namecheap:** ~$10/year (.com)
- **Cloudflare:** ~$10/year
- **Porkbun:** ~$8/year

### Point Domain to VPS
1. In domain registrar, go to DNS settings
2. Add an **A Record**:
   - **Name:** `@` (or leave blank)
   - **Value:** Your VPS IP
   - **TTL:** 300
3. Add another **A Record** for www:
   - **Name:** `www`
   - **Value:** Your VPS IP
   - **TTL:** 300
4. Wait 5-30 minutes for DNS to propagate

### Update Nginx for Domain
```bash
sudo nano /etc/nginx/sites-available/rustycoin
```

Change `server_name YOUR_VPS_IP;` to:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

```bash
sudo systemctl restart nginx
```

---

## Step 12: Add SSL (HTTPS) - Free with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Auto-renewal is set up automatically!
```

Your site is now at: `https://yourdomain.com` 🎉

---

## Maintenance Commands

### View Backend Logs
```bash
pm2 logs rustycoin-backend
```

### Restart Backend
```bash
pm2 restart rustycoin-backend
```

### Update Code
```bash
cd ~/rustycoin
git pull  # If using Git
# Or upload new files with scp

# Restart backend
pm2 restart rustycoin-backend

# Update frontend
npm run build
sudo cp -r dist/* /var/www/rustycoin/
```

### Check Server Status
```bash
pm2 status
sudo systemctl status nginx
```

### Monitor Resources
```bash
htop  # Install with: sudo apt install htop
```

---

## Troubleshooting

### Can't connect to VPS
- Check firewall: `sudo ufw status`
- Check SSH service: `sudo systemctl status ssh`

### Backend not starting
- Check logs: `pm2 logs rustycoin-backend`
- Check .env file exists: `ls -la ~/rustycoin/backend/.env`

### Frontend shows blank page
- Check Nginx: `sudo nginx -t`
- Check files: `ls -la /var/www/rustycoin/`
- Check browser console for errors

### Steam login not working
- Update Steam return URL in backend to use your domain/IP
- Check backend logs for errors

---

## Cost Summary

- **VPS:** $5-6/month
- **Domain:** $8-10/year (optional)
- **SSL:** Free (Let's Encrypt)

**Total:** ~$5-6/month for everything!

---

## Next Steps

1. Follow Steam bot setup guide
2. Test deposit/withdrawal flow
3. Add monitoring (optional): UptimeRobot, Sentry
4. Setup backups for database
5. Consider CDN for static assets (Cloudflare - free)

Your RustyCoin site is now live! 🚀
