import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization') || undefined;

    const reqMock = {
      headers: {
        cookie: cookieHeader,
        authorization: authHeader,
      },
    };

    const user = await container.authModule.authController.getMe(reqMock, { bypassCache: true });
    return NextResponse.json(user, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Não autenticado' },
      { status: err.statusCode || 401 }
    );
  }
}

