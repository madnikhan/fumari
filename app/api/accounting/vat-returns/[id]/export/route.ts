import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Export VAT return in HMRC format (CSV)
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
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv or json

    const vatReturn = await prisma.vATReturn.findUnique({
      where: { id },
      include: {
        taxPeriod: true,
      },
    });

    if (!vatReturn) {
      return NextResponse.json(
        { error: 'VAT return not found' },
        { status: 404 }
      );
    }

    // Get settings for VAT registration number
    const settings = await prisma.accountingSettings.findFirst();

    if (format === 'csv') {
      // HMRC CSV format
      const csvRows = [
        'VAT Return - HMRC Format',
        '',
        `Period: ${vatReturn.taxPeriod.year} Q${vatReturn.taxPeriod.quarter}`,
        `Start Date: ${vatReturn.taxPeriod.startDate.toISOString().split('T')[0]}`,
        `End Date: ${vatReturn.taxPeriod.endDate.toISOString().split('T')[0]}`,
        '',
        'Box Number,Description,Amount',
        `1,VAT due on sales (output VAT),${vatReturn.outputVAT.toFixed(2)}`,
        `4,VAT reclaimed on purchases (input VAT),${vatReturn.inputVAT.toFixed(2)}`,
        `5,Net VAT to pay to HMRC,${vatReturn.vatDue.toFixed(2)}`,
        '',
        `VAT Registration Number: ${settings?.vatRegistrationNumber || 'Not Set'}`,
        `Submitted: ${vatReturn.submittedAt ? new Date(vatReturn.submittedAt).toISOString() : 'Not Submitted'}`,
      ];

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="vat-return-${vatReturn.taxPeriod.year}-Q${vatReturn.taxPeriod.quarter}.csv"`,
        },
      });
    } else {
      // JSON format
      return NextResponse.json({
        vatReturn: {
          id: vatReturn.id,
          period: `${vatReturn.taxPeriod.year} Q${vatReturn.taxPeriod.quarter}`,
          startDate: vatReturn.taxPeriod.startDate.toISOString().split('T')[0],
          endDate: vatReturn.taxPeriod.endDate.toISOString().split('T')[0],
          outputVAT: vatReturn.outputVAT,
          inputVAT: vatReturn.inputVAT,
          vatDue: vatReturn.vatDue,
          submittedAt: vatReturn.submittedAt,
          vatRegistrationNumber: settings?.vatRegistrationNumber || null,
        },
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error exporting VAT return:', error);
    return NextResponse.json(
      { error: 'Failed to export VAT return', details: error.message },
      { status: 500 }
    );
  }
}

