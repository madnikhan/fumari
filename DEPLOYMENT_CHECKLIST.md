# Production Deployment Checklist

Use this checklist before deploying to Vercel.

## Pre-Deployment

### Database Setup
- [ ] Set up PostgreSQL database (Vercel Postgres, Railway, Supabase, etc.)
- [ ] Copy PostgreSQL connection string
- [ ] Test database connection locally with PostgreSQL
- [ ] Update `prisma/schema.prisma` to use `postgresql` provider (if switching from SQLite)
- [ ] Run `npm run db:generate` to regenerate Prisma Client
- [ ] Run `npm run db:push` or create migrations
- [ ] Run `npm run db:seed` to populate initial data

### Environment Variables
- [ ] Set `DATABASE_URL` in Vercel dashboard (PostgreSQL connection string)
- [ ] Set `NODE_ENV=production` in Vercel dashboard
- [ ] Verify all environment variables are set for Production, Preview, and Development

### Code Review
- [ ] Remove or minimize console.log statements (keep only errors)
- [ ] Verify all API routes have proper error handling
- [ ] Check that sensitive data is not exposed in client-side code
- [ ] Verify authentication is working correctly
- [ ] Test all major features locally

### Security
- [ ] Change default admin password (`admin123`)
- [ ] Verify secure cookies are enabled (automatic in production)
- [ ] Check that HTTPS is enforced (automatic on Vercel)
- [ ] Review API route authentication
- [ ] Verify CORS settings if needed

## Deployment Steps

1. [ ] Push code to GitHub/GitLab/Bitbucket
2. [ ] Import project to Vercel
3. [ ] Configure environment variables in Vercel dashboard
4. [ ] Set build command: `npm run build`
5. [ ] Set install command: `npm install`
6. [ ] Deploy to production
7. [ ] Monitor build logs for errors

## Post-Deployment

### Database Setup
- [ ] Connect to production database
- [ ] Run migrations: `npx prisma migrate deploy` (if using migrations)
- [ ] Or run: `npx prisma db push` (for schema sync)
- [ ] Seed initial data: `npm run db:seed`
- [ ] Verify data was created correctly

### Testing
- [ ] Test login with admin credentials
- [ ] Change admin password
- [ ] Test table management
- [ ] Test order creation
- [ ] Test menu display
- [ ] Test analytics dashboard
- [ ] Test on mobile devices
- [ ] Test on different browsers

### Monitoring
- [ ] Set up Vercel Analytics (optional)
- [ ] Monitor error logs in Vercel dashboard
- [ ] Check database connection health
- [ ] Monitor API response times

## Production Optimizations

Already implemented:
- ✅ Prisma Client generation in build process
- ✅ Production-ready error handling
- ✅ Secure cookie settings
- ✅ Security headers
- ✅ Environment-based configuration
- ✅ Optimized build configuration

## Rollback Plan

If something goes wrong:
1. Check Vercel deployment logs
2. Verify environment variables
3. Check database connection
4. Review recent code changes
5. Rollback to previous deployment if needed

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Detailed deployment guide

