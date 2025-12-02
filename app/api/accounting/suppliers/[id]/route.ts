import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Get a single supplier
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

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier', details: error.message },
      { status: 500 }
    );
  }
}

// Update a supplier
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
    const { name, vatNumber, address, phone, email, contactName, active } = body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(vatNumber !== undefined && { vatNumber }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(contactName !== undefined && { contactName }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(supplier, { status: 200 });
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to update supplier', details: error.message },
      { status: 500 }
    );
  }
}

// Delete a supplier
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

    // Check if supplier has purchases
    const purchaseCount = await prisma.purchase.count({
      where: { supplierId: id },
    });

    if (purchaseCount > 0) {
      // Don't delete, just deactivate
      const supplier = await prisma.supplier.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json(supplier, { status: 200 });
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'Failed to delete supplier', details: error.message },
      { status: 500 }
    );
  }
}

