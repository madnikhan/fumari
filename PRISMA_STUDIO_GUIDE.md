# Prisma Studio Guide - View and Edit Orders

## Quick Start

### Open Prisma Studio

```bash
npx prisma studio
```

This will:
- Open Prisma Studio in your browser (usually `http://localhost:5555`)
- Show all your database tables
- Allow you to view and edit data visually

---

## Finding Orders with "Served" Status

### Method 1: Using Prisma Studio UI

1. **Open Prisma Studio:**
   ```bash
   npx prisma studio
   ```

2. **Navigate to Orders:**
   - Click on **"Order"** in the left sidebar
   - You'll see all orders listed

3. **Filter by Status:**
   - Look for the **"status"** column
   - Click on the filter/search icon
   - Type `served` in the filter
   - Or click on a "served" status to filter

4. **View Order Details:**
   - Click on any order row to see full details
   - You can see:
     - Order ID
     - Table number
     - Items
     - Payments
     - Total amount
     - Status
     - Created/Updated dates

### Method 2: Using SQL Query

```bash
# Check served orders
sqlite3 dev.db "SELECT id, status, total, createdAt FROM \"Order\" WHERE status = 'served';"
```

---

## Editing Orders in Prisma Studio

### Step 1: Open the Order

1. In Prisma Studio, click on **"Order"** table
2. Find the order with status "served"
3. Click on the order row to open it

### Step 2: Edit Order Fields

You can edit:
- **Status:** Change from "served" to "completed", "cancelled", etc.
- **Total:** Modify the total amount
- **Subtotal:** Change subtotal
- **VAT Rate:** Adjust VAT rate
- **VAT Amount:** Modify VAT amount
- **Service Charge:** Change service charge
- **Discount:** Add/modify discount
- **Notes:** Add or edit notes

### Step 3: Save Changes

- Click **"Save"** button at the bottom
- Changes are saved immediately

---

## Editing Order Items

### View Order Items

1. Open an order in Prisma Studio
2. Scroll down to see **"items"** section
3. Click on an item to edit it

### Edit Order Item

You can modify:
- **Quantity:** Change quantity
- **Price:** Modify price
- **Status:** Change item status (pending, preparing, ready, served)
- **Special Instructions:** Add/edit instructions

---

## Common Order Statuses

- `pending` - Order just created
- `preparing` - Kitchen is preparing
- `ready` - Order ready to serve
- `served` - Order served to customer
- `completed` - Order fully paid and completed
- `cancelled` - Order cancelled

---

## Quick Commands

### Open Prisma Studio
```bash
npx prisma studio
```

### Check Served Orders (Command Line)
```bash
sqlite3 dev.db "SELECT id, status, total, createdAt FROM \"Order\" WHERE status = 'served';"
```

### Update Order Status (Command Line)
```bash
# Change served order to completed
sqlite3 dev.db "UPDATE \"Order\" SET status = 'completed' WHERE status = 'served';"
```

### View All Orders
```bash
sqlite3 dev.db "SELECT id, status, total, createdAt FROM \"Order\" ORDER BY createdAt DESC;"
```

---

## Tips

1. **Backup First:** Before making changes, you can export data:
   ```bash
   sqlite3 dev.db ".dump" > backup.sql
   ```

2. **Filter in Prisma Studio:**
   - Use the search/filter box at the top
   - Filter by status, table number, date, etc.

3. **View Related Data:**
   - Click on order to see related items and payments
   - Click on table number to see table details
   - Click on staff to see staff member details

4. **Bulk Edit:**
   - Select multiple orders (if needed)
   - Use filters to find specific orders
   - Edit them one by one

---

## Troubleshooting

### Prisma Studio Won't Open?

```bash
# Make sure database exists
ls -lh dev.db

# Regenerate Prisma Client
npm run db:generate

# Try opening again
npx prisma studio
```

### Can't Find Orders?

```bash
# Check if orders exist
sqlite3 dev.db "SELECT COUNT(*) FROM \"Order\";"

# Check all statuses
sqlite3 dev.db "SELECT status, COUNT(*) FROM \"Order\" GROUP BY status;"
```

### Changes Not Saving?

- Make sure you click "Save" button
- Check browser console for errors
- Verify database file permissions

---

**Prisma Studio is the easiest way to view and edit your database!** 🎨

