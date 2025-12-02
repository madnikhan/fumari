import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Get monthly sales report
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
    const year = searchParams.get('year');
    const month = searchParams.get('month'); // 1-12

    // Default to current month if not provided
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth(); // JavaScript months are 0-indexed

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Get all orders for the month
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
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

    // Group by week
    const weeklyBreakdown: Record<string, any> = {};
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
      const orderDate = new Date(order.createdAt);
      const dateKey = orderDate.toISOString().split('T')[0];
      
      // Get week number
      const weekStart = new Date(orderDate);
      weekStart.setDate(orderDate.getDate() - orderDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      // Daily breakdown
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = {
          date: dateKey,
          orders: 0,
          subtotal: 0,
          vat: 0,
          serviceCharge: 0,
          discount: 0,
          total: 0,
        };
      }

      dailyBreakdown[dateKey].orders++;
      dailyBreakdown[dateKey].subtotal += order.subtotal;
      dailyBreakdown[dateKey].vat += order.vatAmount;
      dailyBreakdown[dateKey].serviceCharge += order.serviceCharge;
      dailyBreakdown[dateKey].discount += order.discount;
      dailyBreakdown[dateKey].total += order.total;

      // Weekly breakdown
      if (!weeklyBreakdown[weekKey]) {
        weeklyBreakdown[weekKey] = {
          weekStart: weekKey,
          orders: 0,
          subtotal: 0,
          vat: 0,
          serviceCharge: 0,
          discount: 0,
          total: 0,
        };
      }

      weeklyBreakdown[weekKey].orders++;
      weeklyBreakdown[weekKey].subtotal += order.subtotal;
      weeklyBreakdown[weekKey].vat += order.vatAmount;
      weeklyBreakdown[weekKey].serviceCharge += order.serviceCharge;
      weeklyBreakdown[weekKey].discount += order.discount;
      weeklyBreakdown[weekKey].total += order.total;

      // Totals
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

    // Round all values
    const roundValue = (val: number) => Math.round(val * 100) / 100;

    Object.keys(totals).forEach((key) => {
      if (key !== 'totalOrders') {
        totals[key as keyof typeof totals] = roundValue(totals[key as keyof typeof totals] as number);
      }
    });

    Object.keys(dailyBreakdown).forEach((key) => {
      const day = dailyBreakdown[key];
      day.subtotal = roundValue(day.subtotal);
      day.vat = roundValue(day.vat);
      day.serviceCharge = roundValue(day.serviceCharge);
      day.discount = roundValue(day.discount);
      day.total = roundValue(day.total);
    });

    Object.keys(weeklyBreakdown).forEach((key) => {
      const week = weeklyBreakdown[key];
      week.subtotal = roundValue(week.subtotal);
      week.vat = roundValue(week.vat);
      week.serviceCharge = roundValue(week.serviceCharge);
      week.discount = roundValue(week.discount);
      week.total = roundValue(week.total);
    });

    return NextResponse.json({
      year: targetYear,
      month: targetMonth + 1,
      monthName: new Date(targetYear, targetMonth).toLocaleString('en-GB', { month: 'long' }),
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
      dailyBreakdown: Object.values(dailyBreakdown).sort((a: any, b: any) => 
        a.date.localeCompare(b.date)
      ),
      weeklyBreakdown: Object.values(weeklyBreakdown).sort((a: any, b: any) => 
        a.weekStart.localeCompare(b.weekStart)
      ),
      totals,
      totalDays: endOfMonth.getDate(),
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating monthly sales report:', error);
    return NextResponse.json(
      { error: 'Failed to generate monthly sales report', details: error.message },
      { status: 500 }
    );
  }
}

