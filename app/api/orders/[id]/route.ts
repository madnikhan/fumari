import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { calculateVAT, calculateTotalWithVAT, getStandardVATRate } from '@/lib/vat-calculations';

// Get a single order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params).then(p => typeof p === 'object' && 'then' in p ? p : Promise.resolve(p));
    const orderId = typeof id === 'string' ? id : (await id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: orderId } = await Promise.resolve(params);
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
      where: { id: orderId },
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
    if (existingOrder.payments.length > 0 && (items || vatRate !== undefined || discount !== undefined)) {
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
        where: { orderId: orderId },
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
            orderId: orderId,
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

    // Service charge removed - always set to 0
    finalServiceCharge = 0;

    // Update discount if provided
    if (discount !== undefined) {
      // Validate discount: must be >= 0 and not exceed total before discount
      if (discount < 0) {
        return NextResponse.json(
          { error: 'Discount cannot be negative' },
          { status: 400 }
        );
      }
      finalDiscount = discount;
    }

    // Recalculate totals (no service charge)
    const vatAmount = calculateVAT(subtotal, finalVatRate);
    const totalBeforeDiscount = calculateTotalWithVAT(subtotal, finalVatRate);
    
    // Ensure discount doesn't exceed total before discount
    if (finalDiscount > totalBeforeDiscount) {
      return NextResponse.json(
        { error: `Discount cannot exceed total amount of £${totalBeforeDiscount.toFixed(2)}` },
        { status: 400 }
      );
    }
    
    const total = Math.max(0, totalBeforeDiscount - finalDiscount);

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
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
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Provide more detailed error message
    let errorMessage = 'Failed to update order';
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    if (error.code) {
      errorMessage += ` (Code: ${error.code})`;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error.message,
        code: error.code,
        meta: error.meta,
      },
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
    console.log('DELETE request for order:', params.id);

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        payments: true,
        items: true,
      },
    });

    if (!existingOrder) {
      console.log('Order not found:', orderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if order has payments
    if (existingOrder.payments.length > 0) {
      console.log('Cannot delete order with payments:', existingOrder.payments.length);
      return NextResponse.json(
        { error: 'Cannot delete order with existing payments. Please refund payments first.' },
        { status: 400 }
      );
    }

    console.log('Deleting order:', orderId, 'with', existingOrder.items.length, 'items');

    // Delete order items first (if not cascading)
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId },
    });

    // Delete order
    await prisma.order.delete({
      where: { id: orderId },
    });

    console.log('Order deleted successfully:', orderId);
    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to delete order', 
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

