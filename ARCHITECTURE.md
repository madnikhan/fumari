# System Architecture Guide

This document explains how the restaurant management system is structured and how all the pieces fit together.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                       │
│  (Views pages, clicks buttons, fills forms)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP Requests (fetch)
                     │
┌────────────────────▼────────────────────────────────────┐
│              Next.js Application                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Frontend (React Components)               │  │
│  │  - Pages (app/dashboard/*)                        │  │
│  │  - UI Components                                  │  │
│  │  - State Management                               │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Backend (API Routes)                      │  │
│  │  - app/api/*/route.ts                            │  │
│  │  - Handles HTTP requests                          │  │
│  │  - Business logic                                 │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Prisma Queries
                     │
┌────────────────────▼────────────────────────────────────┐
│              SQLite Database (dev.db)                   │
│  - Tables, Reservations, Orders, Menu, Staff           │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
RootLayout (app/layout.tsx)
└── DashboardLayout (app/dashboard/layout.tsx)
    ├── Navigation Bar
    └── Page Content
        ├── TablesPage
        ├── ReservationsPage
        ├── OrdersPage
        ├── MenuPage
        ├── KitchenPage
        ├── AnalyticsPage
        └── StaffPage
```

## Data Flow

### Reading Data (GET Request)

```
1. User opens page
   ↓
2. Component mounts (useEffect runs)
   ↓
3. Component calls fetch('/api/tables')
   ↓
4. API route receives request
   ↓
5. API calls prisma.table.findMany()
   ↓
6. Database returns data
   ↓
7. API returns JSON response
   ↓
8. Component receives data
   ↓
9. Component updates state (setTables)
   ↓
10. Component re-renders with new data
    ↓
11. User sees updated page
```

### Writing Data (POST Request)

```
1. User fills form and clicks submit
   ↓
2. Component calls fetch('/api/tables', { method: 'POST', body: ... })
   ↓
3. API route receives request
   ↓
4. API validates data
   ↓
5. API calls prisma.table.create()
   ↓
6. Database saves new record
   ↓
7. Database returns created record
   ↓
8. API returns JSON response
   ↓
9. Component receives response
   ↓
10. Component updates UI (shows success message)
    ↓
11. Component refreshes data (calls GET again)
```

## File Structure Deep Dive

### Frontend Files

```
app/
├── layout.tsx                    # Root layout (wraps everything)
│   └── Sets up fonts, global styles
│
├── page.tsx                      # Home page (/)
│   └── Dashboard overview with links
│
└── dashboard/
    ├── layout.tsx                # Dashboard layout
    │   └── Navigation bar, sidebar
    │
    └── [feature]/
        └── page.tsx              # Feature page
            ├── State management
            ├── Data fetching
            ├── UI rendering
            └── Event handlers
```

### Backend Files

```
app/api/
└── [resource]/
    └── route.ts                  # API endpoint
        ├── GET()                 # Fetch data
        ├── POST()                # Create data
        ├── PATCH()               # Update data
        └── DELETE()              # Delete data
```

### Database Files

```
prisma/
├── schema.prisma                 # Database schema
│   └── Defines tables, relationships
│
└── seed.ts                       # Seed script
    └── Populates database with sample data
```

## Key Concepts Explained

### 1. Server vs Client Components

**Server Components** (default):
- Run on server
- Can access database directly
- Faster, smaller bundle

**Client Components** (`'use client'`):
- Run in browser
- Can use hooks (useState, useEffect)
- Can handle user interactions

### 2. API Routes

API routes are server-side functions that:
- Handle HTTP requests
- Access database
- Return JSON responses

```typescript
// GET /api/tables
export async function GET() {
  const tables = await prisma.table.findMany();
  return NextResponse.json(tables);
}
```

### 3. State Management

React state stores data that can change:

```typescript
const [tables, setTables] = useState([]);
// tables = current value
// setTables = function to update
```

### 4. Effects

Effects run code when something changes:

```typescript
useEffect(() => {
  fetchTables();  // Run when component mounts
}, []);  // Empty array = run once
```

## Database Relationships

```
Staff
  └── assigned to → Table
        └── has → Order
              └── contains → OrderItem
                    └── references → MenuItem
                          └── belongs to → MenuCategory

Table
  └── belongs to → Section

Reservation
  └── can assign → Table
```

## API Endpoints Overview

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tables` | GET | Get all tables |
| `/api/tables` | POST | Create table |
| `/api/reservations` | GET | Get reservations |
| `/api/reservations` | POST | Create reservation |
| `/api/orders` | GET | Get orders |
| `/api/orders` | POST | Create order |
| `/api/menu` | GET | Get menu items |
| `/api/kitchen/orders` | GET | Get kitchen queue |
| `/api/kitchen/orders/[id]` | PATCH | Update order status |
| `/api/staff` | GET | Get staff |
| `/api/staff` | POST | Create staff |
| `/api/analytics` | GET | Get analytics |

## Security Considerations

### Current Implementation (Development)

- No authentication (anyone can access)
- No authorization (anyone can do anything)
- Direct database access from API routes

### Production Considerations

1. **Authentication**: Add login system
2. **Authorization**: Role-based access control
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Prevent abuse
5. **HTTPS**: Encrypt data in transit
6. **Environment Variables**: Store secrets securely

## Performance Optimizations

### Current Optimizations

1. **Database Indexing**: Prisma automatically indexes foreign keys
2. **Pagination**: Orders API limits to 50 records
3. **Selective Fields**: Only fetch needed data

### Future Optimizations

1. **Caching**: Cache frequently accessed data
2. **Database Connection Pooling**: Reuse connections
3. **Image Optimization**: Optimize menu item images
4. **Code Splitting**: Load code on demand
5. **CDN**: Serve static assets from CDN

## Error Handling Strategy

### API Level

```typescript
try {
  const data = await prisma.table.findMany();
  return NextResponse.json(data);
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json([], { status: 200 });
}
```

### Component Level

```typescript
try {
  const response = await fetch('/api/tables');
  const data = await response.json();
  if (Array.isArray(data)) {
    setTables(data);
  } else {
    setTables([]);
  }
} catch (error) {
  console.error('Error:', error);
  setTables([]);
}
```

## Testing Strategy

### Manual Testing Checklist

- [ ] Can view all tables
- [ ] Can create reservation
- [ ] Can create order
- [ ] Can update order status
- [ ] Can view menu
- [ ] Can view analytics
- [ ] Can view staff

### Automated Testing (Future)

- Unit tests for API routes
- Integration tests for database operations
- E2E tests for user flows

## Deployment Architecture

### Development

```
Local Machine
├── Next.js Dev Server (port 3000)
├── SQLite Database (dev.db)
└── Hot Reload Enabled
```

### Production (Recommended)

```
Vercel/Netlify (Frontend)
├── Next.js Production Build
└── Static Assets (CDN)

Railway/Render (Backend)
├── Next.js API Routes
└── PostgreSQL Database
```

## Monitoring & Logging

### Current Logging

- Console.log for errors
- Console.warn for warnings

### Production Logging

- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance monitoring
- Database query logging

## Scalability Considerations

### Current Limitations

- SQLite: Single file database (not ideal for production)
- No caching layer
- No load balancing

### Scaling Options

1. **Database**: Migrate to PostgreSQL
2. **Caching**: Add Redis
3. **Load Balancing**: Multiple server instances
4. **CDN**: For static assets
5. **Database Replication**: For read-heavy workloads

## Best Practices Used

1. ✅ TypeScript for type safety
2. ✅ Component-based architecture
3. ✅ Separation of concerns (API vs UI)
4. ✅ Error handling at all levels
5. ✅ Consistent naming conventions
6. ✅ Reusable components
7. ✅ Responsive design

## Common Patterns

### Pattern: Fetch on Mount

```typescript
useEffect(() => {
  fetchData();
}, []);
```

### Pattern: Fetch on Change

```typescript
useEffect(() => {
  fetchData();
}, [filter, date]);
```

### Pattern: Optimistic Update

```typescript
// Update UI first
setData([...data, newItem]);
// Then sync with server
await fetch('/api/data', { method: 'POST', body: JSON.stringify(newItem) });
```

## Troubleshooting Guide

### Database Issues

**Problem**: "Table doesn't exist"
**Solution**: Run `npm run db:push`

**Problem**: "Prisma Client not generated"
**Solution**: Run `npm run db:generate`

### API Issues

**Problem**: "404 Not Found"
**Solution**: Check route path matches file structure

**Problem**: "500 Internal Server Error"
**Solution**: Check server logs, verify database connection

### Frontend Issues

**Problem**: "Cannot read property of undefined"
**Solution**: Add null checks, validate data structure

**Problem**: "State not updating"
**Solution**: Check if setState is being called, verify dependencies

---

This architecture supports a scalable, maintainable restaurant management system. As you grow, you can add more features while maintaining this structure.

