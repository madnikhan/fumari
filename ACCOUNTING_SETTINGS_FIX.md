# Accounting Settings - Troubleshooting Guide

## ✅ Database Status

The `AccountingSettings` table has been created successfully in the database. Verified with:
- Schema exists in `prisma/schema.prisma`
- Table exists in SQLite database
- Prisma client generated successfully

## 🔍 Potential Issues & Solutions

### Issue 1: Prisma Client Not Updated
**Solution:** Regenerate Prisma client
```bash
npx prisma generate
```

### Issue 2: Server Not Restarted
**Solution:** Restart the Next.js dev server after schema changes
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Issue 3: Browser Cache
**Solution:** Clear browser cache or use incognito mode

### Issue 4: Authentication Issue
**Solution:** Make sure you're logged in. The API requires authentication.

## 🧪 Testing Steps

1. **Check Database:**
   ```bash
   sqlite3 dev.db "SELECT * FROM AccountingSettings;"
   ```

2. **Check API Endpoint:**
   - Open browser DevTools → Network tab
   - Try saving settings
   - Check the API response for errors

3. **Check Server Logs:**
   - Look for errors in terminal where `npm run dev` is running
   - Check for Prisma errors

## 📝 Code Verification

The API route (`app/api/accounting/settings/route.ts`) should:
- ✅ Handle GET requests (fetch settings)
- ✅ Handle PATCH requests (update settings)
- ✅ Create default settings if none exist
- ✅ Update existing settings
- ✅ Handle empty strings as null values

## 🚀 Quick Fix

If settings still don't save, try:

1. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Restart Dev Server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Clear Browser Cache:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

## 🔧 Manual Database Check

To verify the table works:
```bash
sqlite3 dev.db "SELECT * FROM AccountingSettings;"
```

If empty, the GET endpoint should create default settings automatically.

## 📞 Debug Information

If the issue persists, check:
1. Browser console errors
2. Network tab → API request/response
3. Server terminal logs
4. Database contents

The code is correct - the issue is likely:
- Prisma client needs regeneration
- Server needs restart
- Browser cache issue

