import { NextResponse } from 'next/server';
import { destroyKitchenSession } from '@/lib/kitchen-auth';

export async function POST(request: Request) {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Destroy kitchen session
    destroyKitchenSession(response);

    return response;
  } catch (error: any) {
    console.error('Kitchen logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout', details: error.message },
      { status: 500 }
    );
  }
}

