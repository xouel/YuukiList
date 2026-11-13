import { NextResponse } from 'next/server';
import { container } from '@/server/container';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await container.checkDatabaseHealth();
  return NextResponse.json(result.body, {
    status: result.httpStatus,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

