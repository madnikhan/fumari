# 🚀 Quick Demo Setup - iPhone Hotspot

## ⚡ Fast Setup (3 Steps)

### Step 1: Connect to Hotspot
1. Turn ON iPhone Personal Hotspot
2. Connect MacBook to iPhone hotspot
3. Connect client phones to same hotspot

### Step 2: Find Your IP & Start Server
```bash
# Find your IP address
npm run demo:ip

# Start server (accessible from network)
npm run dev:demo
```

### Step 3: Access from Phones
Use the IP address shown (e.g., `http://172.20.10.2:3000`)

---

## 📋 Detailed Steps

### 1. iPhone Hotspot Setup
- Settings → Personal Hotspot → Turn ON
- Note the Wi-Fi password
- Connect MacBook to hotspot
- Connect client phones to same hotspot

### 2. Start Demo Server
```bash
npm run dev:demo
```

This starts the server accessible from other devices on the network.

### 3. Find Your IP Address
```bash
npm run demo:ip
```

Or manually:
```bash
ipconfig getifaddr en0
```

### 4. Access URLs
- **MacBook:** `http://localhost:3000`
- **Phones:** `http://YOUR_IP:3000` (e.g., `http://172.20.10.2:3000`)

---

## 🎯 Demo Flow

1. **Show Dashboard** - Login and show main features
2. **QR Code Generation** - Generate QR codes for tables
3. **Customer Experience** - Scan QR code on phone, send buzzer request
4. **Staff Display** - Show buzzer display with sound
5. **Acknowledge** - Show real-time updates

---

## ⚠️ Troubleshooting

**Can't connect from phone?**
- Check firewall: System Settings → Network → Firewall (turn OFF temporarily)
- Verify all devices on same hotspot
- Check IP address is correct

**Server won't start?**
- Port 3000 in use? Try: `PORT=3001 npm run dev:demo`
- Then access: `http://YOUR_IP:3001`

---

## 💡 Pro Tips

1. **Write down the IP address** - Put it on paper for easy access
2. **Test first** - Open the URL on your phone before client arrives
3. **Keep hotspot stable** - Don't switch networks during demo
4. **Have backup** - Screenshots ready in case of connection issues

---

**Good luck with your demo! 🎉**

