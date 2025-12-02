# Demo Setup Guide - iPhone Hotspot

This guide will help you set up the system for demonstration using your iPhone hotspot.

## Step-by-Step Setup

### 1. Connect Devices to iPhone Hotspot

1. **On your iPhone:**
   - Go to Settings → Personal Hotspot
   - Turn on "Allow Others to Join"
   - Note the Wi-Fi password

2. **On your MacBook:**
   - Connect to your iPhone's hotspot (Settings → Wi-Fi)
   - Make sure you're connected

3. **On client phones/devices:**
   - Connect to the same iPhone hotspot
   - All devices must be on the same network

### 2. Find Your MacBook's IP Address

**Option A: Using Terminal (Easiest)**
```bash
# Run this command in terminal:
ipconfig getifaddr en0
# or if that doesn't work:
ipconfig getifaddr en1
```

**Option B: Using System Settings**
1. Open System Settings → Network
2. Click on Wi-Fi (or your active connection)
3. Look for "IP Address" - it will be something like `172.20.10.2` or `192.168.x.x`

**Option C: Quick Script**
```bash
# Run this in terminal:
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

### 3. Start the Development Server

**For Demo (Accessible from other devices):**
```bash
npm run dev:demo
```

This will start the server on `0.0.0.0:3000` which allows connections from other devices.

**Or manually:**
```bash
HOST=0.0.0.0 npm run dev
```

### 4. Access from Other Devices

Once the server is running, access the app from any device on the hotspot:

- **From MacBook:** `http://localhost:3000`
- **From phones/other devices:** `http://YOUR_MACBOOK_IP:3000`
  - Example: `http://172.20.10.2:3000`
  - Example: `http://192.168.1.100:3000`

### 5. Share the URL with Your Client

Create a simple URL they can type in their phone browser:
```
http://YOUR_MACBOOK_IP:3000
```

**Pro Tip:** Write this URL on a piece of paper or send it via message so they can easily access it.

## Quick Demo Checklist

- [ ] iPhone hotspot is ON
- [ ] MacBook connected to hotspot
- [ ] Found MacBook IP address
- [ ] Started server with `npm run dev:demo`
- [ ] Tested on MacBook: `http://localhost:3000`
- [ ] Tested on phone: `http://YOUR_MACBOOK_IP:3000`
- [ ] Client devices connected to hotspot
- [ ] Shared the URL with client

## Troubleshooting

### Can't connect from phone?
1. **Check firewall:** System Settings → Network → Firewall → Turn OFF temporarily for demo
2. **Check IP address:** Make sure you're using the correct IP (the one from hotspot, not local network)
3. **Check server:** Make sure server shows "Ready" and is listening on `0.0.0.0:3000`
4. **Check network:** All devices must be on the same hotspot

### Server won't start?
- Make sure port 3000 is not in use: `lsof -ti:3000` (then kill if needed)
- Try a different port: `PORT=3001 npm run dev:demo`

### Slow performance?
- iPhone hotspot can be slower than Wi-Fi
- Close unnecessary apps on MacBook
- Limit number of connected devices

## Demo Scenarios to Show

1. **QR Code Buzzer System:**
   - Show QR code generation
   - Scan QR code on phone
   - Send buzzer request
   - Show on big screen display
   - Acknowledge request

2. **Table Management:**
   - Show table map
   - Create reservations
   - Assign tables

3. **Order Management:**
   - Create orders
   - Kitchen display
   - Order tracking

## After Demo

1. Stop the server (Ctrl+C)
2. Turn off hotspot if not needed
3. Turn firewall back on if you disabled it

---

**Need Help?** Make sure all devices are on the same hotspot network and using the correct IP address!

