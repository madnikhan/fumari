import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Get all suppliers
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
    const active = searchParams.get('active');

    const where: any = {};
    if (active !== null) {
      where.active = active === 'true';
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: { purchases: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(suppliers, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers', details: error.message },
      { status: 500 }
    );
  }
}

// Create a new supplier
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
    const { name, vatNumber, address, phone, email, contactName } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Supplier name is required' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        vatNumber: vatNumber || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        contactName: contactName || null,
        active: true,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier', details: error.message },
      { status: 500 }
    );
  }
}

