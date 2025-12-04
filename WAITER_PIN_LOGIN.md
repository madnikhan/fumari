# Waiter PIN Login Guide

## How Waiters Login with PIN

Waiters use their **Staff PIN** (not password) to login and see notifications.

---

## Quick Setup for Waiter 2

### Current Status

✅ **Staff Record:**
- Name: `waiter 2` (or `Waiter 2`)
- PIN: `1002`
- ID: `cmir18c5v000d0seinr6s9ghx`

✅ **Tables Assigned:**
- Table 1 → Waiter 2
- Table 2 → Waiter 2
- Table 3 → Waiter 2

---

## Step-by-Step: How Waiter 2 Sees Notifications

### 1. Waiter 2 Login on Phone

1. **Open browser** on phone
2. **Go to:** `http://YOUR-SERVER-IP:3000/waiter-login`
   - For local network: Use the IP from `npm run demo:ip`
   - For Vercel: `https://fumari.vercel.app/waiter-login`
3. **Enter credentials:**
   - **Name:** `waiter 2` (or `Waiter 2` - case-insensitive, partial match)
   - **PIN:** `1002`
4. **Click Login**

### 2. Access Notifications

**After login, waiter is automatically redirected to:**
- `/dashboard/waiter/notifications`

**Or manually navigate to:**
- Click **"Notifications"** link in top navigation
- Or go to: `http://YOUR-SERVER-IP:3000/dashboard/waiter/notifications`

### 3. View Notifications

- Page shows all pending requests from Tables 1, 2, 3
- Auto-refreshes every 3 seconds
- When customer makes request:
  - Customer scans QR code at table
  - Clicks service button (Call Waiter, Order Food, etc.)
  - Notification appears on Waiter 2's phone
  - Waiter can acknowledge or complete

---

## How It Works

### Login Flow

1. **Waiter enters Name and PIN**
   - Name: `waiter 2` (matches Staff name, case-insensitive)
   - PIN: `1002` (matches Staff PIN)

2. **System validates:**
   - Finds Staff record where name contains "waiter 2"
   - Verifies PIN matches
   - Checks Staff is active

3. **Session created:**
   - Session uses Staff ID (not User ID)
   - Session stored in cookie
   - Redirects to notifications page

4. **Notifications API:**
   - Gets session → Finds Staff ID
   - Finds tables assigned to that Staff ID
   - Returns notifications for those tables

---

## Testing

### Test the Flow:

1. **Login as Waiter 2** on phone:
   - URL: `http://localhost:3000/waiter-login` (or your server IP)
   - Name: `waiter 2`
   - PIN: `1002`

2. **Go to Notifications page** (auto-redirects after login)

3. **On another device/browser:**
   - Go to `/table/1` (or scan QR code)
   - Click "Call Waiter"

4. **Check Waiter 2's phone:**
   - Notification should appear within 3 seconds
   - Shows: "Table 1 - Call Waiter"

---

## Find Waiter PIN

### Via Database:
```sql
SELECT id, name, pin FROM Staff WHERE name LIKE '%Waiter 2%';
```

### Via Admin Dashboard:
1. Go to Admin Dashboard → Staff Management
2. Find "Waiter 2"
3. View PIN (or edit to set a new PIN)

### Via API:
```bash
GET /api/staff
```

---

## Mobile Access URLs

### Local Network:
```
Login: http://YOUR-IP:3000/waiter-login
Notifications: http://YOUR-IP:3000/dashboard/waiter/notifications
```

### Production (Vercel):
```
Login: https://fumari.vercel.app/waiter-login
Notifications: https://fumari.vercel.app/dashboard/waiter/notifications
```

---

## Troubleshooting

### "Invalid name or PIN" error?

1. **Check Staff name:**
   ```sql
   SELECT name FROM Staff WHERE id = 'cmir18c5v000d0seinr6s9ghx';
   ```
   - Name should be `waiter 2` (case-insensitive)
   - Try partial match: `waiter` or `Waiter 2`

2. **Check PIN:**
   ```sql
   SELECT pin FROM Staff WHERE id = 'cmir18c5v000d0seinr6s9ghx';
   ```
   - PIN should be `1002`
   - PIN is stored as string (not number)

3. **Check Staff is active:**
   ```sql
   SELECT active FROM Staff WHERE id = 'cmir18c5v000d0seinr6s9ghx';
   ```
   - Should be `1` (true)

### "No notifications" showing?

1. **Check tables assigned:**
   ```sql
   SELECT number, "assignedWaiterId" FROM "Table" WHERE number IN (1,2,3);
   ```
   - Should show Staff ID: `cmir18c5v000d0seinr6s9ghx`

2. **Check waiter is logged in:**
   - Look for "Notifications" link in navigation
   - If not visible, waiter is not logged in

3. **Check API response:**
   - Open browser console on phone
   - Check Network tab → `/api/buzzer/waiter/notifications`
   - Should return array of notifications

---

## PIN Format

- PIN is **4 digits** (e.g., `1002`, `1234`)
- Stored as **string** in database
- Case-sensitive (must match exactly)

---

## Security Notes

- PIN is stored as plain text (not hashed)
- Consider PIN as a quick-access code (like a door code)
- For production, consider:
  - PIN rotation policy
  - PIN complexity requirements
  - Rate limiting on login attempts

---

**Key Point:** Waiters login with **Name + PIN** (from Staff record), not username + password (from User record)!

