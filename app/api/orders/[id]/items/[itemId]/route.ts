import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { calculateVAT, calculateTotalWithVAT } from '@/lib/vat-calculations';

// Update an order item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();
    const { quantity, price, specialInstructions } = body;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prevent editing if order has payments
    if (order.payments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot modify order items when order has payments' },
        { status: 400 }
      );
    }

    // Check if item exists
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: params.itemId },
    });

    if (!orderItem || orderItem.orderId !== params.id) {
      return NextResponse.json(
        { error: 'Order item not found' },
        { status: 404 }
      );
    }

    // Update item
    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        quantity: quantity !== undefined ? quantity : orderItem.quantity,
        price: price !== undefined ? price : orderItem.price,
        specialInstructions: specialInstructions !== undefined ? specialInstructions : orderItem.specialInstructions,
      },
    });

    // Recalculate order totals
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: id },
    });

    let subtotal = 0;
    for (const item of allItems) {
      subtotal += item.price * item.quantity;
    }

    const vatAmount = calculateVAT(subtotal, order.vatRate);
    const totalBeforeDiscount = calculateTotalWithVAT(subtotal, order.vatRate); // No service charge
    const total = Math.max(0, totalBeforeDiscount - order.discount);

    // Update order totals
    await prisma.order.update({
      where: { id: params.id },
      data: {
        subtotal,
        vatAmount,
        tax: vatAmount, // Legacy field
        total,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error('Error updating order item:', error);
    return NextResponse.json(
      { error: 'Failed to update order item', details: error.message },
      { status: 500 }
    );
  }
}

// Delete an order item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if order has payments
    if (order.payments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete order items when order has payments' },
        { status: 400 }
      );
    }

    // Check if item exists
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: params.itemId },
    });

    if (!orderItem || orderItem.orderId !== params.id) {
      return NextResponse.json(
        { error: 'Order item not found' },
        { status: 404 }
      );
    }

    // Prevent deleting the last item
    const itemCount = await prisma.orderItem.count({
      where: { orderId: id },
    });

    if (itemCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last item. Delete the order instead.' },
        { status: 400 }
      );
    }

    // Delete item
    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    // Recalculate order totals
    const remainingItems = await prisma.orderItem.findMany({
      where: { orderId: id },
    });

    let subtotal = 0;
    for (const item of remainingItems) {
      subtotal += item.price * item.quantity;
    }

    const vatAmount = calculateVAT(subtotal, order.vatRate);
    const totalBeforeDiscount = calculateTotalWithVAT(subtotal, order.vatRate); // No service charge
    const total = Math.max(0, totalBeforeDiscount - order.discount);

    // Update order totals
    await prisma.order.update({
      where: { id: params.id },
      data: {
        subtotal,
        vatAmount,
        tax: vatAmount, // Legacy field
        total,
      },
    });

    return NextResponse.json({ message: 'Order item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting order item:', error);
    return NextResponse.json(
      { error: 'Failed to delete order item', details: error.message },
      { status: 500 }
    );
  }
}

