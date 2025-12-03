# Railway Database Setup - Step by Step

## ✅ Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Start a New Project"** (big button)
3. Choose **"Sign up with GitHub"** (easiest option)
4. Authorize Railway to access your GitHub account
5. You'll be redirected to Railway dashboard

**Time: 1 minute**

---

## ✅ Step 2: Create PostgreSQL Database

1. In Railway dashboard, click **"New Project"** (top right)
2. Click **"Provision PostgreSQL"** (you'll see it as an option)
3. Wait 30-60 seconds for Railway to create the database
4. You'll see a new PostgreSQL service appear

**Time: 1 minute**

---

## ✅ Step 3: Get Connection String

1. Click on the **PostgreSQL** service (the one you just created)
2. Click the **"Variables"** tab at the top
3. You'll see `DATABASE_URL` listed (Railway creates this automatically)
4. Click the **eye icon** 👁️ next to `DATABASE_URL` to reveal it
5. **Copy the entire connection string**

It will look like:
```
postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway
```

**Important:** Railway connection strings already include SSL, so you don't need to add `?sslmode=require`

**Time: 1 minute**

---

## ✅ Step 4: Update Local .env.local

1. Open your project: `/Users/muhammadmadni/fumari/.env.local`
2. Update `DATABASE_URL` with the Railway connection string:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway
   ```
3. Save the file

**Time: 30 seconds**

---

## ✅ Step 5: Create Database Tables

Run these commands locally to create tables in Railway:

```bash
npm run db:push
npm run db:seed
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Database schema pushed successfully
✔ Database seeded successfully
```

**Time: 1 minute**

---

## ✅ Step 6: Update Vercel Environment Variable

1. Go to **https://vercel.com/dashboard**
2. Click on your **fumari** project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL`:
   - If it exists → Click **"Edit"**
   - If it doesn't exist → Click **"Add New"**
5. **Paste the Railway connection string** (same one from Step 3)
6. **Select environments:**
   - ✅ **Production** (required)
   - ✅ **Preview** (optional)
   - ✅ **Development** (optional)
7. Click **"Save"**

**Time: 1 minute**

---

## ✅ Step 7: Redeploy Vercel

1. Go to Vercel → **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes for build to complete

**Time: 2 minutes**

---

## ✅ Step 8: Test Connection

1. Visit: `https://fumari.vercel.app/api/test-db`
2. You should see:
   ```json
   {
     "success": true,
     "tests": {
       "connection": "success",
       "query": "success: 1 users found"
     }
   }
   ```
3. Try logging in: `https://fumari.vercel.app/login`

**Time: 30 seconds**

---

## 🎉 Done!

Railway is now set up and working! Your app should be fully functional.

---

## Troubleshooting

### If `db:push` fails:
- Check that `.env.local` has the correct Railway connection string
- Make sure Railway database is created and active

### If Vercel still shows errors:
- Verify `DATABASE_URL` in Vercel matches Railway connection string exactly
- Make sure it's set for **Production** environment
- Redeploy Vercel after updating environment variable

### If connection test fails:
- Check Railway dashboard → PostgreSQL service → Make sure it's running
- Verify connection string is correct (no extra spaces or characters)

---

## Railway Dashboard

You can monitor your database at:
- **Railway Dashboard:** https://railway.app/dashboard
- **PostgreSQL Service:** Click on your PostgreSQL service to see logs and metrics

---

**Total time: ~5 minutes. Railway is much simpler than Supabase!** 🚀

