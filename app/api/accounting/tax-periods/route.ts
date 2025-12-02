import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Get all tax periods
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
    const status = searchParams.get('status');

    const where: any = {};
    if (year) {
      where.year = parseInt(year);
    }
    if (status) {
      where.status = status;
    }

    const periods = await prisma.taxPeriod.findMany({
      where,
      include: {
        _count: {
          select: { vatReturns: true },
        },
      },
      orderBy: [
        { year: 'desc' },
        { quarter: 'desc' },
      ],
    });

    return NextResponse.json(periods, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching tax periods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax periods', details: error.message },
      { status: 500 }
    );
  }
}

// Create a new tax period
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
    const { startDate, endDate, quarter, year, notes } = body;

    if (!startDate || !endDate || !quarter || !year) {
      return NextResponse.json(
        { error: 'startDate, endDate, quarter, and year are required' },
        { status: 400 }
      );
    }

    // Check if period already exists
    const existing = await prisma.taxPeriod.findFirst({
      where: {
        year: parseInt(year),
        quarter: parseInt(quarter),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Tax period already exists for this quarter and year' },
        { status: 400 }
      );
    }

    const period = await prisma.taxPeriod.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        quarter: parseInt(quarter),
        year: parseInt(year),
        status: 'open',
        notes: notes || null,
      },
    });

    return NextResponse.json(period, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tax period:', error);
    return NextResponse.json(
      { error: 'Failed to create tax period', details: error.message },
      { status: 500 }
    );
  }
}

