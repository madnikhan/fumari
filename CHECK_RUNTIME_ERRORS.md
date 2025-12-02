# Check Runtime Database Errors

## Step 1: Check Vercel Runtime Logs

The build succeeded, so the error happens when you try to log in. Follow these steps:

### 1. Go to Vercel Dashboard
- Open your project: https://vercel.com/dashboard
- Click on your project

### 2. Open the Logs Tab
- Click **"Logs"** tab (not "Deployments")
- Make sure you're viewing **"Runtime Logs"** (not "Build Logs")

### 3. Try to Log In
- Open your deployed app in a new tab
- Try to log in with your credentials
- Go back to Vercel Logs tab

### 4. Look for Error Messages
You should see errors like:
- `Database error: P1001: Can't reach database server`
- `Database error: P2021: Table "User" does not exist`
- `Database error: connection refused`
- Or other Prisma error codes

**Copy the exact error message and share it.**

---

## Step 2: Verify Database Tables Exist

The most common issue: **Database tables haven't been created yet.**

### Check if tables exist:
1. Go to Supabase Dashboard
2. Click **"Table Editor"** in the left sidebar
3. Do you see tables like `User`, `Table`, `Order`, etc.?

**If you see NO tables**, that's the problem! Follow Step 3.

---

## Step 3: Create Database Tables

If tables don't exist, you need to create them:

### Option A: Using Local Terminal (Recommended)

1. **Set your local DATABASE_URL to Supabase:**
   ```bash
   # Check your .env.local file
   cat .env.local
   ```
   
   Make sure it has:
   ```
   DATABASE_URL="postgresql://postgres.iicsqunmzelpqvlotrna:Made!78601in@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"
   ```

2. **Push schema to database:**
   ```bash
   npm run db:push
   ```
   
   This creates all tables.

3. **Seed initial data:**
   ```bash
   npm run db:seed
   ```
   
   This creates the default admin user.

4. **Verify in Supabase:**
   - Go to Supabase → Table Editor
   - You should now see all tables

### Option B: Using Supabase SQL Editor

1. Go to Supabase Dashboard
2. Click **"SQL Editor"**
3. Run this to check if User table exists:
   ```sql
   SELECT * FROM "User" LIMIT 1;
   ```
   
   If you get "relation User does not exist", tables need to be created.

---

## Step 4: Verify Vercel Environment Variable

1. Go to Vercel → Settings → Environment Variables
2. Find `DATABASE_URL`
3. Make sure it matches your Supabase connection string:
   ```
   postgresql://postgres.iicsqunmzelpqvlotrna:Made!78601in@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
   ```
4. **Important:** Make sure it ends with `?sslmode=require`
5. If you changed it, **redeploy** (Deployments → ... → Redeploy)

---

## Common Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| `P1001` | Can't reach database | Check Supabase project is active, check connection string |
| `P2021` | Table doesn't exist | Run `npm run db:push` |
| `P2002` | Unique constraint violation | Data already exists, this is OK |
| `P1000` | Authentication failed | Check password in connection string |

---

## Quick Test

Run this locally to test the connection:

```bash
# Make sure .env.local has Supabase connection string
npm run db:push
```

If this works locally, the issue is likely:
1. Vercel DATABASE_URL is wrong
2. Tables don't exist in Supabase
3. Supabase project is paused

---

## Next Steps

1. **Check Vercel Runtime Logs** (Step 1) - Get the exact error
2. **Check if tables exist** (Step 2) - Verify database state
3. **Create tables if missing** (Step 3) - Run `db:push`
4. **Share the error message** - So we can fix it

