# ⚡ Quick Database Setup (No Vercel CLI Needed)

## You Don't Need Vercel CLI!

Just follow these simple steps:

---

## Step 1: Get DATABASE_URL from Vercel

1. Go to **[vercel.com/dashboard](https://vercel.com/dashboard)**
2. Click on your **fumari** project
3. Go to **Settings** → **Environment Variables**
4. Find **`DATABASE_URL`**
5. Click the **eye icon** to reveal the value
6. **Copy the entire connection string**

---

## Step 2: Set It Locally

1. Open your project folder in terminal:
   ```bash
   cd /Users/muhammadmadni/fumari
   ```

2. Create or edit `.env.local` file:
   ```bash
   nano .env.local
   ```
   
   Or use any text editor to create/edit `.env.local`

3. Add this line (replace with your actual connection string):
   ```
   DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
   ```

4. Save the file

---

## Step 3: Run Database Commands

Run these commands one by one:

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Create all database tables (MOST IMPORTANT!)
npm run db:push

# 3. Add initial data (admin user, tables, menu)
npm run db:seed
```

---

## That's It!

After running `npm run db:push`, your database will be ready!

**Test it:**
- Go to your Vercel site
- Login with: `admin` / `admin123`

---

## If You Get Errors:

**"Can't reach database server"**
- Double-check your DATABASE_URL is correct
- Make sure Supabase project is not paused
- Verify `?sslmode=require` is at the end

**"Table already exists"**
- That's fine! Just run `npm run db:seed` to add data

---

**You don't need Vercel CLI - just copy the DATABASE_URL and run the commands!** 🚀

