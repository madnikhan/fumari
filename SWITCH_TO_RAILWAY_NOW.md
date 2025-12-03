# Switch to Railway - 5 Minute Setup (RECOMMENDED)

Railway is **MUCH simpler** than Supabase and works with your existing Prisma code. No code changes needed!

## Why Railway?

- ✅ **Never pauses** (unlike Supabase)
- ✅ **Works with Prisma** (same PostgreSQL, just different host)
- ✅ **5 minute setup**
- ✅ **Free tier:** $5 credit/month
- ✅ **No code changes needed** - just update DATABASE_URL

---

## Step 1: Create Railway Account (1 minute)

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with GitHub (easiest)

---

## Step 2: Create PostgreSQL Database (1 minute)

1. In Railway dashboard, click **"New Project"**
2. Click **"Provision PostgreSQL"**
3. Wait 30 seconds
4. Done! Database is created

---

## Step 3: Get Connection String (1 minute)

1. Click on the **PostgreSQL** service
2. Click **"Variables"** tab
3. Find `DATABASE_URL` (automatically created)
4. Click the **eye icon** to reveal it
5. **Copy the connection string**

It looks like:
```
postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway
```

**Note:** Railway connection strings already include SSL, no need to add `?sslmode=require`

---

## Step 4: Update Vercel (1 minute)

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **"Edit"**
4. **Paste Railway connection string**
5. Make sure it's set for **Production**
6. Click **"Save"**

---

## Step 5: Create Tables (1 minute)

Run locally to create tables in Railway:

```bash
# Update .env.local with Railway connection string first
npm run db:push
npm run db:seed
```

---

## Step 6: Redeploy Vercel (1 minute)

1. Go to Vercel → **Deployments**
2. Click **"..."** → **"Redeploy"**
3. Wait for completion
4. **Done!** 🎉

---

## That's It!

Railway is **much simpler** than Supabase:
- ✅ No pausing issues
- ✅ No connection string confusion
- ✅ Works immediately
- ✅ Same Prisma code (no changes needed)

**Total time: 5 minutes**

---

## Railway Pricing

- **Free tier:** $5 credit/month (plenty for development)
- **Hobby:** $5/month (if you exceed free tier)
- **Pro:** $20/month (for production)

For a restaurant POS system, free tier should be enough for testing/demo.

---

**Try Railway - it's the easiest solution and will work immediately!** 🚀

