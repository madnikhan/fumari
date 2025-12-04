# Waiter Login & Notifications Guide

## How Waiters See Notifications on Their Phone

### Step 1: Create User Account for Waiter

Waiters need a **User account** to login (separate from Staff record):

1. Go to **Admin Dashboard** → **Staff Management**
2. Create or find the Staff record (e.g., "Waiter 2")
3. **Important:** Note the Staff's email or name

4. Create a User account:
   - Go to **Admin Dashboard** → **Users** (or create via API)
   - Username: Can match Staff name (e.g., "waiter2")
   - Email: Should match Staff email (if available)
   - Password: Set a password for the waiter
   - Role: Can be "staff" or "waiter"

### Step 2: Assign Tables to Staff

1. Go to **Table Management** (`/dashboard/tables`)
2. Click **"Assign Waiter"** on each table
3. Select the **Staff member** (e.g., "Waiter 2")
4. Click **Save**

**Important:** Tables are assigned to **Staff IDs**, not User IDs.

### Step 3: Waiter Login

1. Waiter opens browser on their phone
2. Go to: `http://your-server-ip:3000/login` (or your domain)
3. Enter:
   - **Username:** The User account username
   - **Password:** The User account password
4. Click **Login**

### Step 4: Access Notifications

After login, waiter can access notifications in two ways:

**Option 1: Direct URL**
- Go to: `/dashboard/waiter/notifications`
- Or: `http://your-server-ip:3000/dashboard/waiter/notifications`

**Option 2: Navigation Menu**
- Click **"Notifications"** link in the top navigation bar
- Or click **"Notifications"** in the mobile menu

### Step 5: View Notifications

- Notifications page shows all pending requests from assigned tables
- Auto-refreshes every 3 seconds
- Shows:
  - Table number
  - Request type (Call Waiter, Order Food, etc.)
  - Time since request
  - Action buttons (Acknowledge, Complete)

---

## How It Works

### Matching Staff to User

The system matches waiters by:
1. **Email match:** If Staff email matches User email
2. **Name match:** If Staff name contains User username

### Notification Flow

1. Customer scans QR code → Makes request
2. Request saved to database with `tableId`
3. System finds tables assigned to waiter's Staff ID
4. Shows notifications for those tables only

---

## Troubleshooting

### Waiter Not Seeing Notifications?

**Check 1: User Account Exists**
```sql
SELECT id, username, email FROM User WHERE username = 'waiter2';
```

**Check 2: Staff Record Exists**
```sql
SELECT id, name, email FROM Staff WHERE name LIKE '%Waiter 2%';
```

**Check 3: Tables Assigned**
```sql
SELECT number, "assignedWaiterId" FROM "Table" WHERE number IN (1, 2, 3);
```

**Check 4: Email/Name Match**
- Staff email should match User email (if both have emails)
- Or Staff name should contain User username

**Check 5: Waiter Logged In**
- Waiter must be logged in as a User
- Session must be valid
- Check browser cookies for `session` cookie

**Check 6: API Response**
- Open browser console
- Check `/api/buzzer/waiter/notifications` response
- Should return array of notifications

---

## Quick Setup for Waiter 2

### 1. Create User Account

**Via Admin Dashboard:**
- Go to Admin → Users → Create User
- Username: `waiter2`
- Email: (match Staff email if available)
- Password: (set password)
- Role: `staff`

**Or via API:**
```bash
POST /api/users
{
  "username": "waiter2",
  "email": "waiter2@restaurant.com",
  "password": "password123",
  "role": "staff"
}
```

### 2. Update Staff Record (Optional)

Make sure Staff record has matching email:
```sql
UPDATE Staff SET email = 'waiter2@restaurant.com' WHERE name = 'Waiter 2';
```

### 3. Assign Tables

Already done! Tables 1, 2, 3 are assigned to Staff ID: `cmi0rk3fz002u0snsxogvmasp`

### 4. Login as Waiter 2

- URL: `http://localhost:3000/login` (or your server IP)
- Username: `waiter2`
- Password: (the password you set)

### 5. View Notifications

- After login, go to: `/dashboard/waiter/notifications`
- Or click "Notifications" in navigation menu

---

## Example: Complete Setup

**Staff Record:**
- ID: `cmi0rk3fz002u0snsxogvmasp`
- Name: `Waiter 2`
- Email: `waiter2@restaurant.com` (optional but recommended)

**User Account:**
- Username: `waiter2`
- Email: `waiter2@restaurant.com` (should match Staff email)
- Password: `password123`
- Role: `staff`

**Tables Assigned:**
- Table 1 → Staff ID: `cmi0rk3fz002u0snsxogvmasp`
- Table 2 → Staff ID: `cmi0rk3fz002u0snsxogvmasp`
- Table 3 → Staff ID: `cmi0rk3fz002u0snsxogvmasp`

**Result:**
- Waiter 2 logs in with User account
- System matches User to Staff by email/name
- System finds tables assigned to Staff ID
- Waiter sees notifications from Tables 1, 2, 3

---

## Mobile Access

### For Local Network:

1. Find your server IP:
   ```bash
   npm run demo:ip
   ```

2. Waiter opens phone browser:
   - Go to: `http://YOUR-IP:3000/login`
   - Login with User credentials
   - Go to: `http://YOUR-IP:3000/dashboard/waiter/notifications`

### For Production (Vercel):

1. Waiter opens phone browser:
   - Go to: `https://fumari.vercel.app/login`
   - Login with User credentials
   - Go to: `https://fumari.vercel.app/dashboard/waiter/notifications`

---

**The key is: Waiters need BOTH a Staff record (for table assignment) AND a User account (for login)!**

