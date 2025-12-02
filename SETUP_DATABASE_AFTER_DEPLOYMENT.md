# 🗄️ Setup Database After Vercel Deployment

## Problem:
✅ Project deployed successfully  
❌ Database error when logging in  
**Reason:** Database tables haven't been created yet!

---

## Solution: Create Database Tables

You need to run Prisma commands to create the database tables. Here are your options:

---

## Option 1: Using Vercel CLI (Recommended)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Link Your Project

```bash
cd /Users/muhammadmadni/fumari
vercel link
```

- Select your project when prompted
- Keep defaults for other questions

### Step 4: Pull Environment Variables

```bash
vercel env pull .env.local
```

This will download your `DATABASE_URL` from Vercel to a local `.env.local` file.

### Step 5: Run Database Setup Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create all database tables
npm run db:push

# Add initial data (admin user, tables, menu items)
npm run db:seed
```

---

## Option 2: Manual Setup (If CLI doesn't work)

### Step 1: Get Your DATABASE_URL from Vercel

1. Go to Vercel dashboard → Your project
2. Go to **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. Copy the value

### Step 2: Set It Locally

Create or edit `.env.local` file:

```bash
DATABASE_URL="your-connection-string-here"
```

### Step 3: Run Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create all database tables
npm run db:push

# Add initial data
npm run db:seed
```

---

## Option 3: Create a Database Setup API Route (Advanced)

If you want to set up the database through the web interface, we can create a one-time setup route.

---

## What Each Command Does:

1. **`npm run db:generate`**
   - Generates Prisma Client based on your schema
   - Required before using the database

2. **`npm run db:push`**
   - Creates all database tables in your Supabase database
   - Pushes your Prisma schema to the database
   - **This is the most important step!**

3. **`npm run db:seed`**
   - Adds initial data:
     - Admin user (username: `admin`, password: `admin123`)
     - Sample tables
     - Sample menu items
   - Makes your system ready to use

---

## Verify It Worked:

After running the commands:

1. Go to your Supabase dashboard
2. Go to **Table Editor**
3. You should see tables like:
   - `User`
   - `Table`
   - `MenuCategory`
   - `MenuItem`
   - `Order`
   - `AccountingSettings`
   - etc.

4. Try logging in to your Vercel site:
   - Username: `admin`
   - Password: `admin123`

---

## Troubleshooting:

### Error: "Can't reach database server"
- Check your `DATABASE_URL` is correct
- Make sure Supabase project is not paused
- Verify `?sslmode=require` is at the end of connection string

### Error: "Table already exists"
- That's okay! Tables are already created
- Just run `npm run db:seed` to add initial data

### Error: "Prisma Client not generated"
- Run `npm run db:generate` first
- Then try again

---

## Quick Checklist:

- [ ] Installed Vercel CLI (or got DATABASE_URL manually)
- [ ] Set DATABASE_URL locally
- [ ] Ran `npm run db:generate`
- [ ] Ran `npm run db:push` ✅ **Most Important!**
- [ ] Ran `npm run db:seed`
- [ ] Verified tables exist in Supabase
- [ ] Tested login on Vercel site

---

**Once you run `npm run db:push`, your database will be ready and the login should work!** 🚀

