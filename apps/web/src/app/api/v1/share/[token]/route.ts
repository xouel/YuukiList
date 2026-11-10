import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const result = await container.profileController.getSharedView(token);
    return NextResponse.json(result);
  } catch (err: any) {
    const isGone = err.message && (err.message.includes('expirado') || err.message.includes('revogado'));
    return NextResponse.json(
      { message: err.message || 'Link inválido' },
      { status: isGone ? 410 : 404 }
    );
  }
}

