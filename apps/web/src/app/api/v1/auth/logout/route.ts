import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function POST(request: NextRequest) {
  try {
    let setCookieHeader = '';
    const mockRes = {
      setHeader(name: string, value: string) {
        if (name.toLowerCase() === 'set-cookie') {
          setCookieHeader = value;
        }
      },
    };
    const mockReq = {
      headers: {
        cookie: request.headers.get('cookie') || undefined,
        authorization: request.headers.get('authorization') || undefined,
      },
    };

    const result = await container.authModule.authController.logout(mockRes, mockReq);
    const headers = new Headers();
    if (setCookieHeader) {
      headers.set('Set-Cookie', setCookieHeader);
    }

    return NextResponse.json(result, { status: 200, headers });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao encerrar sessão' },
      { status: err.statusCode || 500 }
    );
  }
}

