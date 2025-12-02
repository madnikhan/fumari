# 🚀 How to Add Connection String to Vercel

## Step-by-Step Guide

---

## Method 1: During Initial Deployment (Easiest)

### Step 1: Start Deployment

1. Go to **[vercel.com](https://vercel.com)** and sign in
2. Click **"Add New..."** → **"Project"**
3. Find your **"fumrari"** repository and click **"Import"**

### Step 2: Configure Project

You'll see a configuration page. Fill in:

- **Project Name:** `fumari-restaurant` (or keep default)
- **Framework Preset:** Should auto-detect as **Next.js** ✅
- **Root Directory:** `./` (default) ✅
- **Build Command:** `npm run build` (default) ✅
- **Output Directory:** `.next` (default) ✅
- **Install Command:** `npm install` (default) ✅

### Step 3: Add Environment Variables

**Scroll down** to the **"Environment Variables"** section:

1. Click **"Add"** button
2. **Name:** `DATABASE_URL`
3. **Value:** Paste your connection string:
   ```
   postgresql://postgres:your-password@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require
   ```
4. **Important:** Check ALL THREE boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Add"**

### Step 4: Add Another Environment Variable

1. Click **"Add"** again
2. **Name:** `NODE_ENV`
3. **Value:** `production`
4. Check all three boxes (Production, Preview, Development)
5. Click **"Add"**

### Step 5: Deploy!

1. Scroll down and click the big **"Deploy"** button
2. ⏳ Wait 2-5 minutes for deployment
3. Your site will be live!

---

## Method 2: Add After Deployment

If you already deployed without the connection string:

### Step 1: Go to Project Settings

1. Go to your Vercel dashboard
2. Click on your **"fumrari"** project
3. Click **"Settings"** tab (top navigation)

### Step 2: Add Environment Variables

1. Click **"Environment Variables"** in the left sidebar
2. Click **"Add New"** button
3. **Name:** `DATABASE_URL`
4. **Value:** Your connection string
5. Select all environments: ✅ Production, ✅ Preview, ✅ Development
6. Click **"Add"**

### Step 3: Redeploy

1. Go to **"Deployments"** tab
2. Click the **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger redeployment

---

## Visual Guide:

```
Vercel Dashboard
├── Add New Project
│   ├── Import Repository
│   ├── Configure Project
│   └── Environment Variables  ← ADD HERE!
│       ├── Name: DATABASE_URL
│       ├── Value: postgresql://...
│       └── ✅ Production ✅ Preview ✅ Development
└── Deploy
```

---

## What Your Environment Variables Should Look Like:

```
DATABASE_URL = postgresql://postgres:your-password@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require

NODE_ENV = production
```

---

## Important Notes:

1. ✅ **Check all three environments** (Production, Preview, Development)
2. ✅ **Double-check** your connection string is correct
3. ✅ **Make sure** `?sslmode=require` is at the end
4. ✅ **Don't include** spaces or quotes around the value

---

## After Adding Environment Variables:

1. ✅ Deploy (or redeploy if already deployed)
2. ✅ Wait for build to complete
3. ✅ Test your site
4. ✅ Run database setup commands (we'll do this next!)

---

## Next Steps After Deployment:

Once deployed, you'll need to:

1. Set up database tables: `npm run db:push`
2. Seed initial data: `npm run db:seed`

We'll do this after deployment is complete!

---

**Ready to deploy? Follow Method 1 above!** 🚀

