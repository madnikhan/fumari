import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { calculateVAT, calculateTotalWithVAT, getStandardVATRate } from '@/lib/vat-calculations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: {
          select: {
            number: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to recent 50 orders
    });

    // Always return an array, even if empty
    return NextResponse.json(Array.isArray(orders) ? orders : []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Return empty array with 200 status to prevent client-side errors
    // This allows the UI to gracefully handle empty states
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, staffId, items, notes } = body;

    // Validate required fields
    if (!tableId) {
      return NextResponse.json(
        { error: 'Table ID is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Get or create a default staff member for kiosk orders
    let finalStaffId = staffId;
    
    if (!finalStaffId) {
      // Try to find any active staff member
      const existingStaff = await prisma.staff.findFirst({
        where: { active: true },
        orderBy: { createdAt: 'asc' },
      });

      if (existingStaff) {
        finalStaffId = existingStaff.id;
      } else {
        // Create a default "Kiosk" staff member if none exists
        const kioskStaff = await prisma.staff.upsert({
          where: { email: 'kiosk@fumari.com' },
          update: { active: true },
          create: {
            name: 'Kiosk System',
            email: 'kiosk@fumari.com',
            role: 'waiter',
            pin: '9999',
            active: true,
          },
        });
        finalStaffId = kioskStaff.id;
      }
    } else {
      // Verify the provided staff ID exists
      const staffExists = await prisma.staff.findUnique({
        where: { id: finalStaffId },
      });

      if (!staffExists) {
        // If provided staff doesn't exist, find or create default
        const existingStaff = await prisma.staff.findFirst({
          where: { active: true },
          orderBy: { createdAt: 'asc' },
        });

        if (existingStaff) {
          finalStaffId = existingStaff.id;
        } else {
          const kioskStaff = await prisma.staff.upsert({
            where: { email: 'kiosk@fumari.com' },
            update: { active: true },
            create: {
              name: 'Kiosk System',
              email: 'kiosk@fumari.com',
              role: 'waiter',
              pin: '9999',
              active: true,
            },
          });
          finalStaffId = kioskStaff.id;
        }
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!menuItem) continue;

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid menu items found' },
        { status: 400 }
      );
    }

    // Calculate VAT (20% UK standard rate)
    const vatRate = getStandardVATRate();
    const vatAmount = calculateVAT(subtotal, vatRate);
    const serviceCharge = subtotal * 0.10; // 10% service charge
    const total = calculateTotalWithVAT(subtotal, vatRate) + serviceCharge;
    
    // Keep tax field for backward compatibility (same as vatAmount)
    const tax = vatAmount;

    const order = await prisma.order.create({
      data: {
        tableId,
        staffId: finalStaffId,
        subtotal,
        vatRate,
        vatAmount,
        tax, // Legacy field
        serviceCharge,
        total,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}

