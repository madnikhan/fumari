import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

// Get accounting settings
export async function GET(request: Request) {
  try {
    const authenticated = getAccountingSessionFromRequest(request);
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Accounting access required' },
        { status: 401 }
      );
    }

    let settings = await prisma.accountingSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.accountingSettings.create({
        data: {
          standardVATRate: 20.0,
          zeroRatedVATRate: 0.0,
          exemptVATRate: 0.0,
          serviceChargeRate: 10.0,
          accountingYearStart: 1,
          currency: 'GBP',
          currencySymbol: '£',
        },
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching accounting settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error.message },
      { status: 500 }
    );
  }
}

// Update accounting settings
export async function PATCH(request: Request) {
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
      vatRegistrationNumber,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      accountingYearStart,
      standardVATRate,
      zeroRatedVATRate,
      exemptVATRate,
      serviceChargeRate,
      currency,
      currencySymbol,
    } = body;

    // Get or create settings
    let settings = await prisma.accountingSettings.findFirst();

    if (!settings) {
      settings = await prisma.accountingSettings.create({
        data: {
          vatRegistrationNumber: vatRegistrationNumber || null,
          companyName: companyName || null,
          companyAddress: companyAddress || null,
          companyPhone: companyPhone || null,
          companyEmail: companyEmail || null,
          accountingYearStart: accountingYearStart || 1,
          standardVATRate: standardVATRate || 20.0,
          zeroRatedVATRate: zeroRatedVATRate || 0.0,
          exemptVATRate: exemptVATRate || 0.0,
          serviceChargeRate: serviceChargeRate || 10.0,
          currency: currency || 'GBP',
          currencySymbol: currencySymbol || '£',
          updatedBy: 'accounting',
        },
      });
    } else {
      // Build update data object, handling empty strings as null
      const updateData: any = {
        updatedBy: session.userId,
      };

      if (vatRegistrationNumber !== undefined) {
        updateData.vatRegistrationNumber = vatRegistrationNumber || null;
      }
      if (companyName !== undefined) {
        updateData.companyName = companyName || null;
      }
      if (companyAddress !== undefined) {
        updateData.companyAddress = companyAddress || null;
      }
      if (companyPhone !== undefined) {
        updateData.companyPhone = companyPhone || null;
      }
      if (companyEmail !== undefined) {
        updateData.companyEmail = companyEmail || null;
      }
      if (accountingYearStart !== undefined) {
        updateData.accountingYearStart = accountingYearStart;
      }
      if (standardVATRate !== undefined) {
        updateData.standardVATRate = standardVATRate;
      }
      if (zeroRatedVATRate !== undefined) {
        updateData.zeroRatedVATRate = zeroRatedVATRate;
      }
      if (exemptVATRate !== undefined) {
        updateData.exemptVATRate = exemptVATRate;
      }
      if (serviceChargeRate !== undefined) {
        updateData.serviceChargeRate = serviceChargeRate;
      }
      if (currency !== undefined) {
        updateData.currency = currency;
      }
      if (currencySymbol !== undefined) {
        updateData.currencySymbol = currencySymbol;
      }

      settings = await prisma.accountingSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error('Error updating accounting settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings', details: error.message },
      { status: 500 }
    );
  }
}

