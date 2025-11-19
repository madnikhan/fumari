# Step-by-Step Building Guide

This guide walks you through building each feature of the restaurant management system, one step at a time.

## Prerequisites

- Node.js installed
- Code editor (VS Code recommended)
- Basic understanding of HTML/CSS/JavaScript

---

## Step 1: Understanding the Project Structure

### What is Next.js App Router?

Next.js uses a file-based routing system. The `app` folder structure determines your URLs:

```
app/
├── page.tsx              → http://localhost:3000/
├── dashboard/
│   └── tables/
│       └── page.tsx      → http://localhost:3000/dashboard/tables
```

### Key Files Explained

1. **`app/layout.tsx`**: Wraps all pages (like a template)
2. **`app/page.tsx`**: Home page
3. **`app/api/`**: Backend API routes
4. **`app/dashboard/`**: Dashboard pages

---

## Step 2: Setting Up the Database

### Understanding Prisma Schema

The `prisma/schema.prisma` file defines your database structure:

```prisma
model Table {
  id            String   @id @default(cuid())
  number        Int      @unique
  capacity      Int
  status        String   @default("available")
  sectionId     String
  section       Section  @relation(...)
}
```

**What this means:**
- `@id`: Primary key (unique identifier)
- `@default(cuid())`: Auto-generate ID
- `@unique`: No duplicates allowed
- `@relation`: Links to another table

### Running Database Commands

```bash
# 1. Generate Prisma Client (creates TypeScript types)
npm run db:generate

# 2. Create/update database tables
npm run db:push

# 3. Add sample data
npm run db:seed
```

**What happens:**
- Creates `dev.db` file (SQLite database)
- Creates all tables
- Inserts sample data

---

## Step 3: Building Your First API Route

### Creating `/api/tables`

**File**: `app/api/tables/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// GET request - fetch all tables
export async function GET() {
  try {
    // Query database
    const tables = await prisma.table.findMany({
      include: {
        section: true,  // Include related section data
      },
      orderBy: {
        number: 'asc',  // Sort by table number
      },
    });

    // Return JSON response
    return NextResponse.json(tables);
  } catch (error) {
    // Handle errors gracefully
    return NextResponse.json([], { status: 200 });
  }
}

// POST request - create a new table
export async function POST(request: Request) {
  try {
    // Get data from request body
    const body = await request.json();
    
    // Create table in database
    const table = await prisma.table.create({
      data: {
        number: body.number,
        capacity: body.capacity,
        sectionId: body.sectionId,
        status: 'available',
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}
```

**Testing the API:**

```bash
# In terminal, test GET request
curl http://localhost:3000/api/tables

# Or use browser
# Navigate to: http://localhost:3000/api/tables
```

---

## Step 4: Building Your First Page

### Creating the Tables Page

**File**: `app/dashboard/tables/page.tsx`

```typescript
'use client';  // Client component (runs in browser)

import { useState, useEffect } from 'react';

// Define what a Table looks like
interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  section: {
    name: string;
  };
}

export default function TablesPage() {
  // State: stores tables data
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tables when page loads
  useEffect(() => {
    fetchTables();
  }, []);

  // Function to get tables from API
  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return <div>Loading tables...</div>;
  }

  // Render the page
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Tables</h1>
      
      <div className="grid grid-cols-4 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="border p-4 rounded">
            <h3>Table {table.number}</h3>
            <p>Capacity: {table.capacity}</p>
            <p>Status: {table.status}</p>
            <p>Section: {table.section.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Breaking it down:**

1. **`'use client'`**: Makes this a client component
2. **`useState`**: Stores data that can change
3. **`useEffect`**: Runs code when component loads
4. **`fetch`**: Calls the API
5. **`map`**: Loops through tables and displays each

---

## Step 5: Adding Styling with Tailwind

### Understanding Tailwind Classes

Tailwind uses utility classes:

```html
<!-- Padding -->
<div class="p-4">        <!-- padding: 1rem -->
<div class="px-4 py-2">   <!-- padding-x: 1rem, padding-y: 0.5rem -->

<!-- Colors -->
<div class="bg-blue-500"> <!-- background: blue -->
<div class="text-white">  <!-- color: white -->

<!-- Layout -->
<div class="flex">        <!-- display: flex -->
<div class="grid">       <!-- display: grid -->
```

### Styling the Tables Page

```typescript
return (
  <div className="p-8 bg-gray-50 min-h-screen">
    <h1 className="text-3xl font-bold mb-6 text-gray-900">
      Table Management
    </h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {tables.map((table) => (
        <div 
          key={table.id} 
          className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Table {table.number}</h3>
            <span className={`px-3 py-1 rounded-full text-xs ${
              table.status === 'available' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {table.status}
            </span>
          </div>
          <p className="text-gray-600">Capacity: {table.capacity}</p>
          <p className="text-gray-600">Section: {table.section.name}</p>
        </div>
      ))}
    </div>
  </div>
);
```

---

## Step 6: Adding Interactivity

### Creating a Filter

```typescript
const [filter, setFilter] = useState<string>('all');

// Filter tables based on status
const filteredTables = filter === 'all' 
  ? tables 
  : tables.filter(table => table.status === filter);

return (
  <div>
    {/* Filter buttons */}
    <div className="mb-6 flex space-x-2">
      {['all', 'available', 'occupied', 'reserved'].map((status) => (
        <button
          key={status}
          onClick={() => setFilter(status)}
          className={`px-4 py-2 rounded ${
            filter === status 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200'
          }`}
        >
          {status}
        </button>
      ))}
    </div>

    {/* Display filtered tables */}
    {filteredTables.map(table => ...)}
  </div>
);
```

### Adding Statistics

```typescript
// Calculate stats
const stats = {
  total: tables.length,
  available: tables.filter(t => t.status === 'available').length,
  occupied: tables.filter(t => t.status === 'occupied').length,
};

// Display stats
<div className="grid grid-cols-3 gap-4 mb-6">
  <div className="bg-white p-4 rounded shadow">
    <p className="text-gray-600">Total Tables</p>
    <p className="text-2xl font-bold">{stats.total}</p>
  </div>
  <div className="bg-white p-4 rounded shadow">
    <p className="text-gray-600">Available</p>
    <p className="text-2xl font-bold text-green-600">{stats.available}</p>
  </div>
  <div className="bg-white p-4 rounded shadow">
    <p className="text-gray-600">Occupied</p>
    <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
  </div>
</div>
```

---

## Step 7: Building Forms

### Creating a Reservation Form

```typescript
const [formData, setFormData] = useState({
  customerName: '',
  customerPhone: '',
  partySize: 4,
  reservationTime: '',
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();  // Prevent page refresh
  
  try {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      alert('Reservation created!');
      // Reset form or redirect
    }
  } catch (error) {
    alert('Error creating reservation');
  }
};

return (
  <form onSubmit={handleSubmit} className="space-y-4">
    <input
      type="text"
      placeholder="Customer Name"
      value={formData.customerName}
      onChange={(e) => setFormData({ 
        ...formData, 
        customerName: e.target.value 
      })}
      className="w-full p-2 border rounded"
    />
    
    <input
      type="tel"
      placeholder="Phone"
      value={formData.customerPhone}
      onChange={(e) => setFormData({ 
        ...formData, 
        customerPhone: e.target.value 
      })}
      className="w-full p-2 border rounded"
    />
    
    <input
      type="number"
      placeholder="Party Size"
      value={formData.partySize}
      onChange={(e) => setFormData({ 
        ...formData, 
        partySize: parseInt(e.target.value) 
      })}
      className="w-full p-2 border rounded"
    />
    
    <input
      type="datetime-local"
      value={formData.reservationTime}
      onChange={(e) => setFormData({ 
        ...formData, 
        reservationTime: e.target.value 
      })}
      className="w-full p-2 border rounded"
    />
    
    <button 
      type="submit"
      className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
    >
      Create Reservation
    </button>
  </form>
);
```

---

## Step 8: Real-time Updates

### Auto-refresh Orders

```typescript
useEffect(() => {
  // Fetch immediately
  fetchOrders();
  
  // Then fetch every 5 seconds
  const interval = setInterval(fetchOrders, 5000);
  
  // Cleanup: stop interval when component unmounts
  return () => clearInterval(interval);
}, []);
```

---

## Step 9: Error Handling

### Proper Error Handling Pattern

```typescript
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    
    const data = await response.json();
    
    // Validate data is array
    if (Array.isArray(data)) {
      setData(data);
    } else {
      console.warn('Expected array, got:', data);
      setData([]);
    }
  } catch (error) {
    console.error('Error:', error);
    setData([]);  // Set empty array on error
  } finally {
    setLoading(false);
  }
};
```

---

## Step 10: Best Practices

### 1. Always Validate Data

```typescript
// ✅ Good
const dataArray = Array.isArray(data) ? data : [];

// ❌ Bad
data.filter(...)  // Might crash if data is not array
```

### 2. Handle Loading States

```typescript
if (loading) {
  return <div>Loading...</div>;
}
```

### 3. Handle Empty States

```typescript
if (data.length === 0) {
  return <div>No data found</div>;
}
```

### 4. Use TypeScript Types

```typescript
interface Table {
  id: string;
  number: number;
  // ... other fields
}
```

### 5. Keep Components Small

Break large components into smaller ones:

```typescript
// ✅ Good
function TableCard({ table }: { table: Table }) {
  return <div>...</div>;
}

// Use it
{tables.map(table => <TableCard key={table.id} table={table} />)}
```

---

## Practice Exercises

### Exercise 1: Add a Search Feature

Add search to the tables page:

```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredTables = tables.filter(table => 
  table.number.toString().includes(searchQuery) ||
  table.section.name.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### Exercise 2: Add Pagination

Show 10 tables per page:

```typescript
const [page, setPage] = useState(1);
const itemsPerPage = 10;
const startIndex = (page - 1) * itemsPerPage;
const paginatedTables = tables.slice(startIndex, startIndex + itemsPerPage);
```

### Exercise 3: Add Delete Functionality

Add delete button to tables:

```typescript
const deleteTable = async (id: string) => {
  if (confirm('Are you sure?')) {
    await fetch(`/api/tables/${id}`, { method: 'DELETE' });
    fetchTables();  // Refresh list
  }
};
```

---

## Common Patterns

### Pattern 1: Fetch Data on Load

```typescript
useEffect(() => {
  fetchData();
}, []);
```

### Pattern 2: Fetch on Filter Change

```typescript
useEffect(() => {
  fetchData();
}, [filter]);
```

### Pattern 3: Optimistic Updates

```typescript
// Update UI immediately, then sync with server
setData([...data, newItem]);
try {
  await fetch('/api/data', { method: 'POST', body: JSON.stringify(newItem) });
} catch (error) {
  // Revert on error
  setData(data);
}
```

---

## Next Steps

1. **Read the code**: Explore existing files
2. **Make changes**: Modify colors, text, layouts
3. **Add features**: Search, filters, new pages
4. **Deploy**: Learn how to deploy to production

Remember: Practice makes perfect! Keep building and experimenting. 🚀

