import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      mediaItemId: searchParams.get('mediaItemId') || undefined,
      type: (searchParams.get('type') as any) || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    };

    const reqMock = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        authorization: request.headers.get('authorization') || undefined,
      },
      cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value])),
    };

    const result = await container.diaryController.list(reqMock, query);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao consultar histórico e diário' },
      { status: err.statusCode || 500 }
    );
  }
}

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

    const result = await container.diaryController.create(reqMock, body);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao criar registro no diário' },
      { status: err.statusCode || 400 }
    );
  }
}

