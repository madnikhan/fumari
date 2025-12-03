import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// Get a single payment
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            table: {
              select: {
                number: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment', details: error.message },
      { status: 500 }
    );
  }
}

// Update payment status (e.g., from Handepay webhook)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, transactionId, handepayData } = body;

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (transactionId) updateData.transactionId = transactionId;
    if (handepayData) updateData.handepayData = JSON.stringify(handepayData);

    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            total: true,
          },
        },
      },
    });

    // If payment completed, check if order should be marked as completed
    if (status === 'completed') {
      const order = await prisma.order.findUnique({
        where: { id: payment.orderId },
        include: {
          payments: true,
        },
      });

      if (order) {
        const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaid >= order.total - 0.01) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'completed' },
          });
        }
      }
    }

    return NextResponse.json(updatedPayment);
  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment', details: error.message },
      { status: 500 }
    );
  }
}

// Delete payment (refund scenario)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // For card payments, mark as refunded instead of deleting
    if (payment.method === 'handepay_card' || payment.method === 'card') {
      await prisma.payment.update({
        where: { id: params.id },
        data: { status: 'refunded' },
      });
      return NextResponse.json({ message: 'Payment marked as refunded' });
    }

    // For cash payments, allow deletion
    await prisma.payment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment', details: error.message },
      { status: 500 }
    );
  }
}

