# Vercel Deployment Guide

This guide will help you deploy the Fumari Restaurant Management System to Vercel.

## Prerequisites

1. A Vercel account ([sign up here](https://vercel.com))
2. A PostgreSQL database (Vercel Postgres recommended, or use Railway, Supabase, etc.)

## Step 1: Set Up PostgreSQL Database

**Option A: Supabase (Recommended - Free & Easy)**

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to **Settings** → **Database** → Copy connection string
4. Add `?sslmode=require` to the connection string
5. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions

**Option B: Vercel Postgres**

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database** → Select **Postgres**
3. Choose a name and region
4. Copy the `POSTGRES_PRISMA_URL` or `DATABASE_URL` connection string

**Option C: Other External PostgreSQL**

Use services like:
- [Railway](https://railway.app) - Free tier available
- [Neon](https://neon.tech) - Free tier available
- [Render](https://render.com) - Free tier available

## Step 2: Update Prisma Schema for PostgreSQL

The schema is already configured to use `env("DATABASE_URL")`, so it will automatically use PostgreSQL when you provide a PostgreSQL connection string.

If you need to switch from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update any SQLite-specific features (like `@default(autoincrement())` for Int IDs)

## Step 3: Deploy to Vercel

### Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure project settings (see below)
5. Deploy

## Step 4: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

   ```
   DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
   NODE_ENV=production
   ```

3. Make sure to add them for **Production**, **Preview**, and **Development** environments

## Step 5: Configure Build Settings

In Vercel project settings:

1. **Build Command**: `npm run build` (default)
2. **Output Directory**: `.next` (default)
3. **Install Command**: `npm install` (default)
4. **Node.js Version**: 20.x or higher

## Step 6: Run Database Migrations

After deployment, you need to set up your database:

### Option A: Using Vercel CLI

```bash
# Set environment variables locally
export DATABASE_URL="your-postgres-connection-string"

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

### Option B: Using Vercel Postgres

1. Connect to your Vercel Postgres database
2. Run migrations manually or use Prisma Migrate:
   ```bash
   npx prisma migrate deploy
   ```

## Step 7: Seed Initial Data

After setting up the database, seed it with initial data:

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your-postgres-connection-string"

# Run seed script
npm run db:seed
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

## Step 8: Verify Deployment

1. Visit your Vercel deployment URL
2. Login with admin credentials
3. Verify all features work:
   - Tables page loads
   - Menu displays correctly
   - Orders can be created
   - Analytics dashboard works

## Post-Deployment Checklist

- [ ] Database is connected and working
- [ ] Admin user can login
- [ ] All pages load correctly
- [ ] API routes are working
- [ ] Environment variables are set
- [ ] Admin password has been changed
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Custom domain configured (optional)

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly in Vercel environment variables
- Check that your database allows connections from Vercel IPs
- Ensure SSL is enabled if required: `?sslmode=require`

### Build Failures

- Check that all dependencies are in `package.json`
- Verify Node.js version is 20.x or higher
- Check build logs in Vercel dashboard for specific errors

### Prisma Client Errors

- Ensure `postinstall` script runs: `prisma generate`
- Check that Prisma Client is generated before build
- Verify `DATABASE_URL` is accessible during build

### Authentication Issues

- Verify cookies are set correctly (check browser console)
- Ensure `NODE_ENV=production` is set
- Check that secure cookies work with HTTPS

## Production Optimizations

The following optimizations are already in place:

- ✅ Prisma connection pooling
- ✅ Error handling and logging
- ✅ Secure cookie settings
- ✅ Environment-based configuration
- ✅ Production-ready build configuration

## Monitoring

Consider adding:

- **Vercel Analytics**: Built-in analytics
- **Sentry**: Error tracking
- **Logtail**: Log aggregation
- **Uptime monitoring**: Status page

## Support

For issues specific to:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Prisma**: Check [Prisma Documentation](https://www.prisma.io/docs)
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)

