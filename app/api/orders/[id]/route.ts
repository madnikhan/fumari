import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { calculateVAT, calculateTotalWithVAT, getStandardVATRate } from '@/lib/vat-calculations';

// Get a single order
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        table: {
          select: {
            number: true,
            capacity: true,
          },
        },
        staff: {
          select: {
            name: true,
            role: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                nameTr: true,
                price: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error.message },
      { status: 500 }
    );
  }
}

// Update an order
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      items,
      vatRate,
      serviceCharge,
      discount,
      notes,
      status,
      orderType,
    } = body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prevent editing if order has payments (unless it's just notes/status)
    if (existingOrder.payments.length > 0 && (items || vatRate !== undefined || serviceCharge !== undefined || discount !== undefined)) {
      return NextResponse.json(
        { error: 'Cannot modify order with existing payments. Only notes and status can be updated.' },
        { status: 400 }
      );
    }

    let subtotal = existingOrder.subtotal;
    let finalVatRate = existingOrder.vatRate;
    let finalServiceCharge = existingOrder.serviceCharge;
    let finalDiscount = existingOrder.discount;

    // Recalculate subtotal if items are being updated
    if (items && Array.isArray(items)) {
      subtotal = 0;
      
      // Delete existing items and create new ones
      await prisma.orderItem.deleteMany({
        where: { orderId: params.id },
      });

      // Create new items
      for (const item of items) {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
        });

        if (!menuItem) continue;

        const itemTotal = menuItem.price * item.quantity;
        subtotal += itemTotal;

        await prisma.orderItem.create({
          data: {
            orderId: params.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: menuItem.price,
            specialInstructions: item.specialInstructions,
          },
        });
      }
    }

    // Update VAT rate if provided
    if (vatRate !== undefined) {
      finalVatRate = vatRate;
    }

    // Update service charge if provided
    if (serviceCharge !== undefined) {
      finalServiceCharge = serviceCharge;
    }

    // Update discount if provided
    if (discount !== undefined) {
      finalDiscount = discount;
    }

    // Recalculate totals
    const vatAmount = calculateVAT(subtotal, finalVatRate);
    const totalBeforeDiscount = calculateTotalWithVAT(subtotal, finalVatRate) + finalServiceCharge;
    const total = Math.max(0, totalBeforeDiscount - finalDiscount);

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        subtotal,
        vatRate: finalVatRate,
        vatAmount,
        tax: vatAmount, // Legacy field
        serviceCharge: finalServiceCharge,
        discount: finalDiscount,
        total,
        notes: notes !== undefined ? notes : existingOrder.notes,
        status: status !== undefined ? status : existingOrder.status,
        orderType: orderType !== undefined ? orderType : existingOrder.orderType,
      },
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
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error.message },
      { status: 500 }
    );
  }
}

// Delete an order
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        payments: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if order has payments
    if (existingOrder.payments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete order with existing payments' },
        { status: 400 }
      );
    }

    // Delete order (items will be deleted automatically due to cascade)
    await prisma.order.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order', details: error.message },
      { status: 500 }
    );
  }
}

