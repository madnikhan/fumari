import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Get a single tax period
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

    const period = await prisma.taxPeriod.findUnique({
      where: { id },
      include: {
        vatReturns: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!period) {
      return NextResponse.json(
        { error: 'Tax period not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(period, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching tax period:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax period', details: error.message },
      { status: 500 }
    );
  }
}

// Update tax period
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
    const { status, notes } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const period = await prisma.taxPeriod.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(period, { status: 200 });
  } catch (error: any) {
    console.error('Error updating tax period:', error);
    return NextResponse.json(
      { error: 'Failed to update tax period', details: error.message },
      { status: 500 }
    );
  }
}

