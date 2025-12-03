import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

/**
 * Handepay Webhook Handler
 * 
 * This endpoint receives payment status updates from Handepay card machines.
 * Handepay will send POST requests here when:
 * - Payment is authorized
 * - Payment is completed
 * - Payment fails
 * - Payment is refunded
 * 
 * Note: In production, you should verify the webhook signature from Handepay
 * to ensure the request is authentic.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Handepay webhook payload structure (adjust based on actual Handepay API docs)
    const {
      transactionId,
      orderId, // Your order ID passed to Handepay
      amount,
      status, // 'authorized', 'completed', 'failed', 'refunded'
      cardType,
      last4,
      authCode,
      timestamp,
      signature, // For webhook verification
    } = body;

    // TODO: Verify webhook signature
    // const isValid = verifyHandepaySignature(body, signature);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    if (!transactionId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the payment by orderId and transactionId
    const payment = await prisma.payment.findFirst({
      where: {
        orderId: orderId,
        transactionId: transactionId,
      },
    });

    if (!payment) {
      // Payment might not exist yet, create it
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Create payment record
      await prisma.payment.create({
        data: {
          orderId: orderId,
          amount: amount || order.total,
          method: 'handepay_card',
          status: status === 'completed' ? 'completed' : 'pending',
          transactionId: transactionId,
          handepayData: JSON.stringify({
            cardType,
            last4,
            authCode,
            timestamp,
            status,
          }),
        },
      });
    } else {
      // Update existing payment
      const paymentStatus = 
        status === 'completed' ? 'completed' :
        status === 'failed' ? 'failed' :
        status === 'refunded' ? 'refunded' :
        'pending';

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          handepayData: JSON.stringify({
            cardType,
            last4,
            authCode,
            timestamp,
            status,
          }),
        },
      });
    }

    // Update order status if payment completed
    if (status === 'completed') {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          payments: true,
        },
      });

      if (order) {
        const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaid >= order.total - 0.01) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'completed' },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing Handepay webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error.message },
      { status: 500 }
    );
  }
}

