# 🔍 Check Vercel Logs for 500 Error

## You're Seeing:
- ❌ "Database error" banner
- ❌ `POST /api/auth/login 500 (Internal Server Error)`

This means the API is being called but failing on the server side.

---

## Step 1: Check Vercel Logs (Most Important!)

1. Go to **[vercel.com/dashboard](https://vercel.com/dashboard)**
2. Click your **fumari** project
3. Click **"Logs"** tab (top navigation)
4. Try logging in again on your site
5. **Look for the error message** in the logs
6. **Copy the error message** and share it with me

The error will tell us exactly what's wrong!

---

## Step 2: Common Issues & Quick Fixes

### Issue 1: DATABASE_URL Not Being Read

**Check:**
- Go to Settings → Environment Variables
- Verify DATABASE_URL exists
- Make sure it's set for **Production** environment

**Fix:**
- Update DATABASE_URL
- Redeploy

### Issue 2: Prisma Client Not Generated

**Check:**
- Look at build logs in Vercel
- See if `prisma generate` ran successfully

**Fix:**
- Should run automatically via `postinstall` script
- If not, check `package.json`

### Issue 3: Database Connection Failed

**Check:**
- Supabase project is active (not paused)
- Connection string format is correct

**Fix:**
- Resume Supabase if paused
- Verify connection string

### Issue 4: Tables Don't Exist

**Check:**
- Go to Supabase → Table Editor
- See if `User` table exists

**Fix:**
- Run `npm run db:push` locally (already done)
- Tables should exist

---

## Step 3: Verify Setup

### Check 1: Environment Variable
- ✅ DATABASE_URL is set in Vercel
- ✅ Format is correct (with `?sslmode=require`)
- ✅ Set for Production environment

### Check 2: Deployment
- ✅ Redeployed after updating DATABASE_URL
- ✅ Latest deployment is successful

### Check 3: Database
- ✅ Supabase project is active
- ✅ Tables exist (User, Table, Order, etc.)
- ✅ Admin user exists

---

## What I Need:

**Please check Vercel Logs and share:**
1. The **exact error message** from the logs
2. Any **stack trace** or error details
3. When did the error occur? (timestamp)

---

## Quick Test:

Try this to see if it's a connection issue:

1. Go to Vercel → **Logs**
2. Try logging in
3. Look for errors related to:
   - "Can't reach database server"
   - "Prisma Client"
   - "DATABASE_URL"
   - "Connection"

---

**The Vercel logs will show the exact error - that's what we need to fix it!** 🔍

