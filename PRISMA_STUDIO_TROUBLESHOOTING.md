# Prisma Studio Troubleshooting Guide

## Error: "Unable to communicate with Prisma Client"

### Quick Fix

1. **Stop Prisma Studio:**
   ```bash
   pkill -f "prisma studio"
   ```

2. **Regenerate Prisma Client:**
   ```bash
   npm run db:generate
   ```

3. **Restart Prisma Studio:**
   ```bash
   npx prisma studio
   ```

---

## Common Causes

### 1. Prisma Client Out of Sync

**Symptom:** Studio can't communicate with Prisma Client

**Solution:**
```bash
npm run db:generate
npx prisma studio
```

### 2. Database File Moved or Deleted

**Symptom:** Studio can't find the database

**Check:**
```bash
ls -lh dev.db
cat .env.local | grep DATABASE_URL
```

**Fix:** Ensure `DATABASE_URL=file:./dev.db` in `.env.local`

### 3. Multiple Prisma Studio Instances

**Symptom:** Port conflict or connection issues

**Solution:**
```bash
# Kill all Prisma Studio instances
pkill -f "prisma studio"

# Wait a moment
sleep 2

# Start fresh
npx prisma studio
```

### 4. Database Schema Changed

**Symptom:** Studio shows errors after schema changes

**Solution:**
```bash
# Push schema changes
npm run db:push

# Regenerate client
npm run db:generate

# Restart Studio
npx prisma studio
```

---

## Step-by-Step Recovery

### Step 1: Verify Database Exists

```bash
ls -lh dev.db
```

Should show: `-rw-r--r-- ... dev.db`

### Step 2: Check Environment Variables

```bash
cat .env.local | grep DATABASE_URL
```

Should show: `DATABASE_URL=file:./dev.db`

### Step 3: Regenerate Prisma Client

```bash
npm run db:generate
```

### Step 4: Test Database Connection

```bash
sqlite3 dev.db "SELECT COUNT(*) FROM \"Order\";"
```

Should return a number (not an error)

### Step 5: Start Prisma Studio

```bash
npx prisma studio
```

Should open at `http://localhost:5555` (or next available port)

---

## Advanced Troubleshooting

### Check Prisma Studio Logs

Look at the terminal where you ran `npx prisma studio` for error messages.

### Verify Database Schema

```bash
npx prisma db pull
npx prisma db push
```

### Reset Everything

```bash
# Stop Studio
pkill -f "prisma studio"

# Regenerate client
npm run db:generate

# Verify database
ls -lh dev.db

# Start Studio
npx prisma studio
```

---

## Prevention

1. **Always regenerate Prisma Client after schema changes:**
   ```bash
   npm run db:push
   npm run db:generate
   ```

2. **Use one Prisma Studio instance at a time**

3. **Keep database file in project root** (`./dev.db`)

4. **Don't move or rename database files while Studio is running**

---

## Still Having Issues?

1. Check terminal output for specific error messages
2. Verify `DATABASE_URL` in `.env.local`
3. Ensure database file exists and is readable
4. Try restarting your development server
5. Check if another process is using the database

---

**Last Updated:** After removing duplicate database files

