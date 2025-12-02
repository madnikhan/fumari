import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { generateTableToken, getTableQRUrl, generateQRCodeDataURL } from '@/lib/qrcode';
import { getSessionFromRequest } from '@/lib/auth';

// Generate QR codes for all tables or a specific table
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse body if it exists (for generating specific table)
    // If no body, we'll generate for all tables
    let tableId: string | undefined;
    let tableNumber: number | undefined;
    
    try {
      const contentType = request.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const body = await request.json().catch(() => ({}));
        tableId = body.tableId;
        tableNumber = body.tableNumber;
      }
    } catch (e: any) {
      // Body is empty or invalid, continue with empty body
      console.log('No body or invalid JSON, generating for all tables');
    }

    // If tableId or tableNumber is provided, generate for that specific table
    // Otherwise, generate for all tables
    let table;
    if (tableId) {
      table = await prisma.table.findUnique({ where: { id: tableId } });
    } else if (tableNumber) {
      table = await prisma.table.findUnique({ where: { number: tableNumber } });
    }
    
    // If no specific table requested, generate for all tables
    if (!table && !tableId && !tableNumber) {
      // Generate for all tables
      const tables = await prisma.table.findMany();
      
      if (tables.length === 0) {
        return NextResponse.json(
          { error: 'No tables found. Please create tables first.' },
          { status: 404 }
        );
      }

      const results = [];

      for (const t of tables) {
        try {
          console.log(`Generating QR code for table ${t.number}...`);
          const token = generateTableToken(t.number);
          console.log(`Token generated: ${token.substring(0, 8)}...`);
          
          const qrUrl = getTableQRUrl(t.number, token);
          console.log(`QR URL: ${qrUrl}`);
          
          const qrCodeDataURL = await generateQRCodeDataURL(qrUrl);
          console.log(`QR code generated (length: ${qrCodeDataURL.length})`);

          // Update table with QR code token
          await prisma.table.update({
            where: { id: t.id },
            data: { qrCode: token },
          });

          results.push({
            tableId: t.id,
            tableNumber: t.number,
            qrCode: qrCodeDataURL,
            url: qrUrl,
          });
          console.log(`Successfully generated QR code for table ${t.number}`);
        } catch (error: any) {
          console.error(`Error generating QR code for table ${t.number}:`, error);
          console.error('Error stack:', error.stack);
          console.error('Error name:', error.name);
          // Continue with other tables even if one fails
        }
      }

      if (results.length === 0) {
        return NextResponse.json(
          { error: 'Failed to generate QR codes for any tables' },
          { status: 500 }
        );
      }

      return NextResponse.json({ qrCodes: results }, { status: 200 });
    }

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Generate QR code for specific table
    const token = generateTableToken(table.number);
    const qrUrl = getTableQRUrl(table.number, token);
    const qrCodeDataURL = await generateQRCodeDataURL(qrUrl);

    // Update table with QR code token
    await prisma.table.update({
      where: { id: table.id },
      data: { qrCode: token },
    });

    return NextResponse.json({
      tableId: table.id,
      tableNumber: table.number,
      qrCode: qrCodeDataURL,
      url: qrUrl,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating QR codes:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    return NextResponse.json(
      { 
        error: 'Failed to generate QR codes', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Get QR code for a table
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');
    const tableNumber = searchParams.get('tableNumber');

    let table;
    if (tableId) {
      table = await prisma.table.findUnique({ where: { id: tableId } });
    } else if (tableNumber) {
      table = await prisma.table.findUnique({ where: { number: parseInt(tableNumber) } });
    } else {
      return NextResponse.json(
        { error: 'tableId or tableNumber is required' },
        { status: 400 }
      );
    }

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Generate token if doesn't exist
    let token = table.qrCode;
    if (!token) {
      const { generateTableToken } = await import('@/lib/qrcode');
      token = generateTableToken(table.number);
      await prisma.table.update({
        where: { id: table.id },
        data: { qrCode: token },
      });
    }

    const { getTableQRUrl, generateQRCodeDataURL } = await import('@/lib/qrcode');
    const qrUrl = getTableQRUrl(table.number, token);
    const qrCodeDataURL = await generateQRCodeDataURL(qrUrl);

    return NextResponse.json({
      tableId: table.id,
      tableNumber: table.number,
      qrCode: qrCodeDataURL,
      url: qrUrl,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching QR code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR code', details: error.message },
      { status: 500 }
    );
  }
}

