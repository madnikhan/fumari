import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// Get all payments or payments for a specific order
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    let where: any = {};
    if (orderId) {
      where.orderId = orderId;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            table: {
              select: {
                number: true,
              },
            },
            total: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: error.message },
      { status: 500 }
    );
  }
}

// Create a new payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, method, transactionId, handepayData } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!method) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    // Calculate total paid
    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = order.total - totalPaid;

    // Validate payment amount doesn't exceed remaining balance
    if (amount > remainingBalance + 0.01) { // Allow small rounding differences
      return NextResponse.json(
        { error: `Payment amount exceeds remaining balance of £${remainingBalance.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Determine payment status
    let status = 'completed';
    if (method === 'handepay_card' || method === 'card') {
      // For card payments, start as pending until confirmed by Handepay webhook
      status = transactionId ? 'completed' : 'pending';
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
        status,
        transactionId: transactionId || null,
        handepayData: handepayData ? JSON.stringify(handepayData) : null,
      },
      include: {
        order: {
          select: {
            id: true,
            table: {
              select: {
                number: true,
              },
            },
            total: true,
          },
        },
      },
    });

    // Update order status if fully paid
    const newTotalPaid = totalPaid + amount;
    if (newTotalPaid >= order.total - 0.01) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'completed' },
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', details: error.message },
      { status: 500 }
    );
  }
}

