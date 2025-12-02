# 🔧 Fix Database Connection Issues

## Issues Found:

1. **Can't reach database server** - Supabase project might be paused
2. **Connection string format** - Need to verify it matches Vercel

---

## Step 1: Check Supabase Project Status

1. Go to **[supabase.com/dashboard](https://supabase.com/dashboard)**
2. Click on your **"fumari"** project
3. Check if you see **"Paused"** badge or button
4. If paused, click **"Resume project"** or **"Restore"**
5. Wait 2-3 minutes for it to start

---

## Step 2: Verify Connection String in Vercel

From your Vercel screenshot, I see the connection string is:
```
postgresql://postgres:Made!78601in@db.gzoa1qqkdnhoaimltdyw.supabase.co:5432/postgresql?sslmode=require
```

**Notice:** It has `/postgresql` at the end, not `/postgres`

---

## Step 3: Update .env.local with Correct Format

The connection string should be:
```
postgresql://postgres:Made!78601in@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require
```

**Important:**
- Use `/postgres` (not `/postgresql`)
- Make sure Supabase project is **NOT paused**
- Verify the host is correct: `db.gzoalqqkdnhoaimltdyw.supabase.co`

---

## Step 4: Test Connection

After updating `.env.local`:

```bash
# Test if we can connect
npm run db:push
```

If it works, you'll see:
```
✔ Your database is now in sync with your Prisma schema.
```

---

## Step 5: Create Tables and Seed Data

Once connection works:

```bash
# Create tables
npm run db:push

# Add initial data
npm run db:seed
```

---

## Common Issues:

### "Can't reach database server"
- ✅ Check Supabase project is **not paused**
- ✅ Verify connection string is correct
- ✅ Make sure `?sslmode=require` is at the end

### "Invalid URL protocol"
- ✅ Make sure it starts with `postgresql://`
- ✅ Not `file://` or `http://`

### "Authentication failed"
- ✅ Check password is correct
- ✅ Verify username is `postgres`

---

## Quick Fix:

1. **Resume Supabase project** if paused
2. **Copy exact connection string** from Vercel
3. **Update .env.local** with correct format
4. **Run `npm run db:push`** again

---

**Once Supabase is active and connection string is correct, the database setup will work!** 🚀

