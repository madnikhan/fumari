import { NextResponse } from 'next/server';
import { getAccountingSessionFromRequest } from '@/lib/accounting-auth';

export async function GET(request: Request) {
  try {
    const authenticated = getAccountingSessionFromRequest(request);

    return NextResponse.json({
      authenticated,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error checking accounting session:', error);
    return NextResponse.json(
      { authenticated: false, error: error.message },
      { status: 500 }
    );
  }
}

