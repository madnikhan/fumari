import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Get daily sales report with VAT breakdown
export async function GET(request: Request) {
  try {
    const authenticated = getAccountingSessionFromRequest(request);
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Accounting access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Format: YYYY-MM-DD

    // Default to today if no date provided
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all orders for the day
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'cancelled',
        },
      },
      include: {
        table: {
          select: {
            number: true,
          },
        },
        staff: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate totals
    const totals = {
      totalOrders: orders.length,
      totalSubtotal: 0,
      totalVAT: 0,
      totalServiceCharge: 0,
      totalDiscount: 0,
      totalAmount: 0,
      totalPayments: 0,
    };

    orders.forEach((order) => {
      totals.totalSubtotal += order.subtotal;
      totals.totalVAT += order.vatAmount;
      totals.totalServiceCharge += order.serviceCharge;
      totals.totalDiscount += order.discount;
      totals.totalAmount += order.total;
      
      order.payments.forEach((payment) => {
        if (payment.status === 'completed') {
          totals.totalPayments += payment.amount;
        }
      });
    });

    // Round to 2 decimal places
    Object.keys(totals).forEach((key) => {
      if (key !== 'totalOrders') {
        totals[key as keyof typeof totals] = Math.round(totals[key as keyof typeof totals] * 100) / 100;
      }
    });

    return NextResponse.json({
      date: targetDate.toISOString().split('T')[0],
      orders,
      totals,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating daily sales report:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily sales report', details: error.message },
      { status: 500 }
    );
  }
}

