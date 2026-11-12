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

    const account = await container.profileController.getAccount(userId);
    return NextResponse.json(account || {});
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao consultar conta' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const updated = await container.profileController.updateProfile(userId, body);
    return NextResponse.json(updated || {});
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao atualizar dados do perfil' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const result = await container.profileController.deleteAccount(userId, body);

    const response = NextResponse.json(result);
    // Invalida cookie de sessão no cliente
    response.cookies.set('yuuki_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao processar exclusão de conta' },
      { status: 400 }
    );
  }
}

