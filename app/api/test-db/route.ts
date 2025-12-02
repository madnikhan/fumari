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
    try {
      await prisma.$connect();
      connectResult = 'success';
    } catch (connectError: any) {
      connectResult = `failed: ${connectError.message} (code: ${connectError.code})`;
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
        query: queryResult,
        userCount,
        prismaStatus,
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

