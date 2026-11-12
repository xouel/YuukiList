import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaItemId: string }> }
) {
  try {
    const { mediaItemId } = await params;
    const reqMock = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        authorization: request.headers.get('authorization') || undefined,
      },
      cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value])),
    };

    const result = await container.libraryController.getItem(reqMock, mediaItemId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao consultar item da biblioteca' },
      { status: err.statusCode || 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ mediaItemId: string }> }
) {
  try {
    const { mediaItemId } = await params;
    const body = await request.json();
    const reqMock = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        authorization: request.headers.get('authorization') || undefined,
      },
      cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value])),
    };

    const result = await container.libraryController.updateItem(reqMock, mediaItemId, body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao atualizar item da biblioteca' },
      { status: err.statusCode || 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mediaItemId: string }> }
) {
  try {
    const { mediaItemId } = await params;
    const reqMock = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        authorization: request.headers.get('authorization') || undefined,
      },
      cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value])),
    };

    const result = await container.libraryController.removeItem(reqMock, mediaItemId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao remover item da biblioteca' },
      { status: err.statusCode || 404 }
    );
  }
}

