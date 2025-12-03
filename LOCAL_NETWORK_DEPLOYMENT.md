# Local Network Deployment Guide

This guide explains how to deploy and run the Fumari POS system on a local network (not on Vercel).

## Overview

**Vercel Deployment:** Only for demonstration to clients
**Local Network:** Production deployment for actual restaurant use

---

## Quick Start

### 1. Start Local Server

```bash
# Start server accessible on local network
npm run dev:demo
```

### 2. Find Your IP Address

```bash
npm run demo:ip
```

This will show your local IP address (e.g., `192.168.1.100`)

### 3. Access from Devices

- **From server machine:** `http://localhost:3000`
- **From other devices:** `http://YOUR_IP:3000` (e.g., `http://192.168.1.100:3000`)

---

## Detailed Setup

### Step 1: Network Configuration

1. **Ensure all devices are on the same network:**
   - Same Wi-Fi network, OR
   - Same wired network, OR
   - Same router/switch

2. **Find your server's IP address:**
   ```bash
   # macOS/Linux
   ipconfig getifaddr en0
   # or
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   # Look for IPv4 Address
   ```

3. **Note your IP address:**
   - Example: `192.168.1.100`
   - Example: `172.20.10.2` (iPhone hotspot)

### Step 2: Start Server

```bash
# Development mode (accessible on network)
npm run dev:demo

# Or production build
npm run build
npm start
```

**Important:** Use `dev:demo` or set `HOST=0.0.0.0` to allow network access.

### Step 3: Configure Firewall

**macOS:**
1. System Settings → Network → Firewall
2. Turn OFF firewall temporarily (for demo)
3. Or add exception for port 3000

**Windows:**
1. Windows Defender Firewall → Advanced Settings
2. Inbound Rules → New Rule
3. Allow port 3000

**Linux:**
```bash
sudo ufw allow 3000
```

### Step 4: Access from Devices

**On the server machine:**
```
http://localhost:3000
```

**On other devices (phones, tablets, other computers):**
```
http://YOUR_IP:3000
```

Example: `http://192.168.1.100:3000`

---

## Environment Configuration

### Create `.env.local`

```env
# Database (Railway PostgreSQL or local PostgreSQL)
DATABASE_URL=postgresql://postgres:password@host:port/database?sslmode=require

# Local Network Base URL
NEXT_PUBLIC_BASE_URL=http://YOUR_LOCAL_IP:3000

# Handepay (if using)
HANDEPAY_API_KEY=your_api_key
HANDEPAY_MERCHANT_ID=your_merchant_id
HANDEPAY_TERMINAL_ID=your_terminal_id

# Node Environment
NODE_ENV=production
```

**Important:** Update `NEXT_PUBLIC_BASE_URL` with your actual local IP address.

---

## Database Setup

### Option 1: Railway PostgreSQL (Recommended)

1. Use Railway PostgreSQL (already set up)
2. Connection string works from anywhere
3. No local database setup needed

### Option 2: Local PostgreSQL

1. Install PostgreSQL locally
2. Create database
3. Update `DATABASE_URL` in `.env.local`
4. Run migrations: `npm run db:push`
5. Seed data: `npm run db:seed`

---

## Handepay Integration on Local Network

See [HANDEPAY_LOCAL_NETWORK.md](./HANDEPAY_LOCAL_NETWORK.md) for detailed instructions.

**Quick Summary:**
- **Recommended:** Manual transaction entry (no webhook needed)
- **Optional:** Direct API integration (if Handepay provides API)
- **Advanced:** Webhook with tunnel (ngrok/localtunnel)

---

## Production Deployment

### Option 1: Dedicated Server

1. **Set up a dedicated server/computer:**
   - Always-on computer
   - Stable network connection
   - Sufficient resources

2. **Install Node.js:**
   ```bash
   # Install Node.js 18+ and npm
   ```

3. **Clone and setup:**
   ```bash
   git clone https://github.com/madnikhan/fumari.git
   cd fumari
   npm install
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

5. **Build and start:**
   ```bash
   npm run build
   npm start
   ```

6. **Set up as service (Linux):**
   ```bash
   # Use PM2 or systemd to keep server running
   npm install -g pm2
   pm2 start npm --name "fumari-pos" -- start
   pm2 save
   pm2 startup
   ```

### Option 2: Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run:**
   ```bash
   docker build -t fumari-pos .
   docker run -p 3000:3000 --env-file .env.local fumari-pos
   ```

---

## Network Requirements

### Minimum Requirements:
- ✅ All devices on same network
- ✅ Server accessible on port 3000
- ✅ Firewall allows connections
- ✅ Stable network connection

### Recommended:
- ✅ Dedicated Wi-Fi network for POS
- ✅ Static IP for server
- ✅ Network monitoring
- ✅ Backup internet connection

---

## Accessing from Different Devices

### From Tablets/Phones:
1. Connect to same Wi-Fi network
2. Open browser
3. Navigate to: `http://YOUR_IP:3000`
4. Bookmark for easy access

### From Kitchen Display:
1. Connect display device to network
2. Set browser to fullscreen
3. Navigate to: `http://YOUR_IP:3000/dashboard/kitchen`
4. Auto-refresh enabled

### From Kiosk Mode:
1. Connect kiosk device to network
2. Navigate to: `http://YOUR_IP:3000/dashboard/kiosk`
3. Set browser to kiosk mode

---

## Troubleshooting

### Can't Access from Other Devices?

1. **Check IP address:**
   ```bash
   npm run demo:ip
   # Verify IP is correct
   ```

2. **Check firewall:**
   - Temporarily disable firewall
   - Test connection
   - Re-enable with proper rules

3. **Check network:**
   - Ensure all devices on same network
   - Ping server from other device: `ping YOUR_IP`
   - Check router settings

4. **Check server:**
   - Verify server is running
   - Check server logs for errors
   - Verify port 3000 is listening

### Server Won't Start?

1. **Check port:**
   ```bash
   lsof -ti:3000
   # Kill if needed: kill -9 $(lsof -ti:3000)
   ```

2. **Check database:**
   - Verify `DATABASE_URL` is correct
   - Test database connection
   - Run `npm run db:push` if needed

3. **Check dependencies:**
   ```bash
   npm install
   npm run db:generate
   ```

### Slow Performance?

1. **Check network speed:**
   - Test Wi-Fi speed
   - Check for network congestion
   - Consider wired connection for server

2. **Optimize server:**
   - Close unnecessary applications
   - Increase server resources
   - Use production build: `npm run build && npm start`

---

## Security Considerations

### For Local Network:

1. **Network Security:**
   - Use dedicated Wi-Fi network for POS
   - Enable WPA3 encryption
   - Change default router password

2. **Server Security:**
   - Keep server updated
   - Use strong passwords
   - Enable firewall (with proper rules)
   - Regular backups

3. **Application Security:**
   - Change default admin password
   - Use strong user passwords
   - Limit admin access
   - Regular security updates

---

## Maintenance

### Regular Tasks:

1. **Daily:**
   - Check server is running
   - Verify database connection
   - Check payment records

2. **Weekly:**
   - Review logs
   - Check disk space
   - Backup database

3. **Monthly:**
   - Update dependencies
   - Security updates
   - Performance review

---

## Backup Strategy

### Database Backup:

```bash
# Railway PostgreSQL backup (automatic)
# Or manual backup:
pg_dump DATABASE_URL > backup.sql
```

### Application Backup:

```bash
# Backup code
git clone https://github.com/madnikhan/fumari.git

# Backup environment
cp .env.local .env.local.backup
```

---

## Summary

**Local Network Deployment:**

1. ✅ Start server: `npm run dev:demo`
2. ✅ Find IP: `npm run demo:ip`
3. ✅ Access: `http://YOUR_IP:3000`
4. ✅ Configure firewall
5. ✅ Set up Handepay (manual entry recommended)

**Production Setup:**

1. ✅ Dedicated server/computer
2. ✅ Static IP address
3. ✅ Production build: `npm run build && npm start`
4. ✅ Process manager (PM2/systemd)
5. ✅ Monitoring and backups

---

**Need Help?**
- Check server logs for errors
- Verify network connectivity
- Test database connection
- Review firewall settings

