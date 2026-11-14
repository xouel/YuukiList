import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { message: 'Corpo da requisição inválido', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    let setCookieHeader = '';

    const mockRes = {
      setHeader(name: string, value: string) {
        if (name.toLowerCase() === 'set-cookie') {
          setCookieHeader = value;
        }
      },
    };

    const result = await container.authModule.authController.login(body, mockRes);
    const headers = new Headers();
    if (setCookieHeader) {
      headers.set('Set-Cookie', setCookieHeader);
    }

    return NextResponse.json(result, { status: 200, headers });
  } catch (err: any) {
    const statusCode = err?.statusCode || 500;
    const message =
      statusCode >= 500
        ? 'Erro temporário no servidor ao autenticar. Tente novamente.'
        : err?.message || 'Usuário/e-mail ou senha incorretos.';

    return NextResponse.json(
      {
        message,
        code: err?.code || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'INVALID_CREDENTIALS'),
      },
      { status: statusCode }
    );
  }
}

