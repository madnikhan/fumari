import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';
import { calculateVAT, calculateTotalWithVAT, getStandardVATRate } from '@/lib/vat-calculations';

// Get a single purchase
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = getAccountingSessionFromRequest(request);
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Accounting access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(purchase, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching purchase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase', details: error.message },
      { status: 500 }
    );
  }
}

// Update a purchase
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = getAccountingSessionFromRequest(request);
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Accounting access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
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

    // If subtotal or vatRate changed, recalculate VAT
    let updateData: any = {};
    
    if (supplierId) updateData.supplierId = supplierId;
    if (invoiceNumber !== undefined) updateData.invoiceNumber = invoiceNumber;
    if (date) updateData.date = new Date(date);
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;

    // Recalculate VAT if subtotal or vatRate changed
    if (subtotal !== undefined || vatRate !== undefined) {
      const currentPurchase = await prisma.purchase.findUnique({ where: { id } });
      const finalSubtotal = subtotal !== undefined ? subtotal : currentPurchase?.subtotal || 0;
      const finalVATRate = vatRate !== undefined ? vatRate : currentPurchase?.vatRate || getStandardVATRate();
      
      updateData.subtotal = finalSubtotal;
      updateData.vatRate = finalVATRate;
      updateData.vatAmount = calculateVAT(finalSubtotal, finalVATRate);
      updateData.total = calculateTotalWithVAT(finalSubtotal, finalVATRate);
    }

    const purchase = await prisma.purchase.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(purchase, { status: 200 });
  } catch (error: any) {
    console.error('Error updating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase', details: error.message },
      { status: 500 }
    );
  }
}

// Delete a purchase
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = getAccountingSessionFromRequest(request);
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Accounting access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.purchase.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting purchase:', error);
    return NextResponse.json(
      { error: 'Failed to delete purchase', details: error.message },
      { status: 500 }
    );
  }
}

