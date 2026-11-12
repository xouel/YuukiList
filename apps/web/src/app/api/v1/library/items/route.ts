import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reqMock = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        authorization: request.headers.get('authorization') || undefined,
      },
      cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value])),
    };

    const result = await container.libraryController.addItem(reqMock, body);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao adicionar item' },
      { status: err.statusCode || 400 }
    );
  }
}

