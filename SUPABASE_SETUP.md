# Supabase Setup Guide

This guide will help you set up Supabase as your PostgreSQL database for the Fumari Restaurant Management System.

## Step 1: Create Supabase Account and Project

1. **Sign up for Supabase**:
   - Go to [https://supabase.com](https://supabase.com)
   - Click **Start your project** or **Sign up**
   - Sign up with GitHub, Google, or email

2. **Create a New Project**:
   - Click **New Project**
   - Fill in the details:
     - **Name**: `fumari-restaurant` (or your preferred name)
     - **Database Password**: Create a strong password (save this!)
     - **Region**: Choose closest to your users (e.g., `London (eu-west-2)` for UK)
     - **Pricing Plan**: Free tier is fine to start
   - Click **Create new project**
   - Wait 2-3 minutes for the project to be created

## Step 2: Get Database Connection String

1. **Navigate to Project Settings**:
   - In your Supabase dashboard, click **Settings** (gear icon)
   - Click **Database** in the left sidebar

2. **Find Connection String**:
   - Scroll down to **Connection string** section
   - Select **URI** tab
   - Copy the connection string (it looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```

3. **Replace Password**:
   - Replace `[YOUR-PASSWORD]` with the database password you set when creating the project
   - Add SSL mode: `?sslmode=require` at the end
   - Final connection string should look like:
     ```
     postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres?sslmode=require
     ```

## Step 3: Update Prisma Schema for PostgreSQL

1. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Note**: The schema is already compatible with PostgreSQL, you just need to change the provider.

## Step 4: Configure Environment Variables

### For Local Development

1. **Create `.env.local`** (if not exists):
   ```bash
   DATABASE_URL="postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
   NODE_ENV="development"
   ```

2. **Or update existing `.env.local`**:
   - Replace the SQLite `DATABASE_URL` with your Supabase PostgreSQL connection string

### For Vercel Deployment

1. **In Vercel Dashboard**:
   - Go to your project → **Settings** → **Environment Variables**
   - Add:
     - **Name**: `DATABASE_URL`
     - **Value**: Your Supabase connection string
     - **Environment**: Production, Preview, Development (select all)
   - Click **Save**

## Step 5: Generate Prisma Client

```bash
npm run db:generate
```

This will regenerate the Prisma Client for PostgreSQL.

## Step 6: Push Schema to Supabase

```bash
npm run db:push
```

This will create all tables in your Supabase database.

**Alternative: Use Migrations** (Recommended for production):

```bash
# Create initial migration
npx prisma migrate dev --name init

# Apply migrations (for production)
npx prisma migrate deploy
```

## Step 7: Seed Initial Data

```bash
npm run db:seed
```

This will populate your database with:
- Default admin user (username: `admin`, password: `admin123`)
- Restaurant sections
- 50 tables
- Staff members
- Menu categories and items

## Step 8: Verify Connection

1. **Test locally**:
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Login with admin credentials
   - Verify data is loading correctly

2. **Check Supabase Dashboard**:
   - Go to **Table Editor** in Supabase dashboard
   - You should see all your tables (User, Table, MenuItem, etc.)
   - Verify data was seeded correctly

## Step 9: Configure Supabase Security (Optional but Recommended)

1. **Row Level Security (RLS)**:
   - Supabase enables RLS by default
   - For this application, you can disable RLS on tables since authentication is handled by Next.js
   - Or configure RLS policies if you want database-level security

2. **Connection Pooling**:
   - Supabase provides connection pooling
   - Use the **Connection Pooling** connection string for better performance:
     - Go to **Settings** → **Database** → **Connection string**
     - Select **Connection pooling** tab
     - Use port `6543` instead of `5432`
     - Format: `postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres?sslmode=require`

## Step 10: Deploy to Vercel

1. **Set Environment Variable in Vercel**:
   - Use your Supabase connection string as `DATABASE_URL`

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Run Migrations After Deployment**:
   - Connect to your Supabase database
   - Run: `npx prisma migrate deploy`

4. **Seed Production Database**:
   ```bash
   # Set DATABASE_URL environment variable
   export DATABASE_URL="your-supabase-connection-string"
   npm run db:seed
   ```

## Troubleshooting

### Connection Issues

**Error: "Connection refused"**
- Check that your IP is allowed in Supabase (Settings → Database → Connection pooling)
- Verify the connection string is correct
- Ensure SSL mode is set: `?sslmode=require`

**Error: "Password authentication failed"**
- Verify the password in the connection string matches your database password
- Check for special characters that need URL encoding

**Error: "SSL required"**
- Add `?sslmode=require` to the end of your connection string

### Migration Issues

**Error: "Migration failed"**
- Check Supabase logs in the dashboard
- Verify you have the correct permissions
- Try `prisma db push` instead of migrations for initial setup

### Performance Issues

- Use connection pooling (port 6543) instead of direct connection (port 5432)
- Enable connection pooling in Supabase dashboard
- Monitor query performance in Supabase dashboard → Database → Query Performance

## Supabase Dashboard Features

Once set up, you can use Supabase features:

1. **Table Editor**: View and edit data directly
2. **SQL Editor**: Run custom SQL queries
3. **Database**: View schema, indexes, and relationships
4. **Logs**: Monitor database activity
5. **Backups**: Automatic daily backups (on paid plans)

## Connection String Formats

### Direct Connection (Development)
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### Connection Pooling (Production - Recommended)
```
postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres?sslmode=require
```

### With Connection Pooling Mode
```
postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres?sslmode=require&pgbouncer=true
```

## Free Tier Limits

Supabase Free Tier includes:
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth
- ✅ Unlimited API requests
- ✅ Automatic backups (7 days retention)

For production with high traffic, consider upgrading to Pro plan.

## Next Steps

After setting up Supabase:

1. ✅ Test the connection locally
2. ✅ Verify all tables are created
3. ✅ Seed initial data
4. ✅ Deploy to Vercel with Supabase connection string
5. ✅ Change admin password immediately
6. ✅ Set up monitoring and backups

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Prisma + Supabase**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-supabase
- **Supabase Discord**: https://discord.supabase.com

