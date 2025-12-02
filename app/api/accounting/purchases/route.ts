import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';
import { calculateVAT, calculateTotalWithVAT, getStandardVATRate } from '@/lib/vat-calculations';

// Get all purchases
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
    const supplierId = searchParams.get('supplierId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');

    const where: any = {};
    if (supplierId) {
      where.supplierId = supplierId;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }
    if (category) {
      where.category = category;
    }

    const purchases = await prisma.purchase.findMany({
      where,
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

    return NextResponse.json(purchases, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases', details: error.message },
      { status: 500 }
    );
  }
}

// Create a new purchase
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
    const {
      supplierId,
      invoiceNumber,
      date,
      category,
      description,
      subtotal,
      vatRate,
      notes,
    } = body;

    // Validate required fields
    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    if (subtotal === undefined || subtotal === null) {
      return NextResponse.json(
        { error: 'Subtotal is required' },
        { status: 400 }
      );
    }

    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Calculate VAT
    const finalVATRate = vatRate || getStandardVATRate();
    const vatAmount = calculateVAT(subtotal, finalVATRate);
    const total = calculateTotalWithVAT(subtotal, finalVATRate);

    const purchase = await prisma.purchase.create({
      data: {
        supplierId,
        invoiceNumber: invoiceNumber || null,
        date: new Date(date),
        category: category || 'other',
        description: description || null,
        subtotal,
        vatRate: finalVATRate,
        vatAmount,
        total,
        notes: notes || null,
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
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error: any) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase', details: error.message },
      { status: 500 }
    );
  }
}

