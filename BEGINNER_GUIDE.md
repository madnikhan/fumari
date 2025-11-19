# Complete Beginner's Guide to Building the Restaurant Management System

Welcome! This guide will walk you through building a complete restaurant management system from scratch. Don't worry if you're new to programming - we'll explain everything step by step.

## Table of Contents

1. [What We're Building](#what-were-building)
2. [Understanding the Tech Stack](#understanding-the-tech-stack)
3. [Project Setup](#project-setup)
4. [Understanding the Database](#understanding-the-database)
5. [Building the Backend (API Routes)](#building-the-backend)
6. [Building the Frontend (Pages)](#building-the-frontend)
7. [How Everything Connects](#how-everything-connects)
8. [Testing Your System](#testing-your-system)
9. [Next Steps](#next-steps)

---

## What We're Building

We're creating a **Restaurant Management System** for a large restaurant (1000+ capacity) that includes:

- **Table Management**: Track which tables are available, occupied, or reserved
- **Reservation System**: Customers can book tables in advance
- **Order Management (POS)**: Waiters can create orders for tables
- **Menu Management**: Manage food, drinks, cocktails, and shisha items
- **Kitchen Display**: Kitchen staff see orders in real-time
- **Analytics Dashboard**: View sales reports and popular items
- **Staff Management**: Manage waiters, bartenders, and kitchen staff

---

## Understanding the Tech Stack

### What is Next.js?
Next.js is a React framework that makes building web applications easier. Think of it as a toolkit that helps you:
- Create web pages (like HTML, but better)
- Connect to databases
- Handle user interactions

### What is TypeScript?
TypeScript is JavaScript with types. It helps catch errors before your code runs. Instead of:
```javascript
let name = "John"  // JavaScript
```
We write:
```typescript
let name: string = "John"  // TypeScript - we know it's text
```

### What is Prisma?
Prisma is a tool that helps us talk to databases easily. Instead of writing complex database queries, we write simple code like:
```typescript
const tables = await prisma.table.findMany()  // Get all tables
```

### What is Tailwind CSS?
Tailwind CSS is a styling framework. Instead of writing CSS files, we add classes directly to our HTML:
```html
<div class="bg-blue-500 text-white p-4">Hello</div>
```

---

## Project Setup

### Step 1: Install Node.js

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS (Long Term Support) version
3. Install it (follow the installer)
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Open Your Project

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to your project folder:
   ```bash
   cd /Users/muhammadmadni/fumari
   ```

### Step 3: Install Dependencies

Dependencies are packages (tools) your project needs. We already set this up, but here's what happened:

```bash
npm install
```

This installs:
- `next` - The Next.js framework
- `react` - For building user interfaces
- `prisma` - Database toolkit
- `tailwindcss` - Styling
- And many more...

### Step 4: Set Up the Database

```bash
# Generate Prisma Client (creates code to talk to database)
npm run db:generate

# Create database and tables
npm run db:push

# Add sample data (tables, staff, menu items)
npm run db:seed
```

**What happened?**
- Created a SQLite database file (`dev.db`)
- Created tables for: Staff, Sections, Tables, Reservations, Menu, Orders, etc.
- Added sample data so you can see how it works

### Step 5: Start the Development Server

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

You should see the home page!

---

## Understanding the Database

### What is a Database?
A database is like a digital filing cabinet. Instead of papers, we store data (information) in tables.

### Our Database Structure

Think of it like this:

```
Restaurant
├── Sections (Main Hall, Bar Area, Shisha Lounge)
│   └── Tables (Table 1, Table 2, etc.)
│       └── Orders (What customers ordered)
│           └── Order Items (Individual dishes)
├── Menu Categories (Food, Drinks, Shisha)
│   └── Menu Items (Adana Kebab, Cocktail, etc.)
├── Staff (Waiters, Bartenders, Managers)
└── Reservations (Customer bookings)
```

### Key Database Tables Explained

#### 1. **Staff Table**
Stores information about employees:
- Name, email, phone
- Role (waiter, bartender, manager)
- PIN code for quick login

#### 2. **Section Table**
Restaurant areas:
- Main Hall
- Shisha Lounge
- Bar Area
- Outdoor Terrace

#### 3. **Table Table**
Individual dining tables:
- Table number
- Capacity (how many people)
- Status (available, occupied, reserved)
- Which section it's in

#### 4. **MenuCategory Table**
Menu sections:
- Turkish Food
- Kebabs
- Cocktails
- Shisha

#### 5. **MenuItem Table**
Individual menu items:
- Name (English and Turkish)
- Price
- Category it belongs to
- Available or not

#### 6. **Order Table**
Customer orders:
- Which table
- Which waiter took it
- Total price
- Status (pending, preparing, ready, served)

#### 7. **OrderItem Table**
Items in an order:
- Which menu item
- Quantity
- Special instructions
- Status (pending, preparing, ready)

#### 8. **Reservation Table**
Customer bookings:
- Customer name and contact
- Party size
- Date and time
- Which table (if assigned)

---

## Building the Backend (API Routes)

### What is an API?
API (Application Programming Interface) is like a waiter in a restaurant:
- **Frontend** (what users see) asks: "Get me all tables"
- **API** (backend) goes to database and gets the data
- **API** returns the data to frontend
- **Frontend** shows it to the user

### How Our APIs Work

All API routes are in the `app/api/` folder:

```
app/api/
├── tables/route.ts          # Get/create tables
├── reservations/route.ts    # Get/create reservations
├── orders/route.ts          # Get/create orders
├── menu/route.ts            # Get menu items
├── kitchen/orders/route.ts  # Kitchen display orders
├── staff/route.ts           # Get/create staff
└── analytics/route.ts       # Sales reports
```

### Example: Tables API

Let's look at `app/api/tables/route.ts`:

```typescript
// GET /api/tables - Get all tables
export async function GET() {
  try {
    // Ask database for all tables
    const tables = await prisma.table.findMany({
      include: {
        section: true,        // Also get section info
        assignedWaiter: true  // Also get waiter info
      }
    });
    
    // Return tables as JSON
    return NextResponse.json(tables);
  } catch (error) {
    // If something goes wrong, return empty array
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/tables - Create a new table
export async function POST(request: Request) {
  const body = await request.json();
  // Create table in database
  const table = await prisma.table.create({
    data: {
      number: body.number,
      capacity: body.capacity,
      sectionId: body.sectionId
    }
  });
  return NextResponse.json(table);
}
```

**How it works:**
1. Frontend calls: `fetch('/api/tables')`
2. API runs the `GET` function
3. Database returns tables
4. API sends tables back to frontend
5. Frontend displays them

---

## Building the Frontend (Pages)

### What is the Frontend?
The frontend is what users see and interact with - the web pages, buttons, forms, etc.

### Our Page Structure

```
app/
├── page.tsx                    # Home page
├── layout.tsx                  # Main layout (navigation, etc.)
└── dashboard/
    ├── layout.tsx              # Dashboard layout
    ├── tables/page.tsx         # Table management page
    ├── reservations/page.tsx   # Reservations page
    ├── orders/page.tsx         # Orders/POS page
    ├── menu/page.tsx           # Menu management
    ├── kitchen/page.tsx        # Kitchen display
    ├── analytics/page.tsx      # Analytics dashboard
    └── staff/page.tsx          # Staff management
```

### Example: Tables Page

Let's understand `app/dashboard/tables/page.tsx`:

```typescript
'use client';  // This is a client component (runs in browser)

export default function TablesPage() {
  // State: stores the list of tables
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect: runs when page loads
  useEffect(() => {
    fetchTables();  // Get tables from API
  }, []);

  // Function to get tables from API
  const fetchTables = async () => {
    const response = await fetch('/api/tables');
    const data = await response.json();
    setTables(data);  // Save tables in state
    setLoading(false);  // Stop loading
  };

  // Show loading message while fetching
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render the page
  return (
    <div>
      <h1>Table Management</h1>
      {tables.map(table => (
        <div key={table.id}>
          Table {table.number} - {table.status}
        </div>
      ))}
    </div>
  );
}
```

**How it works:**
1. Page loads → `useEffect` runs
2. `fetchTables()` calls API
3. API returns tables
4. `setTables(data)` saves them
5. Page re-renders showing tables

---

## How Everything Connects

### The Complete Flow

Let's trace what happens when a user views tables:

```
1. User opens browser → http://localhost:3000/dashboard/tables

2. Frontend (TablesPage component):
   - useEffect runs
   - Calls fetch('/api/tables')

3. Backend (API Route):
   - Receives request
   - Calls prisma.table.findMany()
   - Database returns tables
   - Returns JSON to frontend

4. Frontend:
   - Receives tables data
   - Updates state with setTables()
   - Re-renders page
   - Shows tables to user
```

### Data Flow Diagram

```
┌─────────────┐
│   Browser    │
│  (User sees) │
└──────┬───────┘
       │
       │ HTTP Request
       │ fetch('/api/tables')
       ▼
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬───────┘
       │
       │ API Call
       ▼
┌─────────────┐
│   Backend   │
│  (Next.js)  │
└──────┬───────┘
       │
       │ Database Query
       │ prisma.table.findMany()
       ▼
┌─────────────┐
│  Database   │
│  (SQLite)   │
└─────────────┘
```

---

## Testing Your System

### Test 1: View Tables

1. Start server: `npm run dev`
2. Go to: http://localhost:3000/dashboard/tables
3. You should see 50 tables listed

### Test 2: View Menu

1. Go to: http://localhost:3000/dashboard/menu
2. You should see menu categories and items

### Test 3: View Staff

1. Go to: http://localhost:3000/dashboard/staff
2. You should see staff members

### Test 4: Create a Reservation

1. Go to: http://localhost:3000/dashboard/reservations
2. Click "New Reservation"
3. Fill in the form
4. Submit

### Test 5: View Analytics

1. Go to: http://localhost:3000/dashboard/analytics
2. You should see sales statistics

---

## Understanding Key Concepts

### 1. State Management

**State** is data that can change. When state changes, the page updates.

```typescript
const [tables, setTables] = useState([]);
// tables = current value
// setTables = function to update it

setTables([...tables, newTable]);  // Add new table
```

### 2. useEffect Hook

Runs code when something changes (like when page loads):

```typescript
useEffect(() => {
  fetchTables();  // Run this when page loads
}, []);  // Empty array = run once
```

### 3. Async/Await

For operations that take time (like API calls):

```typescript
const fetchTables = async () => {
  const response = await fetch('/api/tables');  // Wait for response
  const data = await response.json();  // Wait for JSON
  setTables(data);
};
```

### 4. TypeScript Interfaces

Define what data looks like:

```typescript
interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
}
```

---

## Common Tasks Explained

### Adding a New Menu Item

1. **Database**: Item is stored in `MenuItem` table
2. **API**: `/api/menu` returns it
3. **Frontend**: Menu page displays it

### Creating an Order

1. **Frontend**: Waiter clicks "New Order"
2. **Frontend**: Selects table and items
3. **API**: `/api/orders` POST creates order
4. **Database**: Order saved
5. **Kitchen**: Order appears on kitchen display

### Updating Order Status

1. **Kitchen**: Clicks "Start Preparing"
2. **API**: `/api/kitchen/orders/[id]` PATCH updates status
3. **Database**: Status updated
4. **Frontend**: Status refreshes automatically

---

## File Structure Explained

```
fumari/
├── app/                          # Next.js app directory
│   ├── api/                      # Backend API routes
│   │   ├── tables/
│   │   ├── orders/
│   │   └── ...
│   ├── dashboard/                # Frontend pages
│   │   ├── tables/
│   │   ├── orders/
│   │   └── ...
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/                          # Shared code
│   └── prisma-client.ts          # Database client
├── prisma/                       # Database schema
│   ├── schema.prisma             # Database structure
│   └── seed.ts                   # Sample data
├── public/                       # Static files (images, etc.)
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

---

## Next Steps

### 1. Explore the Code

- Open files in your code editor
- Read through the code
- Try to understand what each part does

### 2. Make Small Changes

- Change colors in Tailwind classes
- Add a new menu item
- Modify text on pages

### 3. Add Features

- Add a search function
- Add filters
- Add new pages

### 4. Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## Troubleshooting

### Problem: "Cannot find module"
**Solution**: Run `npm install`

### Problem: Database errors
**Solution**: Run `npm run db:push`

### Problem: Port 3000 already in use
**Solution**: Kill the process or use a different port:
```bash
npm run dev -- -p 3001
```

### Problem: Changes not showing
**Solution**: 
1. Save all files
2. Check browser console for errors
3. Hard refresh (Cmd+Shift+R)

---

## Summary

You've built a complete restaurant management system! Here's what you learned:

✅ **Frontend**: React components that users interact with
✅ **Backend**: API routes that handle requests
✅ **Database**: Prisma manages data storage
✅ **Styling**: Tailwind CSS for beautiful UI
✅ **TypeScript**: Type-safe code

Keep experimenting and building! Every great developer started as a beginner. 🚀

