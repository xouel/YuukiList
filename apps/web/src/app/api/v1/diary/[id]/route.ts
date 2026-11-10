import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reqMock = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        authorization: request.headers.get('authorization') || undefined,
      },
      cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value])),
    };

    const result = await container.diaryController.deleteEvent(reqMock, id);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao excluir registro do diário' },
      { status: err.statusCode || 400 }
    );
  }
}

