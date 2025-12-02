# Buzzer System & HMRC Accounting Implementation Plan

## 🎯 Overview

This document outlines the implementation plan for two major features:
1. **QR Code Buzzer System** - Customer-facing service request system
2. **HMRC-Compliant Bookkeeping** - UK tax-compliant accounting system

---

## 🔔 Feature 1: QR Code Buzzer System

### Your Idea (Recommended ✅)
**QR Code → Mobile Web App → Service Buttons → Big Screen Display**

This is an excellent modern approach! Here's why it's better than physical buttons:
- ✅ No hardware costs
- ✅ Works on any smartphone
- ✅ Can integrate with existing order system
- ✅ More flexible (can add features easily)
- ✅ Better customer experience
- ✅ Easy to update/maintain

### Architecture

```
Customer Phone (QR Scan)
    ↓
Web App (/table/[tableNumber])
    ↓
Service Buttons (Waiter, Food, Shisha, Bill)
    ↓
API (/api/buzzer/request)
    ↓
Database (BuzzerRequest model)
    ↓
Real-time Updates (WebSocket/SSE)
    ↓
Big Screen Display (/dashboard/buzzer-display)
```

### Implementation Steps

#### Phase 1: Database Schema
1. Add `BuzzerRequest` model to track requests
2. Add `qrCode` field to `Table` model
3. Add `buzzerSettings` for configuration

#### Phase 2: QR Code Generation
1. Generate unique QR codes for each table
2. QR code links to: `/table/[tableNumber]?token=[secure-token]`
3. Store QR codes as images/files

#### Phase 3: Customer-Facing Page
1. Create `/app/table/[tableNumber]/page.tsx`
2. Show service buttons:
   - 🔔 Call Waiter
   - 🍽️ Order Food
   - 💨 Order Shisha
   - 💳 Request Bill
   - 🧹 Table Service
3. Beautiful, mobile-optimized UI
4. PWA support (can install on phone)

#### Phase 4: API Endpoints
1. `POST /api/buzzer/request` - Create buzzer request
2. `GET /api/buzzer/requests` - Get active requests (for display)
3. `PATCH /api/buzzer/requests/[id]/acknowledge` - Mark as acknowledged
4. `DELETE /api/buzzer/requests/[id]` - Clear request

#### Phase 5: Big Screen Display
1. Create `/app/dashboard/buzzer-display/page.tsx`
2. Full-screen display showing:
   - Table number (large, flashing)
   - Request type (icon + text)
   - Time since request
   - Sound alert (optional)
3. Auto-refresh or WebSocket for real-time updates
4. Color-coded by urgency/type

#### Phase 6: Integration
1. Link buzzer requests to orders
2. Show buzzer status on table map
3. Staff notifications (optional)

---

## 📊 Feature 2: HMRC-Compliant Bookkeeping

### HMRC UK Requirements

#### Making Tax Digital (MTD) Requirements:
- ✅ Digital record keeping
- ✅ VAT returns submission
- ✅ Sales records (all transactions)
- ✅ Purchase records (expenses)
- ✅ VAT calculations (20% standard rate)
- ✅ Digital links (no manual data entry)
- ✅ Quarterly submissions

#### Key Features Needed:

1. **Sales Records**
   - All orders with VAT breakdown
   - Zero-rated items (if any)
   - Exempt items (if any)
   - Date, time, table, amount

2. **Purchase Records**
   - Supplier invoices
   - Stock purchases
   - Expenses
   - VAT on purchases

3. **VAT Calculations**
   - Output VAT (sales)
   - Input VAT (purchases)
   - VAT due = Output - Input

4. **Reports**
   - Daily sales summary
   - VAT return (quarterly)
   - Sales by category
   - Tax reports

5. **Digital Links**
   - All data must flow digitally
   - No manual adjustments (except corrections)

### Implementation Steps

#### Phase 1: Database Schema
1. Add `Supplier` model
2. Add `Purchase` model (expenses)
3. Add `VATRate` model (20%, 0%, exempt)
4. Add `TaxPeriod` model (quarters)
5. Add `VATReturn` model
6. Update `Order` model with VAT breakdown

#### Phase 2: VAT Configuration
1. Settings page for VAT rates
2. Configure which items are VAT-able
3. Set VAT registration number
4. Set accounting period dates

#### Phase 3: Purchase Management
1. Add purchase entry page
2. Supplier management
3. Invoice upload/storage
4. VAT calculation on purchases

#### Phase 4: Sales VAT Tracking
1. Update order creation to calculate VAT
2. Track VAT by rate (20%, 0%, exempt)
3. Daily sales summaries with VAT

#### Phase 5: Reports & Returns
1. Daily sales report
2. VAT return form (quarterly)
3. Export to CSV/Excel
4. HMRC submission format (XML/JSON)

#### Phase 6: Integration
1. Link to existing orders
2. Automatic VAT calculation
3. Export functionality
4. Audit trail

---

## 🚀 Recommended Implementation Order

### Priority 1: Buzzer System (Week 1-2)
**Why first?**
- Immediate customer value
- Easier to implement
- Can be tested quickly
- Client can see results fast

**Deliverables:**
- QR codes for all tables
- Customer mobile page
- Big screen display
- Basic buzzer functionality

### Priority 2: Basic Accounting (Week 3-4)
**Why second?**
- Critical for compliance
- Builds on existing order system
- Can start with basic features

**Deliverables:**
- VAT calculation on orders
- Daily sales reports
- Purchase entry
- Basic VAT tracking

### Priority 3: Advanced Accounting (Week 5-6)
**Why third?**
- Complete HMRC compliance
- More complex features
- Requires testing

**Deliverables:**
- VAT return generation
- HMRC export format
- Full audit trail
- Advanced reports

---

## 💡 Technical Recommendations

### For Buzzer System:
1. **Real-time Updates**: Use Server-Sent Events (SSE) or WebSockets
   - SSE is simpler, WebSockets more powerful
   - Recommendation: Start with SSE, upgrade if needed

2. **QR Code Library**: `qrcode` npm package
   - Generate QR codes server-side
   - Store as images or generate on-the-fly

3. **Mobile Optimization**: 
   - PWA for installability
   - Large touch targets
   - Offline support (optional)

4. **Security**:
   - Token-based table access
   - Rate limiting on buzzer requests
   - Prevent abuse

### For Accounting System:
1. **VAT Calculation Library**: 
   - Use decimal.js for precise calculations
   - Avoid floating-point errors

2. **Export Formats**:
   - CSV for basic exports
   - XML for HMRC submission (if needed)
   - PDF for reports

3. **Audit Trail**:
   - Log all changes
   - Track who made changes
   - Timestamp everything

4. **Backup & Recovery**:
   - Regular database backups
   - Export functionality
   - Data retention policies

---

## 📋 Database Schema Changes Needed

### Buzzer System:
```prisma
model BuzzerRequest {
  id          String   @id @default(cuid())
  tableId     String
  table       Table    @relation(fields: [tableId], references: [id])
  requestType String   // waiter, food, shisha, bill, service
  status      String   @default("pending") // pending, acknowledged, completed
  acknowledgedBy String? // Staff ID
  acknowledgedAt DateTime?
  createdAt   DateTime @default(now())
  
  @@index([tableId])
  @@index([status])
  @@index([createdAt])
}

model Table {
  // ... existing fields
  qrCode      String?  @unique // QR code token/URL
  buzzerRequests BuzzerRequest[]
}
```

### Accounting System:
```prisma
model Supplier {
  id          String   @id @default(cuid())
  name        String
  vatNumber   String?
  address     String?
  phone       String?
  email       String?
  active      Boolean  @default(true)
  purchases   Purchase[]
  createdAt   DateTime @default(now())
}

model Purchase {
  id          String   @id @default(cuid())
  supplierId  String
  supplier    Supplier @relation(fields: [supplierId], references: [id])
  invoiceNumber String?
  date        DateTime
  subtotal    Float
  vatAmount   Float
  total       Float
  description String?
  category    String   // stock, equipment, utilities, etc.
  createdAt   DateTime @default(now())
  
  @@index([supplierId])
  @@index([date])
}

model VATRate {
  id          String   @id @default(cuid())
  rate        Float    // 20.0, 0.0, etc.
  name        String   // "Standard", "Zero-rated", "Exempt"
  active      Boolean  @default(true)
}

model TaxPeriod {
  id          String   @id @default(cuid())
  startDate   DateTime
  endDate     DateTime
  quarter     Int      // 1, 2, 3, 4
  year        Int
  status      String   @default("open") // open, closed, submitted
  vatReturns  VATReturn[]
}

model VATReturn {
  id          String   @id @default(cuid())
  taxPeriodId String
  taxPeriod   TaxPeriod @relation(fields: [taxPeriodId], references: [id])
  outputVAT   Float    // VAT on sales
  inputVAT    Float    // VAT on purchases
  vatDue      Float    // Output - Input
  submittedAt DateTime?
  createdAt   DateTime @default(now())
}

// Update Order model
model Order {
  // ... existing fields
  vatRate     Float    @default(20.0)
  vatAmount   Float    @default(0)
  // subtotal should be before VAT
  // total should include VAT
}
```

---

## 🎨 UI/UX Considerations

### Buzzer System:
- **Customer Page**: Simple, large buttons, clear icons
- **Big Screen**: Bold, flashing, easy to read from distance
- **Colors**: 
  - Red = Urgent (Waiter)
  - Blue = Food
  - Green = Shisha
  - Yellow = Bill
  - Orange = Service

### Accounting System:
- **Dashboard**: Key metrics at a glance
- **Reports**: Clean, printable format
- **Forms**: Clear, validated inputs
- **Export**: One-click downloads

---

## ✅ Next Steps

1. **Review this plan with client**
2. **Confirm priorities**
3. **Start with Buzzer System Phase 1**
4. **Set up development timeline**

---

## 📝 Questions to Ask Client

1. **Buzzer System:**
   - Do they want sound alerts on big screen?
   - Should requests auto-expire after X minutes?
   - Do they want staff notifications (push/email)?
   - Should buzzer integrate with order system?

2. **Accounting:**
   - Are they VAT registered?
   - What's their VAT number?
   - Do they have existing accounting software?
   - What's their accounting period (calendar year/fiscal year)?
   - Do they need to export to other systems?

---

## 🔧 Technical Stack

- **Frontend**: Next.js 16, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma + SQLite (local) / PostgreSQL (production)
- **Real-time**: Server-Sent Events (SSE) or WebSockets
- **QR Codes**: `qrcode` npm package
- **PDF Export**: `pdfkit` or `react-pdf`
- **CSV Export**: Built-in or `csv-writer`
- **Decimal Math**: `decimal.js` for VAT calculations

---

Ready to start implementation? Let me know which feature you'd like to tackle first!

