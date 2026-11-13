import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

function buildReqMock(request: NextRequest) {
  return {
    headers: {
      cookie: request.headers.get('cookie') || '',
      authorization: request.headers.get('authorization') || undefined,
    },
    cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value])),
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await container.diaryController.update(buildReqMock(request), id, body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao atualizar registro do diário' },
      { status: err.statusCode || 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await container.diaryController.remove(buildReqMock(request), id);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao excluir registro do diário' },
      { status: err.statusCode || 400 }
    );
  }
}

