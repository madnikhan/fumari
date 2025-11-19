# Fumari Restaurant Management System

A comprehensive restaurant management system built for large-scale operations (1000+ capacity) featuring Turkish cuisine, shisha bar, and cocktail lounge management.

## Features

### 🍽️ Table Management
- Real-time table status tracking (available, occupied, reserved, cleaning)
- Section-based organization for large spaces
- Waiter assignment to tables
- Capacity management

### 📅 Reservation System
- Customer reservation management
- Waitlist handling
- Table assignment
- Special requests tracking

### 🛒 POS & Order Management
- Point of sale system
- Order creation and tracking
- Split bills support
- Payment processing
- Order status updates (pending, preparing, ready, served, completed)

### 🍕 Menu Management
- Turkish food menu
- Cocktail menu
- Shisha menu
- Multi-language support (English/Turkish)
- Item availability management
- Preparation time tracking

### 👨‍🍳 Kitchen & Bar Display
- Real-time order queue
- Kitchen display system (KDS)
- Bar order management
- Order status updates
- Special instructions handling

### 📊 Analytics Dashboard
- Revenue tracking
- Popular items analysis
- Hourly sales reports
- Order statistics
- Performance metrics

### 👥 Staff Management
- Staff profiles and roles
- Waiter assignments
- Section management
- Role-based access (manager, waiter, bartender, kitchen staff)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (via Prisma)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fumari
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Steps:

1. **Set up PostgreSQL database** (Vercel Postgres recommended)
2. **Push code to GitHub**
3. **Import to Vercel** and configure environment variables
4. **Set `DATABASE_URL`** to your PostgreSQL connection string
5. **Deploy** and run database migrations

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Change admin password immediately after deployment!**

## Database Schema

The system uses Prisma ORM with the following main models:

- **Staff**: Restaurant staff members
- **Section**: Restaurant sections (Main Hall, Shisha Lounge, Bar Area, etc.)
- **Table**: Dining tables with status tracking
- **Reservation**: Customer reservations
- **MenuCategory**: Menu categories (food, drink, cocktail, shisha)
- **MenuItem**: Individual menu items with Turkish/English names
- **Order**: Customer orders
- **OrderItem**: Individual items within orders
- **Payment**: Payment records

## Project Structure

```
fumari/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx         # Home page
├── lib/
│   └── prisma-client.ts  # Prisma client singleton
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
└── public/              # Static assets
```

## API Routes

- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create a new table
- `GET /api/reservations` - Get reservations (with date filter)
- `POST /api/reservations` - Create a reservation
- `GET /api/orders` - Get orders (with status filter)
- `POST /api/orders` - Create a new order
- `GET /api/menu` - Get menu items
- `GET /api/kitchen/orders` - Get kitchen order queue
- `PATCH /api/kitchen/orders/[id]` - Update order item status
- `GET /api/analytics` - Get analytics data
- `GET /api/staff` - Get staff members
- `POST /api/staff` - Create staff member

## Features in Detail

### Table Management
- View all tables with real-time status
- Filter by status (available, occupied, reserved, cleaning)
- See table capacity and current guests
- View assigned waiters

### Reservation System
- Create and manage reservations
- Filter by date
- Track reservation status
- Assign tables to reservations

### Order Management
- Create orders for tables
- Add multiple items
- Track order status
- View order history
- Calculate totals with tax and service charge

### Kitchen Display
- Real-time order queue
- Group orders by table
- Update item preparation status
- Visual indicators for order types (food, cocktail, shisha)

### Analytics
- Revenue tracking (total, daily, hourly)
- Popular items ranking
- Order statistics
- Performance metrics

## Future Enhancements

- [ ] Real-time updates using WebSockets
- [ ] Mobile app for waiters
- [ ] Customer-facing menu display
- [ ] Inventory management
- [ ] Staff scheduling
- [ ] Customer loyalty program
- [ ] Advanced reporting
- [ ] Multi-location support
- [ ] Integration with payment gateways
- [ ] QR code table ordering

## License

Private project - All rights reserved

## Support

For issues and questions, please contact the development team.
