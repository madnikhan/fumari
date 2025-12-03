# Database Setup Guide

This guide explains how to configure databases for different environments.

## Database Configuration

### Local Development (Localhost)
- **Database:** SQLite (local file)
- **File:** `dev.db` (created automatically)
- **No setup required** - works out of the box!

### Vercel Deployment (Production)
- **Database:** Railway PostgreSQL
- **Connection:** Set via Vercel environment variables
- **Setup:** Configure in Vercel dashboard

---

## Local Development Setup

### Option 1: Use SQLite (Recommended for Local)

**Switch to SQLite for local development:**

1. **Switch schema to SQLite:**
   ```bash
   npm run db:switch-sqlite
   ```

2. **Remove DATABASE_URL from .env.local** (or comment it out):
   ```env
   # DATABASE_URL=postgresql://...  # Commented out for local SQLite
   NODE_ENV=development
   ```

3. **Create database tables:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Database file created:**
   - Location: `dev.db` (in project root)
   - This file is local to your machine
   - Already in `.gitignore` (won't be committed)

5. **Start development server:**
   ```bash
   npm run dev
   ```

**Advantages:**
- ✅ No external database needed
- ✅ Fast and simple
- ✅ Works offline
- ✅ Perfect for local development
- ✅ Completely separate from Vercel/Railway

**To switch back to PostgreSQL (for Vercel):**
```bash
npm run db:switch-postgresql
```

---

### Option 2: Use Local PostgreSQL (Advanced)

If you prefer PostgreSQL for local development:

1. **Install PostgreSQL locally:**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Create database
   createdb fumari_dev
   ```

2. **Set DATABASE_URL in .env.local:**
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/fumari_dev
   NODE_ENV=development
   ```

3. **Create tables:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

---

## Vercel Deployment Setup

### Railway PostgreSQL (Production)

1. **Get Railway Connection String:**
   - Go to Railway dashboard
   - Copy PostgreSQL connection string
   - Format: `postgresql://postgres:PASSWORD@host:port/railway`

2. **Set in Vercel Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add/Update `DATABASE_URL`:
     ```
     postgresql://postgres:PASSWORD@maglev.proxy.rlwy.net:54963/railway
     ```
   - Select environments: Production, Preview, Development
   - Save

3. **Deploy:**
   - Vercel will automatically use Railway PostgreSQL
   - No local database needed

---

## Environment Variables

### .env.local (Local Development)

**For SQLite (Default):**
```env
# Don't set DATABASE_URL - system will use SQLite automatically
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**For PostgreSQL (Optional):**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/fumari_dev
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Vercel Environment Variables

**For Production:**
```env
DATABASE_URL=postgresql://postgres:PASSWORD@maglev.proxy.rlwy.net:54963/railway
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://fumari.vercel.app
```

---

## How It Works

The system automatically detects which database to use:

1. **Check DATABASE_URL:**
   - If set → Use that database (PostgreSQL or SQLite)
   - If not set → Use SQLite for local development

2. **Check Environment:**
   - Production/Vercel → Requires DATABASE_URL (PostgreSQL)
   - Development → Falls back to SQLite if DATABASE_URL not set

3. **Database Provider:**
   - PostgreSQL URLs: `postgresql://` or `postgres://`
   - SQLite URLs: `file:`

---

## Switching Between Databases

### Switch from PostgreSQL to SQLite (Local Development)

1. **Switch schema to SQLite:**
   ```bash
   npm run db:switch-sqlite
   ```

2. **Comment out DATABASE_URL in .env.local:**
   ```env
   # DATABASE_URL=postgresql://...  # Commented for SQLite
   ```

3. **Delete old database (optional):**
   ```bash
   rm dev.db
   ```

4. **Create new SQLite database:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Switch from SQLite to PostgreSQL (For Vercel)

1. **Switch schema to PostgreSQL:**
   ```bash
   npm run db:switch-postgresql
   ```

2. **Set DATABASE_URL in .env.local (if testing locally):**
   ```env
   DATABASE_URL=postgresql://postgres:PASSWORD@maglev.proxy.rlwy.net:54963/railway
   ```

3. **Or set in Vercel environment variables (for deployment)**

4. **Create tables in Railway:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

---

## Troubleshooting

### "DATABASE_URL is required in production"

**Problem:** Running in production mode without DATABASE_URL

**Solution:**
- Set `NODE_ENV=development` in `.env.local` for local development
- Or set `DATABASE_URL` to Railway PostgreSQL

### "Can't connect to database"

**Problem:** DATABASE_URL points to Railway but you're offline

**Solution:**
- Remove DATABASE_URL from `.env.local` to use SQLite
- Or ensure you have internet connection for Railway

### "Database locked" (SQLite)

**Problem:** Multiple processes accessing SQLite database

**Solution:**
- Close other instances of the app
- Restart development server

### Wrong database being used

**Problem:** System using Railway when you want SQLite (or vice versa)

**Solution:**
- Check `.env.local` for DATABASE_URL
- Remove it for SQLite, or set it for PostgreSQL
- Restart development server

---

## Best Practices

1. **Local Development:**
   - ✅ Use SQLite (default, no setup)
   - ✅ Keep `.env.local` without DATABASE_URL
   - ✅ `dev.db` is already in `.gitignore`

2. **Vercel Deployment:**
   - ✅ Use Railway PostgreSQL
   - ✅ Set DATABASE_URL in Vercel environment variables
   - ✅ Never commit DATABASE_URL to git

3. **Database Files:**
   - ✅ `dev.db` (SQLite) - local only, in `.gitignore`
   - ✅ Never commit database files
   - ✅ Backup important data before switching databases

---

## Summary

| Environment | Database | Configuration |
|------------|----------|---------------|
| **Local Development** | SQLite | No DATABASE_URL needed |
| **Local Development (Optional)** | PostgreSQL | Set DATABASE_URL in .env.local |
| **Vercel Production** | Railway PostgreSQL | Set DATABASE_URL in Vercel |

**Recommended Setup:**
- **Local:** SQLite (default, no config)
- **Vercel:** Railway PostgreSQL (via environment variables)

---

**Quick Start:**

1. **For local development:**
   ```bash
   # Remove DATABASE_URL from .env.local (or comment it out)
   npm run dev
   npm run db:push
   npm run db:seed
   ```

2. **For Vercel:**
   - Set DATABASE_URL in Vercel environment variables
   - Deploy - Railway PostgreSQL will be used automatically

