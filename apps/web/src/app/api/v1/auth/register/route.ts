import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let setCookieHeader = '';

    const mockRes = {
      setHeader(name: string, value: string) {
        if (name.toLowerCase() === 'set-cookie') {
          setCookieHeader = value;
        }
      },
    };

    const result = await container.authModule.authController.register(body, mockRes);
    const headers = new Headers();
    if (setCookieHeader) {
      headers.set('Set-Cookie', setCookieHeader);
    }

    return NextResponse.json(result, { status: 201, headers });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao registrar usuário' },
      { status: err.statusCode || 400 }
    );
  }
}

