import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function GET(request: NextRequest) {
  try {
    const reqMock = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        authorization: request.headers.get('authorization') || undefined,
      },
      cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value])),
    };

    let userId: string;
    try {
      const user = await container.authModule.authGuard.validateRequest(reqMock);
      userId = user.id;
    } catch {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const links = await container.profileController.getActiveShareLinks(userId);
    return NextResponse.json(links);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao carregar links de compartilhamento' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const reqMock = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        authorization: request.headers.get('authorization') || undefined,
      },
      cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value])),
    };

    let userId: string;
    try {
      const user = await container.authModule.authGuard.validateRequest(reqMock);
      userId = user.id;
    } catch {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const link = await container.profileController.createShareLink(userId, body);
    return NextResponse.json(link, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao criar link de compartilhamento' },
      { status: 500 }
    );
  }
}

