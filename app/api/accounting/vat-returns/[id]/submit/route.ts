import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Submit VAT return to HMRC (mark as submitted)
export async function POST(
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
    const { notes } = body;

    const vatReturn = await prisma.vATReturn.update({
      where: { id },
      data: {
        submittedAt: new Date(),
        submittedBy: 'accounting',
        notes: notes || null,
      },
      include: {
        taxPeriod: true,
      },
    });

    // Update tax period status to submitted
    await prisma.taxPeriod.update({
      where: { id: vatReturn.taxPeriodId },
      data: { status: 'submitted' },
    });

    return NextResponse.json(vatReturn, { status: 200 });
  } catch (error: any) {
    console.error('Error submitting VAT return:', error);
    return NextResponse.json(
      { error: 'Failed to submit VAT return', details: error.message },
      { status: 500 }
    );
  }
}

