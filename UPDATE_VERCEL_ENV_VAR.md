# 🔄 Update DATABASE_URL in Vercel

## Important: Don't Push .env.local to Git!

✅ `.env.local` is already in `.gitignore` - it won't be committed  
✅ This is correct - it contains your password!

---

## What You Need to Do:

Since you updated `.env.local` locally, you also need to update it in **Vercel** so your deployed site uses the correct connection string.

---

## Step 1: Get Your Updated Connection String

Your `.env.local` now has the correct connection string. Copy it:

```bash
cat .env.local
```

Copy the `DATABASE_URL` value (without the quotes).

---

## Step 2: Update Vercel Environment Variable

1. Go to **[vercel.com/dashboard](https://vercel.com/dashboard)**
2. Click on your **fumari** project
3. Go to **Settings** → **Environment Variables**
4. Find **`DATABASE_URL`**
5. Click the **Edit** icon (pencil)
6. **Replace** the value with your new connection string:
   ```
   postgresql://postgres.iicsqunmzelpqvlotrna:YOUR_PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
   ```
7. Make sure all three checkboxes are selected:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
8. Click **Save**

---

## Step 3: Redeploy (Optional but Recommended)

After updating the environment variable:

1. Go to **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Uncheck **"Use existing Build Cache"** (optional)
5. Click **"Redeploy"**

This ensures your site uses the new connection string.

---

## Step 4: Setup Database (Local)

Now that your `.env.local` is correct, run these commands locally:

```bash
cd /Users/muhammadmadni/fumari

# Create database tables
npm run db:push

# Add initial data
npm run db:seed
```

---

## Summary:

- ❌ **Don't push** `.env.local` to git (it's already ignored)
- ✅ **Do update** `DATABASE_URL` in Vercel environment variables
- ✅ **Do run** `npm run db:push` and `npm run db:seed` locally
- ✅ **Optionally redeploy** Vercel to use the new connection string

---

**Update Vercel's DATABASE_URL, then run the database setup commands locally!** 🚀

