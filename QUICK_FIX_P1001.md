# Quick Fix: P1001 Can't Reach Database Server

## 🚨 Error You're Seeing

```
Can't reach database server at `aws-1-us-east-2.pooler.supabase.com:5432`
```

## ✅ Solution (99% of the time)

**Your Supabase project is PAUSED.** Here's how to fix it:

---

## Step 1: Resume Supabase Project (2 minutes)

1. **Go to:** https://supabase.com/dashboard
2. **Find your project** (look for project name)
3. **Check the status badge** at the top:
   - ⚠️ **"Paused"** → Click **"Resume"** button
   - ❌ **"Inactive"** → Click **"Restore"** button
   - ✅ **"Active"** → Skip to Step 2
4. **Wait 2 minutes** for the database to start up
5. **Refresh the page** - should show "Active" now

---

## Step 2: Test Connection

1. **Visit:** `https://fumari.vercel.app/api/test-db`
2. **Should show:** `"connection": "success"`

If it still fails, continue to Step 3.

---

## Step 3: Verify Connection String (if Step 2 failed)

1. **Go to:** Supabase Dashboard → **Project Settings** → **Database**
2. **Scroll to:** "Connection string" section
3. **Click:** "Session mode" tab (pooler)
4. **Copy** the connection string
5. **Make sure it ends with:** `?sslmode=require`
6. **Update Vercel:**
   - Go to Vercel → Settings → Environment Variables
   - Edit `DATABASE_URL`
   - Paste the connection string
   - Save
7. **Redeploy Vercel**

---

## Step 4: Alternative - Use Direct Connection

If pooler still doesn't work:

1. **In Supabase Dashboard** → Settings → Database
2. **Click:** "Direct connection" tab (not Session mode)
3. **Copy** the connection string
4. **Add:** `?sslmode=require` at the end
5. **Update Vercel** `DATABASE_URL`
6. **Redeploy**

**Note:** Direct connection uses port `5432` and host `db.xxxxx.supabase.co` (not pooler)

---

## Step 5: Prevent Future Pauses

Supabase free tier pauses after 7 days of inactivity.

**Options:**

1. **Upgrade to Pro** ($25/month) - Never pauses
2. **Switch to Railway** (see `SWITCH_TO_RAILWAY.md`) - Never pauses, more reliable
3. **Keep project active** - Make requests every few days

---

## 🎯 Quick Checklist

- [ ] Supabase project is **Active** (not paused)
- [ ] Waited **2 minutes** after resuming
- [ ] Tested connection at `/api/test-db`
- [ ] Connection string ends with `?sslmode=require`
- [ ] Vercel `DATABASE_URL` updated
- [ ] Vercel redeployed

---

## Still Not Working?

1. **Check Supabase Dashboard** - Is project really Active?
2. **Check Vercel Runtime Logs** - Any other errors?
3. **Try direct connection** instead of pooler
4. **Switch to Railway** - See `SWITCH_TO_RAILWAY.md`

---

**99% of the time, resuming the Supabase project fixes this!** ✅
