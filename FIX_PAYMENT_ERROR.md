# Fix Payment Error: handepayData Column Missing

## Error
```
The column `main.Payment.handepayData` does not exist in the current database.
```

## Solution

The database schema has been updated. You need to **restart your development server** to clear the Next.js cache.

### Step 1: Stop the Development Server

Press `Ctrl+C` in the terminal where `npm run dev` is running.

### Step 2: Clear Next.js Cache

```bash
rm -rf .next
```

### Step 3: Regenerate Prisma Client

```bash
npm run db:generate
```

### Step 4: Restart Development Server

```bash
npm run dev
```

### Step 5: Try Payment Again

1. Go to Orders page
2. Click "Pay" on an order
3. Process payment

---

## If Error Persists

### Option 1: Recreate Database

```bash
# Delete database
rm dev.db

# Recreate with schema
npm run db:push

# Seed data
npm run db:seed

# Restart server
rm -rf .next
npm run dev
```

### Option 2: Verify Schema

Check that `prisma/schema.prisma` has:

```prisma
model Payment {
  id            String   @id @default(cuid())
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id])
  amount        Float
  method        String
  status        String   @default("completed")
  transactionId String?
  handepayData  String?  // ← This field must exist
  createdAt     DateTime @default(now())
  
  @@index([orderId])
  @@index([status])
  @@index([transactionId])
}
```

---

## Quick Fix Command

Run this to fix everything:

```bash
rm -rf .next dev.db && npm run db:push && npm run db:seed && npm run db:generate && npm run dev
```

---

**After restarting the server, the payment should work!** ✅

