import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Get purchase reports (daily/weekly/monthly)
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
    const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly
    const date = searchParams.get('date'); // For daily: YYYY-MM-DD, for monthly: YYYY-MM
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;

    const now = new Date();

    if (period === 'daily' && date) {
      const targetDate = new Date(date);
      startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
      periodLabel = targetDate.toLocaleDateString('en-GB');
    } else if (period === 'weekly' && date) {
      const targetDate = new Date(date);
      startDate = new Date(targetDate);
      startDate.setDate(targetDate.getDate() - targetDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      periodLabel = `${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`;
    } else if (period === 'monthly') {
      const targetYear = year ? parseInt(year) : now.getFullYear();
      const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
      startDate = new Date(targetYear, targetMonth, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetYear, targetMonth + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      periodLabel = new Date(targetYear, targetMonth).toLocaleString('en-GB', { month: 'long', year: 'numeric' });
    } else {
      // Default to current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      periodLabel = now.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
    }

    // Get purchases for the period
    const purchases = await prisma.purchase.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            vatNumber: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate totals
    const totals = {
      totalPurchases: purchases.length,
      totalSubtotal: 0,
      totalVAT: 0,
      totalAmount: 0,
      byCategory: {} as Record<string, { count: number; subtotal: number; vat: number; total: number }>,
      bySupplier: {} as Record<string, { count: number; subtotal: number; vat: number; total: number; supplierName: string }>,
    };

    purchases.forEach((purchase) => {
      totals.totalSubtotal += purchase.subtotal;
      totals.totalVAT += purchase.vatAmount;
      totals.totalAmount += purchase.total;

      // By category
      if (!totals.byCategory[purchase.category]) {
        totals.byCategory[purchase.category] = {
          count: 0,
          subtotal: 0,
          vat: 0,
          total: 0,
        };
      }
      totals.byCategory[purchase.category].count++;
      totals.byCategory[purchase.category].subtotal += purchase.subtotal;
      totals.byCategory[purchase.category].vat += purchase.vatAmount;
      totals.byCategory[purchase.category].total += purchase.total;

      // By supplier
      const supplierKey = purchase.supplier.id;
      if (!totals.bySupplier[supplierKey]) {
        totals.bySupplier[supplierKey] = {
          count: 0,
          subtotal: 0,
          vat: 0,
          total: 0,
          supplierName: purchase.supplier.name,
        };
      }
      totals.bySupplier[supplierKey].count++;
      totals.bySupplier[supplierKey].subtotal += purchase.subtotal;
      totals.bySupplier[supplierKey].vat += purchase.vatAmount;
      totals.bySupplier[supplierKey].total += purchase.total;
    });

    // Round values
    const roundValue = (val: number) => Math.round(val * 100) / 100;
    totals.totalSubtotal = roundValue(totals.totalSubtotal);
    totals.totalVAT = roundValue(totals.totalVAT);
    totals.totalAmount = roundValue(totals.totalAmount);

    Object.keys(totals.byCategory).forEach((key) => {
      const cat = totals.byCategory[key];
      cat.subtotal = roundValue(cat.subtotal);
      cat.vat = roundValue(cat.vat);
      cat.total = roundValue(cat.total);
    });

    Object.keys(totals.bySupplier).forEach((key) => {
      const sup = totals.bySupplier[key];
      sup.subtotal = roundValue(sup.subtotal);
      sup.vat = roundValue(sup.vat);
      sup.total = roundValue(sup.total);
    });

    return NextResponse.json({
      period,
      periodLabel,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      purchases,
      totals,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating purchase report:', error);
    return NextResponse.json(
      { error: 'Failed to generate purchase report', details: error.message },
      { status: 500 }
    );
  }
}

