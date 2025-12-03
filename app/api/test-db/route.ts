import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function GET() {
  try {
    // Test 1: Check DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    const dbUrlInfo = dbUrl 
      ? {
          exists: true,
          host: new URL(dbUrl).hostname,
          port: new URL(dbUrl).port,
          database: new URL(dbUrl).pathname,
        }
      : { exists: false };

    // Test 2: Try to connect
    let connectResult = 'not attempted';
    let connectErrorCode = null;
    let connectHint = null;
    try {
      await prisma.$connect();
      connectResult = 'success';
    } catch (connectError: any) {
      connectErrorCode = connectError.code || 'UNKNOWN';
      connectResult = `failed: ${connectError.message} (code: ${connectErrorCode})`;
      
      // Provide helpful hints based on error code
      if (connectErrorCode === 'P1001') {
        connectHint = 'Cannot reach database server. Most likely: Supabase project is paused. Go to Supabase Dashboard → Resume project → Wait 2 minutes → Test again.';
      } else if (connectErrorCode === 'P1000') {
        connectHint = 'Authentication failed. Check if DATABASE_URL password is correct. Reset password in Supabase if needed.';
      } else if (connectErrorCode === 'P1017') {
        connectHint = 'Server closed connection. Add ?sslmode=require to DATABASE_URL connection string.';
      } else if (connectErrorCode === 'P1002') {
        connectHint = 'Connection timeout. Check if Supabase project is active and network is accessible.';
      }
    }

    // Test 3: Try a simple query
    let queryResult = 'not attempted';
    let userCount = 0;
    try {
      userCount = await prisma.user.count();
      queryResult = `success: ${userCount} users found`;
    } catch (queryError: any) {
      queryResult = `failed: ${queryError.message} (code: ${queryError.code})`;
      if (queryError.meta) {
        queryResult += ` | meta: ${JSON.stringify(queryError.meta)}`;
      }
    }

    // Test 4: Check Prisma Client status
    const prismaStatus = {
      isConnected: await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
    };

    return NextResponse.json({
      success: true,
      tests: {
        databaseUrl: dbUrlInfo,
        connection: connectResult,
        connectionErrorCode: connectErrorCode,
        connectionHint: connectHint,
        query: queryResult,
        userCount,
        prismaStatus,
        // Additional diagnostics
        diagnostics: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlStartsWithPostgresql: process.env.DATABASE_URL?.startsWith('postgresql://'),
          databaseUrlHasSslMode: process.env.DATABASE_URL?.includes('sslmode=require'),
          nodeEnv: process.env.NODE_ENV,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 5),
        meta: error.meta,
      },
    }, { status: 500 });
  }
}

