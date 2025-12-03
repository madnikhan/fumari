# Diagnose Supabase Connection Issues

## Quick Diagnostic Steps

### 1. Check Supabase Project Status

**Go to:** https://supabase.com/dashboard

**Look for:**
- ✅ **Green "Active" badge** → Project is running
- ⚠️ **Yellow "Paused" badge** → Click "Resume"
- ❌ **Red "Inactive" badge** → Click "Restore"

**If paused/inactive:** Wait 2 minutes after resuming before testing.

---

### 2. Test Database Connection via API

**Visit:** `https://fumari.vercel.app/api/test-db`

**Expected response:**
```json
{
  "success": true,
  "tests": {
    "databaseUrl": {
      "exists": true,
      "host": "aws-1-us-east-2.pooler.supabase.com",
      "port": "5432",
      "database": "/postgres"
    },
    "connection": "success",
    "query": "success: 1 users found",
    "userCount": 1,
    "prismaStatus": {
      "isConnected": true
    }
  }
}
```

**If you see errors:**
- `connection: "failed: P1001"` → Can't reach database (project paused or wrong host)
- `connection: "failed: P1000"` → Authentication failed (wrong password)
- `databaseUrl.exists: false` → DATABASE_URL not set in Vercel

---

### 3. Verify Vercel Environment Variable

**Go to:** Vercel → Settings → Environment Variables

**Check:**
- ✅ `DATABASE_URL` exists
- ✅ Value starts with `postgresql://`
- ✅ Value ends with `?sslmode=require`
- ✅ Password is correct (no `[YOUR-PASSWORD]` placeholder)
- ✅ Set for **Production** environment

**Format should be:**
```
postgresql://postgres.iicsqunmzelpqvlotrna:ACTUAL-PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
```

---

### 4. Check Vercel Runtime Logs

**Go to:** Vercel → Deployments → Latest → Runtime Logs

**Look for:**
- `PrismaClientInitializationError` → Database connection issue
- `P1001` → Can't reach database server
- `P1000` → Authentication failed
- `P1017` → Server closed connection (missing SSL)

---

### 5. Verify Database Tables Exist

**Go to:** Supabase Dashboard → Table Editor

**Check if you see:**
- ✅ `User` table
- ✅ `Table` table
- ✅ `Order` table
- ✅ Other tables from schema

**If tables don't exist:**
```bash
# Run locally (make sure .env.local has Supabase connection string)
npm run db:push
npm run db:seed
```

---

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `P1001` | Can't reach database server | Resume Supabase project OR check connection string host |
| `P1000` | Authentication failed | Reset password in Supabase → Update Vercel DATABASE_URL |
| `P1017` | Server closed connection | Add `?sslmode=require` to connection string |
| `P1002` | Connection timeout | Check if Supabase project is active |
| `P2002` | Unique constraint violation | Database issue (usually OK, means connection works) |

---

## Quick Fix Checklist

- [ ] Supabase project is **Active** (not paused)
- [ ] Connection string has **correct password** (no placeholders)
- [ ] Connection string ends with **`?sslmode=require`**
- [ ] Vercel `DATABASE_URL` is set for **Production**
- [ ] Database tables exist in Supabase
- [ ] Vercel redeployed after setting DATABASE_URL
- [ ] Test endpoint `/api/test-db` shows success

---

## Still Not Working?

1. **Check exact error** in Vercel Runtime Logs
2. **Test connection** at `/api/test-db`
3. **Verify connection string** format matches exactly
4. **Try direct connection** instead of pooler (change port/host)
5. **Consider switching to Railway** (see `SWITCH_TO_RAILWAY.md`)

---

**Follow these steps to identify the exact issue!** 🔍

