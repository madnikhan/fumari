# Troubleshooting Supabase Connection

## Current Error
```
Error: P1001: Can't reach database server at `db.nnsqtbdlwbgytgbxqguf.supabase.co:5432`
```

## Step-by-Step Fix

### Step 1: Check if Database is Paused ⏸️

Supabase free tier pauses databases after inactivity.

1. **Go to your project dashboard:**
   - https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf

2. **Check the status:**
   - If you see "Paused" or "Sleeping" → Click **"Restore"** or **"Resume"**
   - Wait 1-2 minutes for the database to fully start

3. **Verify it's active:**
   - You should see "Active" status
   - Green indicator

### Step 2: Use Connection Pooling (Recommended) 🔗

**Why?** Connection pooling (port 6543) is more reliable than direct connection (port 5432).

1. **Get Connection Pooling String:**
   - Go to: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf/settings/database
   - Scroll to **"Connection string"** section
   - Click **"Connection pooling"** tab (NOT "URI")
   - Copy the connection string
   - Format will be:
     ```
     postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
     ```

2. **Update .env.local:**
   ```bash
   # Replace [YOUR-PASSWORD] with your actual password
   # URL encode special characters: ! → %21
   DATABASE_URL="postgresql://postgres.xxxxx:Made%2178601in@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require"
   NODE_ENV="development"
   ```

3. **Test Connection:**
   ```bash
   node test-connection.js
   ```

### Step 3: Alternative - Direct Connection (If Pooling Doesn't Work)

If connection pooling doesn't work, try direct connection:

1. **Get Direct Connection String:**
   - Same dashboard page → **"URI"** tab
   - Copy connection string
   - Format:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.nnsqtbdlwbgytgbxqguf.supabase.co:5432/postgres
     ```

2. **Update .env.local:**
   ```bash
   DATABASE_URL="postgresql://postgres:Made%2178601in@db.nnsqtbdlwbgytgbxqguf.supabase.co:5432/postgres?sslmode=require"
   NODE_ENV="development"
   ```

### Step 4: Verify Connection

After updating `.env.local`:

```bash
# Test connection
node test-connection.js

# If successful, push schema
npm run db:push

# Then seed data
npm run db:seed
```

## Common Issues

### Issue 1: Password with Special Characters
**Solution:** URL encode special characters in password
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`

### Issue 2: Database Paused
**Solution:** Restore from Supabase dashboard

### Issue 3: Wrong Port
**Solution:** Use port 6543 (connection pooling) instead of 5432

### Issue 4: Missing SSL Mode
**Solution:** Always add `?sslmode=require` at the end

## Quick Test

Run this to test your connection:
```bash
node test-connection.js
```

Expected output if successful:
```
✅ Connection successful!
✅ Query test successful: [ { test: 1 } ]
```

## Still Having Issues?

1. **Check Supabase Status:** https://status.supabase.com
2. **Verify Project Status:** Make sure project is active in dashboard
3. **Check Network:** Ensure no firewall blocking ports 5432 or 6543
4. **Reset Password:** If needed, reset database password in Supabase dashboard

