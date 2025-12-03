# Quick Fix: P1001 Error - Can't Reach Database Server

## 🔴 Error: `P1001: Can't reach database server at aws-1-us-east-2.pooler.supabase.com:5432`

This error means Vercel **cannot connect** to your Supabase database.

---

## ✅ Solution 1: Resume Supabase Project (90% of cases)

### Step 1: Check if Project is Paused

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Find your project
3. **Look at the top of the page:**
   - ✅ **"Active"** → Skip to Solution 2
   - ⚠️ **"Paused"** → Click **"Resume"** → Wait 2 minutes → Test again
   - ❌ **"Inactive"** → Click **"Restore"** → Wait 2 minutes → Test again

### Step 2: Test Connection

After resuming, wait 2 minutes, then:
1. Visit: `https://fumari.vercel.app/api/test-db`
2. If it works → ✅ **Fixed!**
3. If still fails → Continue to Solution 2

---

## ✅ Solution 2: Verify Connection String

### Step 1: Get Correct Connection String

1. Go to Supabase Dashboard → **Project Settings** (gear icon)
2. Click **"Database"** in left sidebar
3. Scroll to **"Connection string"** section
4. Click **"Session mode"** tab (pooler)
5. Copy the connection string
6. **Replace `[YOUR-PASSWORD]`** with your actual password
7. **Add `?sslmode=require`** at the end

**Format should be:**
```
postgresql://postgres.iicsqunmzelpqvlotrna:YOUR-PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
```

### Step 2: Update Vercel

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **"Edit"**
4. Paste the corrected connection string
5. Make sure it ends with `?sslmode=require`
6. Click **"Save"**

### Step 3: Redeploy

1. Go to Vercel → **Deployments**
2. Click **"..."** → **"Redeploy"**
3. Wait for completion
4. Test: `https://fumari.vercel.app/api/test-db`

---

## ✅ Solution 3: Try Direct Connection (Alternative)

If pooler doesn't work, try direct connection:

1. In Supabase → Settings → Database
2. Click **"Direct connection"** tab
3. Copy connection string
4. Replace password and add SSL:
   ```
   postgresql://postgres:YOUR-PASSWORD@db.iicsqunmzelpqvlotrna.supabase.co:5432/postgres?sslmode=require
   ```
5. Update Vercel `DATABASE_URL` with this
6. Redeploy

---

## ✅ Solution 4: Check Database Password

If password is wrong, reset it:

1. Supabase Dashboard → **Settings** → **Database**
2. Scroll to **"Database password"**
3. Click **"Reset database password"**
4. Copy the new password
5. Update Vercel `DATABASE_URL` with new password
6. Redeploy

---

## 🔍 Diagnostic: Test Connection

Visit: `https://fumari.vercel.app/api/test-db`

**Expected response:**
```json
{
  "success": true,
  "tests": {
    "connection": "success",
    "query": "success: 1 users found"
  }
}
```

**If you see:**
- `connection: "failed: P1001"` → Supabase is paused OR wrong host
- `connection: "failed: P1000"` → Wrong password
- `connection: "failed: P1017"` → Missing SSL mode

---

## 🚀 Quick Checklist

- [ ] Supabase project is **Active** (not paused)
- [ ] Connection string has **correct password** (no placeholders)
- [ ] Connection string ends with **`?sslmode=require`**
- [ ] Vercel `DATABASE_URL` updated
- [ ] Vercel redeployed
- [ ] Test endpoint shows success

---

## ⚠️ If Still Not Working

**Most likely:** Supabase project keeps pausing (free tier limitation)

**Solution:** Switch to Railway (never pauses)
- See `SWITCH_TO_RAILWAY.md` for step-by-step guide
- Takes 5 minutes
- More reliable than Supabase free tier

---

**Start with Solution 1 - Resume Supabase project. That fixes 90% of P1001 errors!** 🎯

