# ✅ Vercel Deployment Checklist

Use this checklist to track your deployment progress!

## Pre-Deployment

- [ ] Code is pushed to GitHub
- [ ] Prisma schema updated to PostgreSQL (`provider = "postgresql"`)
- [ ] Changes committed and pushed to GitHub

## Step 1: Database Setup

- [ ] Created Supabase account
- [ ] Created new Supabase project
- [ ] Got database connection string
- [ ] Added `?sslmode=require` to connection string
- [ ] Saved connection string securely

## Step 2: Vercel Setup

- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Configured project settings
- [ ] Added `DATABASE_URL` environment variable
- [ ] Added `NODE_ENV=production` environment variable
- [ ] Started deployment

## Step 3: Database Initialization

- [ ] Installed Vercel CLI (optional)
- [ ] Linked project with `vercel link`
- [ ] Set DATABASE_URL locally
- [ ] Ran `npm run db:generate`
- [ ] Ran `npm run db:push`
- [ ] Ran `npm run db:seed`

## Step 4: Testing

- [ ] Site loads at Vercel URL
- [ ] Login page displays
- [ ] Can login with admin/admin123
- [ ] Dashboard loads
- [ ] Tables page works
- [ ] Menu displays
- [ ] Can create orders
- [ ] Kitchen panel accessible
- [ ] Buzzer system works
- [ ] Accounting system accessible

## Step 5: Security

- [ ] Changed admin password
- [ ] Changed accounting password (if applicable)
- [ ] Reviewed environment variables
- [ ] Verified HTTPS is enabled

## Post-Deployment

- [ ] Bookmarked Vercel dashboard
- [ ] Bookmarked Supabase dashboard
- [ ] Saved deployment URL
- [ ] Tested on mobile device
- [ ] Shared URL with team/client

---

**Deployment Date:** _______________

**Vercel URL:** _______________

**Supabase Project:** _______________

**Admin Password Changed:** Yes / No

---

## Quick Commands Reference

```bash
# Set database URL
export DATABASE_URL="your-connection-string-here"

# Generate Prisma Client
npm run db:generate

# Create tables
npm run db:push

# Add initial data
npm run db:seed
```

---

**🎉 Deployment Complete!**
