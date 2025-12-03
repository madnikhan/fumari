# Complete Supabase Fix - Step by Step

## 🔍 Issues Found

1. **prisma.config.ts** has SQLite fallback that might interfere
2. **Connection string** might be missing `?sslmode=require`
3. **Supabase project** might be paused
4. **Vercel environment variable** might not be set correctly

---

## ✅ Step 1: Fix prisma.config.ts

The config file has been updated to be more explicit about production vs development.

---

## ✅ Step 2: Verify Supabase Project Status

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Find your project (should show project name)
3. **Check the status badge** at the top:
   - ✅ **"Active"** → Continue to Step 3
   - ⚠️ **"Paused"** → Click **"Resume"** → Wait 2 minutes → Continue to Step 3
   - ❌ **"Inactive"** → Click **"Restore"** → Wait 2 minutes → Continue to Step 3

---

## ✅ Step 3: Get Correct Connection String

### Option A: Connection Pooler (Recommended for Vercel)

1. In Supabase Dashboard → **Project Settings** (gear icon)
2. Click **"Database"** in left sidebar
3. Scroll to **"Connection string"** section
4. Click **"Session mode"** tab (this is the pooler)
5. Copy the connection string - it should look like:
   ```
   postgresql://postgres.iicsqunmzelpqvlotrna:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** with your actual database password
   - If you forgot it: Settings → Database → Reset database password
7. **Add `?sslmode=require`** at the end:
   ```
   postgresql://postgres.iicsqunmzelpqvlotrna:YOUR-PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
   ```

### Option B: Direct Connection (Alternative)

1. Same steps as above, but click **"Direct connection"** tab
2. Copy the connection string
3. Replace password and add SSL:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.iicsqunmzelpqvlotrna.supabase.co:5432/postgres?sslmode=require
   ```

**Note:** Use **Session mode (pooler)** for Vercel - it's more reliable.

---

## ✅ Step 4: Update Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **fumari** project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL`:
   - If it exists → Click **"Edit"**
   - If it doesn't exist → Click **"Add New"**
5. **Paste the connection string** from Step 3 (with `?sslmode=require`)
6. **Select environments:**
   - ✅ Production
   - ✅ Preview (optional)
   - ✅ Development (optional)
7. Click **"Save"**

---

## ✅ Step 5: Verify Connection String Format

Your `DATABASE_URL` should look exactly like this:

```
postgresql://postgres.iicsqunmzelpqvlotrna:YOUR-PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
```

**Checklist:**
- ✅ Starts with `postgresql://`
- ✅ Has `.pooler.supabase.com` (for pooler) OR `db.xxxxx.supabase.co` (for direct)
- ✅ Port is `5432` (pooler) OR `5432` (direct)
- ✅ Ends with `?sslmode=require`
- ✅ Password is correct (no brackets `[]`)

---

## ✅ Step 6: Create Database Tables

After setting up the connection string, create tables:

```bash
# Make sure .env.local has the Supabase connection string
npm run db:push
npm run db:seed
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Database schema pushed successfully
✔ Database seeded successfully
```

---

## ✅ Step 7: Redeploy Vercel

1. Go to Vercel → **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete (2-3 minutes)

---

## ✅ Step 8: Test Connection

1. Visit your Vercel app: `https://fumari.vercel.app`
2. Try logging in
3. If it works → ✅ **Success!**
4. If it fails → Check Step 9

---

## ✅ Step 9: Debug Connection Issues

### Check Vercel Runtime Logs

1. Go to Vercel → **Deployments**
2. Click on latest deployment
3. Click **"Runtime Logs"** tab
4. Look for errors containing:
   - `P1001` → Can't reach database server
   - `P1000` → Authentication failed
   - `P1017` → Server closed connection

### Test Database Connection

Visit: `https://fumari.vercel.app/api/test-db`

This will show:
- ✅ DATABASE_URL status
- ✅ Connection test result
- ✅ Query test result
- ✅ User count

### Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `P1001: Can't reach database server` | Supabase paused OR wrong host | Resume Supabase OR check connection string |
| `P1000: Authentication failed` | Wrong password | Reset password in Supabase → Update Vercel |
| `P1017: Server closed connection` | Missing SSL | Add `?sslmode=require` to connection string |
| `Connection timeout` | Wrong port | Use port `5432` for pooler, `5432` for direct |

---

## ✅ Step 10: Prevent Supabase from Pausing

Supabase free tier pauses after 7 days of inactivity.

**Solutions:**

1. **Upgrade to Pro** ($25/month) - Never pauses
2. **Use Railway** (see `SWITCH_TO_RAILWAY.md`) - More reliable
3. **Use Neon** (see alternatives) - Serverless, never pauses
4. **Keep project active** - Make requests every few days

---

## 🎯 Quick Checklist

- [ ] Supabase project is **Active** (not paused)
- [ ] Connection string has **correct password**
- [ ] Connection string ends with **`?sslmode=require`**
- [ ] Vercel `DATABASE_URL` is set for **Production**
- [ ] Database tables created (`npm run db:push`)
- [ ] Database seeded (`npm run db:seed`)
- [ ] Vercel redeployed
- [ ] Test connection works (`/api/test-db`)

---

## 🚀 If Still Not Working

1. **Check Vercel Runtime Logs** for exact error
2. **Test connection** at `/api/test-db`
3. **Verify Supabase project** is active
4. **Double-check connection string** format
5. **Consider switching to Railway** (see `SWITCH_TO_RAILWAY.md`)

---

**You're all set! Follow these steps in order and your Supabase connection should work.** 🎉

