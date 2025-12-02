import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getSessionFromRequest } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'acknowledge' or 'complete'

    // Find the buzzer request
    const buzzerRequest = await prisma.buzzerRequest.findUnique({
      where: { id },
    });

    if (!buzzerRequest) {
      return NextResponse.json(
        { error: 'Buzzer request not found' },
        { status: 404 }
      );
    }

    // Update based on action
    let updateData: any = {};
    if (action === 'acknowledge') {
      updateData = {
        status: 'acknowledged',
        acknowledgedBy: session.userId,
        acknowledgedAt: new Date(),
      };
    } else if (action === 'complete') {
      updateData = {
        status: 'completed',
        completedAt: new Date(),
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "acknowledge" or "complete"' },
        { status: 400 }
      );
    }

    const updated = await prisma.buzzerRequest.update({
      where: { id },
      data: updateData,
      include: {
        table: {
          select: {
            number: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error('Error updating buzzer request:', error);
    return NextResponse.json(
      { error: 'Failed to update buzzer request', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear completed requests
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.buzzerRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting buzzer request:', error);
    return NextResponse.json(
      { error: 'Failed to delete buzzer request', details: error.message },
      { status: 500 }
    );
  }
}

