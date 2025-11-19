import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const orderItem = await prisma.orderItem.update({
      where: { id },
      data: { status },
      include: {
        order: true,
      },
    });

    // Update order status based on item statuses
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: orderItem.orderId },
    });

    const allReady = allItems.every((item) => item.status === 'ready' || item.status === 'served');
    const allServed = allItems.every((item) => item.status === 'served');
    const anyPreparing = allItems.some((item) => item.status === 'preparing');

    let orderStatus = 'pending';
    if (allServed) {
      orderStatus = 'served';
    } else if (allReady) {
      orderStatus = 'ready';
    } else if (anyPreparing) {
      orderStatus = 'preparing';
    }

    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: { status: orderStatus },
    });

    return NextResponse.json(orderItem);
  } catch (error) {
    console.error('Error updating order item:', error);
    return NextResponse.json(
      { error: 'Failed to update order item' },
      { status: 500 }
    );
  }
}

