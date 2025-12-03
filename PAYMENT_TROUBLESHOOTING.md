# Payment Error Troubleshooting

## Error: "Failed to create payment"

If you're seeing this error, follow these steps to diagnose and fix it:

---

## Step 1: Check Browser Console

1. Open browser Developer Tools (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Try to create a payment again
4. Look for error messages - they will now show detailed information

---

## Step 2: Check Server Logs

1. Look at your terminal where `npm run dev` is running
2. You should see detailed error logs like:
   ```
   Error creating payment: [error message]
   Error stack: [stack trace]
   Error details: [JSON details]
   ```

---

## Common Issues and Solutions

### Issue 1: Order Not Found

**Error:** `Order not found` or `Order ID is required`

**Solution:**
- Make sure you're clicking "Pay" on an existing order
- Refresh the orders page
- Verify the order exists in the database

**Check:**
```bash
# Check if orders exist
# Visit: http://localhost:3000/dashboard/orders
```

---

### Issue 2: Invalid Payment Amount

**Error:** `Valid amount is required` or `Payment amount exceeds remaining balance`

**Solution:**
- Enter a valid payment amount (greater than 0)
- Make sure amount doesn't exceed order total
- Check remaining balance calculation

---

### Issue 3: Database Connection Issue

**Error:** `PrismaClientInitializationError` or `Can't reach database server`

**Solution:**
1. **For SQLite (localhost):**
   ```bash
   # Make sure database exists
   ls -la dev.db
   
   # Regenerate Prisma Client
   npm run db:generate
   
   # Push schema
   npm run db:push
   ```

2. **For PostgreSQL (Vercel):**
   - Check DATABASE_URL in Vercel environment variables
   - Verify Railway database is running
   - Check connection string format

---

### Issue 4: Schema Mismatch

**Error:** `Unknown field` or `Column does not exist`

**Solution:**
```bash
# Regenerate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push --accept-data-loss

# Restart development server
npm run dev
```

---

### Issue 5: Missing Payment Fields

**Error:** `Field is required` or validation errors

**Solution:**
- Make sure you're sending:
  - `orderId` (required)
  - `amount` (required, > 0)
  - `method` (required: 'cash', 'handepay_card', etc.)
  - `transactionId` (optional for Handepay)

---

## Debug Steps

### 1. Verify Order Exists

```bash
# Check orders in database
# Or visit: http://localhost:3000/dashboard/orders
```

### 2. Test Payment API Directly

Use curl or Postman to test:

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "YOUR_ORDER_ID",
    "amount": 10.50,
    "method": "cash"
  }'
```

### 3. Check Database Schema

```bash
# Verify Payment table exists
npx prisma studio
# Or
npx prisma db pull
```

### 4. Check Prisma Client

```bash
# Regenerate Prisma Client
npm run db:generate

# Restart server
npm run dev
```

---

## Quick Fixes

### Fix 1: Restart Everything

```bash
# Stop server (Ctrl+C)
# Regenerate Prisma Client
npm run db:generate

# Push schema
npm run db:push

# Restart server
npm run dev
```

### Fix 2: Reset Database (Local Only)

```bash
# Delete SQLite database
rm dev.db

# Recreate database
npm run db:push
npm run db:seed

# Restart server
npm run dev
```

### Fix 3: Check Environment Variables

Make sure `.env.local` has:
```env
DATABASE_URL=file:./dev.db
NODE_ENV=development
```

---

## Getting More Details

The payment API now returns detailed error information:

```json
{
  "error": "Failed to create payment: [specific error]",
  "details": "[error message]",
  "code": "[error code if available]",
  "meta": "[additional metadata]"
}
```

Check:
1. **Browser Console** - Shows the full error response
2. **Server Terminal** - Shows detailed error logs
3. **Network Tab** - Shows the API request/response

---

## Still Having Issues?

1. **Check the exact error message** in browser console
2. **Check server logs** for detailed error information
3. **Verify database connection** is working
4. **Test with a simple cash payment** first
5. **Check if order exists** before trying to pay

---

## Test Payment Flow

1. **Create an order:**
   - Go to Orders page
   - Click "New Order"
   - Select table and add items
   - Create order

2. **Process payment:**
   - Click "Pay" on the order
   - Select payment method (Cash or Handepay Card)
   - Enter amount
   - Click "Process Payment"

3. **Check result:**
   - Should see success message
   - Order should show payment
   - Remaining balance should update

---

**If you're still seeing errors, check the browser console and server logs for the detailed error message!**

