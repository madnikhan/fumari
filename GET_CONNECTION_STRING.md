# Get Supabase Connection String - Step by Step

## The Problem
You're currently using **port 5432** (direct connection) which may not be accessible.  
You need to use **port 6543** (connection pooling) instead.

## Solution: Get Connection Pooling String

### Step 1: Open Supabase Dashboard
Go to: **https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf/settings/database**

### Step 2: Find Connection String Section
Scroll down to the **"Connection string"** section

### Step 3: Click "Connection pooling" Tab
- **DO NOT** use the "URI" tab
- **DO** click the **"Connection pooling"** tab
- This uses port **6543** (more reliable)

### Step 4: Copy Connection String
You'll see something like:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
```

### Step 5: Update .env.local

1. **Replace `[YOUR-PASSWORD]`** with your actual database password
2. **URL encode special characters** if your password has them:
   - `!` → `%21`
   - `@` → `%40`
   - `#` → `%23`
   - etc.

3. **Add `?sslmode=require`** at the end

**Example:**
If your password is `Made!78601in`, the connection string should be:
```
DATABASE_URL="postgresql://postgres.xxxxx:Made%2178601in@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require"
NODE_ENV="development"
```

### Step 6: Test Connection
```bash
npm run db:push
```

If successful, you'll see:
```
✔ Your database is now in sync with your Prisma schema.
```

Then seed:
```bash
npm run db:seed
```

## Alternative: Check if Database is Paused

If connection pooling still doesn't work:

1. Go to: **https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf**
2. Check if database shows **"Paused"** status
3. If paused, click **"Restore"** button
4. Wait 1-2 minutes for database to start
5. Try again

## Quick Checklist

- [ ] Opened Supabase dashboard → Settings → Database
- [ ] Clicked "Connection pooling" tab (NOT "URI")
- [ ] Copied connection string
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] URL encoded special characters (`!` → `%21`)
- [ ] Added `?sslmode=require` at the end
- [ ] Updated `.env.local` file
- [ ] Ran `npm run db:push`
- [ ] Ran `npm run db:seed`

## Still Having Issues?

Share your connection string format (without password) and I can help troubleshoot!

