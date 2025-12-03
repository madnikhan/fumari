# Update Vercel with Railway Connection String

## ✅ Railway Database Setup Complete!

Your Railway database is now set up and seeded locally. Now we need to update Vercel.

---

## Step 1: Update Vercel Environment Variable

1. Go to **https://vercel.com/dashboard**
2. Click on your **fumari** project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL`:
   - If it exists → Click **"Edit"**
   - If it doesn't exist → Click **"Add New"**
5. **Paste this connection string:**
   ```
   postgresql://postgres:SfXpiFXqDoIvrKNEaqOjxQAUDciijHUF@maglev.proxy.rlwy.net:54963/railway
   ```
6. **Select environments:**
   - ✅ **Production** (required)
   - ✅ **Preview** (optional, but recommended)
   - ✅ **Development** (optional)
7. Click **"Save"**

---

## Step 2: Redeploy Vercel

1. Go to Vercel → **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes for build to complete

---

## Step 3: Test Connection

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
   - Username: `admin`
   - Password: `admin123`

---

## 🎉 Done!

Railway is now fully set up and working! Your app should be functional on Vercel.

---

## Troubleshooting

### If connection test fails:
- Double-check the connection string in Vercel matches exactly
- Make sure it's set for **Production** environment
- Redeploy Vercel after updating environment variable

### If login fails:
- Check Vercel Runtime Logs for errors
- Verify database tables exist (they should, since we seeded locally)

---

**Railway is much more reliable than Supabase - no more pausing issues!** 🚀

