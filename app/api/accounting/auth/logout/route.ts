import { NextResponse } from 'next/server';
import { destroyAccountingSession } from '@/lib/accounting-auth';

export async function POST(request: Request) {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Destroy accounting session
    destroyAccountingSession(response);

    return response;
  } catch (error: any) {
    console.error('Accounting logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout', details: error.message },
      { status: 500 }
    );
  }
}

