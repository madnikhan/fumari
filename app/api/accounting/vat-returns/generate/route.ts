import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Generate VAT return for a tax period
export async function POST(request: Request) {
  try {
    const authenticated = getAccountingSessionFromRequest(request);
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Accounting access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { taxPeriodId } = body;

    if (!taxPeriodId) {
      return NextResponse.json(
        { error: 'Tax period ID is required' },
        { status: 400 }
      );
    }

    // Get tax period
    const taxPeriod = await prisma.taxPeriod.findUnique({
      where: { id: taxPeriodId },
    });

    if (!taxPeriod) {
      return NextResponse.json(
        { error: 'Tax period not found' },
        { status: 404 }
      );
    }

    // Calculate Output VAT (VAT on sales)
    const salesOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: taxPeriod.startDate,
          lte: taxPeriod.endDate,
        },
        status: {
          not: 'cancelled',
        },
      },
    });

    let outputVAT = 0;
    salesOrders.forEach((order) => {
      outputVAT += order.vatAmount;
    });

    // Calculate Input VAT (VAT on purchases)
    const purchases = await prisma.purchase.findMany({
      where: {
        date: {
          gte: taxPeriod.startDate,
          lte: taxPeriod.endDate,
        },
      },
    });

    let inputVAT = 0;
    purchases.forEach((purchase) => {
      inputVAT += purchase.vatAmount;
    });

    // Calculate VAT Due
    const vatDue = outputVAT - inputVAT;

    // Round to 2 decimal places
    const roundValue = (val: number) => Math.round(val * 100) / 100;
    const finalOutputVAT = roundValue(outputVAT);
    const finalInputVAT = roundValue(inputVAT);
    const finalVATDue = roundValue(vatDue);

    // Check if VAT return already exists
    const existingReturn = await prisma.vATReturn.findFirst({
      where: { taxPeriodId },
    });

    let vatReturn;
    if (existingReturn) {
      // Update existing return
      vatReturn = await prisma.vATReturn.update({
        where: { id: existingReturn.id },
        data: {
          outputVAT: finalOutputVAT,
          inputVAT: finalInputVAT,
          vatDue: finalVATDue,
        },
        include: {
          taxPeriod: true,
        },
      });
    } else {
      // Create new return
      vatReturn = await prisma.vATReturn.create({
        data: {
          taxPeriodId,
          outputVAT: finalOutputVAT,
          inputVAT: finalInputVAT,
          vatDue: finalVATDue,
        },
        include: {
          taxPeriod: true,
        },
      });
    }

    return NextResponse.json({
      vatReturn,
      summary: {
        period: `${taxPeriod.year} Q${taxPeriod.quarter}`,
        startDate: taxPeriod.startDate.toISOString().split('T')[0],
        endDate: taxPeriod.endDate.toISOString().split('T')[0],
        totalSales: salesOrders.length,
        totalPurchases: purchases.length,
        outputVAT: finalOutputVAT,
        inputVAT: finalInputVAT,
        vatDue: finalVATDue,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating VAT return:', error);
    return NextResponse.json(
      { error: 'Failed to generate VAT return', details: error.message },
      { status: 500 }
    );
  }
}

