# Fix Supabase Connection

## Current Issue
The connection string is being read, but can't reach the database server.

## Solution: Use Connection Pooling

Supabase recommends using **Connection Pooling** (port 6543) instead of direct connection (port 5432).

### Steps:

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf/settings/database

2. **Get Connection Pooling String:**
   - Scroll to **"Connection string"** section
   - Click **"Connection pooling"** tab (NOT "URI")
   - Copy the connection string
   - It will look like:
     ```
     postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
     ```

3. **Update .env.local:**
   - Replace `[YOUR-PASSWORD]` with your password (URL encode if needed: `!` → `%21`)
   - Add `?sslmode=require` at the end
   - Example:
     ```
     DATABASE_URL="postgresql://postgres.xxxxx:Made%2178601in@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require"
     ```

4. **Alternative: Check if Database is Paused**
   - Go to: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf
   - If you see "Paused" status, click "Restore" to wake it up
   - Wait a few minutes for it to fully start

5. **Test Connection:**
   ```bash
   npm run db:push
   ```

## Quick Fix Command

After getting the connection pooling string, update `.env.local`:

```bash
# Replace with your actual connection pooling string
echo 'DATABASE_URL="postgresql://postgres.xxxxx:password@pooler.supabase.com:6543/postgres?sslmode=require"' > .env.local
```

