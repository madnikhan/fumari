import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Get weekly sales report
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
    const weekStart = searchParams.get('weekStart'); // Format: YYYY-MM-DD

    // Default to current week if no date provided
    const targetDate = weekStart ? new Date(weekStart) : new Date();
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDate.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    // Get all orders for the week
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek,
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

    // Group by day
    const dailyBreakdown: Record<string, any> = {};
    const totals = {
      totalOrders: 0,
      totalSubtotal: 0,
      totalVAT: 0,
      totalServiceCharge: 0,
      totalDiscount: 0,
      totalAmount: 0,
      totalPayments: 0,
    };

    orders.forEach((order) => {
      const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
      
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = {
          date: dateKey,
          orders: [],
          subtotal: 0,
          vat: 0,
          serviceCharge: 0,
          discount: 0,
          total: 0,
        };
      }

      dailyBreakdown[dateKey].orders.push(order);
      dailyBreakdown[dateKey].subtotal += order.subtotal;
      dailyBreakdown[dateKey].vat += order.vatAmount;
      dailyBreakdown[dateKey].serviceCharge += order.serviceCharge;
      dailyBreakdown[dateKey].discount += order.discount;
      dailyBreakdown[dateKey].total += order.total;

      totals.totalOrders++;
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

    // Round totals
    Object.keys(totals).forEach((key) => {
      if (key !== 'totalOrders') {
        totals[key as keyof typeof totals] = Math.round(totals[key as keyof typeof totals] * 100) / 100;
      }
    });

    // Round daily breakdown
    Object.keys(dailyBreakdown).forEach((key) => {
      const day = dailyBreakdown[key];
      day.subtotal = Math.round(day.subtotal * 100) / 100;
      day.vat = Math.round(day.vat * 100) / 100;
      day.serviceCharge = Math.round(day.serviceCharge * 100) / 100;
      day.discount = Math.round(day.discount * 100) / 100;
      day.total = Math.round(day.total * 100) / 100;
    });

    return NextResponse.json({
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0],
      dailyBreakdown: Object.values(dailyBreakdown).sort((a: any, b: any) => 
        a.date.localeCompare(b.date)
      ),
      totals,
      orders,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating weekly sales report:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly sales report', details: error.message },
      { status: 500 }
    );
  }
}

