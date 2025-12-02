import { NextResponse } from 'next/server';
import { getKitchenSessionFromRequest } from '@/lib/kitchen-auth';

export async function GET(request: Request) {
  try {
    const authenticated = getKitchenSessionFromRequest(request);

    return NextResponse.json({
      authenticated,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error checking kitchen session:', error);
    return NextResponse.json(
      { authenticated: false, error: error.message },
      { status: 500 }
    );
  }
}

