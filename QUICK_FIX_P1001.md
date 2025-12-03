# Quick Fix: P1001 Can't Reach Database Server

## 🚨 Error: `P1001: Can't reach database server`

This error means Vercel **cannot connect** to your Supabase database.

---

## ✅ Step 1: Check Supabase Project Status (MOST COMMON FIX)

1. **Go to:** https://supabase.com/dashboard
2. **Find your project** (look for project name)
3. **Check the status badge** at the top:
   - ✅ **"Active"** → Continue to Step 2
   - ⚠️ **"Paused"** → **Click "Resume"** → Wait 2-3 minutes → Try again
   - ❌ **"Inactive"** → **Click "Restore"** → Wait 2-3 minutes → Try again

**If paused:** This is the #1 cause of this error. Supabase free tier pauses after 7 days of inactivity.

---

## ✅ Step 2: Verify Connection String in Vercel

1. **Go to:** Vercel → Your Project → **Settings** → **Environment Variables**
2. **Find `DATABASE_URL`**
3. **Click "Edit"** or check the value
4. **Verify it looks like this:**
   ```
   postgresql://postgres.iicsqunmzelpqvlotrna:YOUR-ACTUAL-PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
   ```

**Checklist:**
- ✅ Starts with `postgresql://`
- ✅ Has `.pooler.supabase.com` (not `.supabase.co`)
- ✅ Port is `5432`
- ✅ Has actual password (not `[YOUR-PASSWORD]` placeholder)
- ✅ Ends with `?sslmode=require`

**If wrong:** Copy correct connection string from Supabase → Update Vercel → Redeploy

---

## ✅ Step 3: Get Correct Connection String from Supabase

1. **Go to:** Supabase Dashboard → **Project Settings** (gear icon)
2. **Click "Database"** in left sidebar
3. **Scroll to "Connection string"** section
4. **Click "Session mode"** tab (this is the pooler)
5. **Copy the connection string**
6. **Replace `[YOUR-PASSWORD]`** with your actual database password
   - If you forgot: Settings → Database → Reset database password
7. **Add `?sslmode=require`** at the end if not present
8. **Update Vercel** → Settings → Environment Variables → `DATABASE_URL`

---

## ✅ Step 4: Test Connection Locally

**Before redeploying Vercel, test locally:**

1. **Update `.env.local`:**
   ```bash
   DATABASE_URL=postgresql://postgres.iicsqunmzelpqvlotrna:YOUR-PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
   ```

2. **Test connection:**
   ```bash
   npm run db:push
   ```

3. **If it works locally:** The issue is Vercel environment variable
4. **If it fails locally:** The issue is Supabase project (paused/wrong connection string)

---

## ✅ Step 5: Redeploy Vercel

After fixing the connection string:

1. **Go to:** Vercel → **Deployments**
2. **Click "..."** on latest deployment
3. **Click "Redeploy"**
4. **Wait for build to complete**

---

## ✅ Step 6: Verify Fix

1. **Visit:** `https://fumari.vercel.app/api/test-db`
2. **Check response:**
   - ✅ `"connection": "success"` → Fixed!
   - ❌ `"connection": "failed: P1001"` → Go back to Step 1

---

## 🔍 Alternative: Try Direct Connection

If pooler doesn't work, try direct connection:

1. **In Supabase:** Settings → Database → Connection string → **"Direct connection"** tab
2. **Copy connection string** (uses `db.xxxxx.supabase.co` instead of `pooler.supabase.com`)
3. **Add `?sslmode=require`**
4. **Update Vercel** `DATABASE_URL`
5. **Redeploy**

**Direct connection format:**
```
postgresql://postgres:YOUR-PASSWORD@db.iicsqunmzelpqvlotrna.supabase.co:5432/postgres?sslmode=require
```

---

## 🚀 If Still Not Working

**Consider switching to Railway** (see `SWITCH_TO_RAILWAY.md`):
- ✅ Never pauses
- ✅ More reliable
- ✅ Easier setup
- ✅ Free tier: $5 credit/month

---

## 📋 Quick Checklist

- [ ] Supabase project is **Active** (not paused) ← **MOST IMPORTANT**
- [ ] Connection string has **correct password** (no placeholders)
- [ ] Connection string ends with **`?sslmode=require`**
- [ ] Vercel `DATABASE_URL` is set for **Production**
- [ ] Tested locally (works with `npm run db:push`)
- [ ] Vercel redeployed after fixing `DATABASE_URL`

---

**99% of the time, this error is because Supabase project is paused. Resume it and wait 2-3 minutes!** ⏰
