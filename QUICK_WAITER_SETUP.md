# Quick Setup: Waiter 2 Notifications

## Current Status

✅ **Tables Assigned:**
- Table 1 → Waiter 2 (Staff ID: `cmi0rk3fz002u0snsxogvmasp`)
- Table 2 → Waiter 2
- Table 3 → Waiter 2

✅ **Staff Record:**
- Name: Waiter 2
- Email: `waiter2@fumari.com`
- ID: `cmi0rk3fz002u0snsxogvmasp`

---

## Step-by-Step: How Waiter 2 Sees Notifications

### 1. Create User Account for Waiter 2

**Option A: Via Admin Dashboard**
1. Login as admin
2. Go to Admin Dashboard → Users
3. Create new user:
   - Username: `waiter2`
   - Email: `waiter2@fumari.com` (must match Staff email!)
   - Password: (set a password, e.g., `waiter123`)
   - Role: `staff`

**Option B: Via API**
```bash
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "username": "waiter2",
  "email": "waiter2@fumari.com",
  "password": "waiter123",
  "role": "staff"
}
```

### 2. Waiter 2 Login on Phone

1. **Open browser** on phone
2. **Go to:** `http://YOUR-SERVER-IP:3000/login`
   - For local network: Use the IP from `npm run demo:ip`
   - For Vercel: `https://fumari.vercel.app/login`
3. **Enter credentials:**
   - Username: `waiter2`
   - Password: `waiter123` (or whatever you set)
4. **Click Login**

### 3. Access Notifications

**After login, waiter can:**

**Option 1: Click "Notifications" link**
- Top navigation bar → "Notifications"
- Or mobile menu → "Notifications"

**Option 2: Direct URL**
- Go to: `/dashboard/waiter/notifications`
- Full URL: `http://YOUR-SERVER-IP:3000/dashboard/waiter/notifications`

### 4. View Notifications

- Page shows all pending requests from Tables 1, 2, 3
- Auto-refreshes every 3 seconds
- When customer makes request:
  - Customer scans QR code at table
  - Clicks service button (Call Waiter, Order Food, etc.)
  - Notification appears on Waiter 2's phone
  - Waiter can acknowledge or complete

---

## How It Works

1. **Customer Request:**
   - Customer at Table 1 scans QR code
   - Clicks "Call Waiter"
   - Request saved to database

2. **System Matching:**
   - Waiter 2 logs in → System gets User ID
   - System finds Staff record by matching email (`waiter2@fumari.com`)
   - System finds tables assigned to that Staff ID
   - System shows notifications for those tables

3. **Notification Display:**
   - Waiter 2 sees: "Table 1 - Call Waiter"
   - Can click "Acknowledge" or "Complete"

---

## Testing

### Test the Flow:

1. **Create User Account** (if not exists)
2. **Login as Waiter 2** on phone
3. **Go to Notifications page**
4. **On another device/browser:**
   - Go to `/table/1` (or scan QR code)
   - Click "Call Waiter"
5. **Check Waiter 2's phone:**
   - Notification should appear within 3 seconds

---

## Troubleshooting

### "No notifications" showing?

1. **Check User account exists:**
   ```sql
   SELECT * FROM User WHERE email = 'waiter2@fumari.com';
   ```

2. **Check Staff email matches:**
   ```sql
   SELECT * FROM Staff WHERE email = 'waiter2@fumari.com';
   ```

3. **Check tables assigned:**
   ```sql
   SELECT number, "assignedWaiterId" FROM "Table" WHERE number IN (1,2,3);
   ```

4. **Check waiter is logged in:**
   - Look for "Notifications" link in navigation
   - If not visible, waiter is not logged in

5. **Check API response:**
   - Open browser console on phone
   - Check Network tab → `/api/buzzer/waiter/notifications`
   - Should return array of notifications

---

## Mobile Access URLs

### Local Network:
```
Login: http://YOUR-IP:3000/login
Notifications: http://YOUR-IP:3000/dashboard/waiter/notifications
```

### Production (Vercel):
```
Login: https://fumari.vercel.app/login
Notifications: https://fumari.vercel.app/dashboard/waiter/notifications
```

---

**Key Point:** Waiter 2 needs a **User account** with email `waiter2@fumari.com` to login and see notifications!

