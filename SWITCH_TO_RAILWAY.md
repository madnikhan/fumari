# Switch from Supabase to Railway (Step-by-Step)

Railway is simpler and more reliable than Supabase for PostgreSQL databases.

## Why Railway?

- ✅ **Never pauses** (unlike Supabase free tier)
- ✅ **Simpler setup** (fewer configuration issues)
- ✅ **More reliable** (better uptime)
- ✅ **Free tier**: $5 credit/month (plenty for development)
- ✅ **Works perfectly with Prisma**

---

## Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with GitHub (easiest)

---

## Step 2: Create PostgreSQL Database

1. In Railway dashboard, click **"New Project"**
2. Click **"Provision PostgreSQL"**
3. Wait 30 seconds for it to create
4. Click on the PostgreSQL service

---

## Step 3: Get Connection String

1. Click **"Variables"** tab
2. Find `DATABASE_URL` (it's automatically created)
3. Click the **eye icon** to reveal it
4. Copy the connection string
5. It will look like:
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:5432/railway
   ```

**Note:** Railway connection strings already include SSL, so you don't need to add `?sslmode=require`

---

## Step 4: Update Vercel Environment Variable

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **"Edit"**
4. Paste the Railway connection string
5. Make sure it's set for **"Production"** environment
6. Click **"Save"**

---

## Step 5: Create Database Tables

Run locally to create tables in Railway:

```bash
# Make sure your .env.local has the Railway connection string
npm run db:push
npm run db:seed
```

---

## Step 6: Redeploy Vercel

1. Go to Vercel → **Deployments**
2. Click **"..."** → **"Redeploy"**
3. Wait for completion
4. Try logging in!

---

## That's It!

Railway is much simpler than Supabase and won't pause. Your app should work reliably now.

---

## Railway Pricing

- **Free tier**: $5 credit/month (plenty for development)
- **Hobby**: $5/month (if you exceed free tier)
- **Pro**: $20/month (for production apps)

For a restaurant POS system, the free tier should be enough for testing/demo.

