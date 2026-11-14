import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || !body.email) {
      return NextResponse.json(
        { message: 'O e-mail é obrigatório', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const result = await container.authModule.authController.requestPasswordReset(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    const statusCode = err?.statusCode || 500;
    return NextResponse.json(
      {
        message: err?.message || 'Erro ao processar solicitação de recuperação de senha',
        code: err?.code || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'VALIDATION_ERROR'),
      },
      { status: statusCode }
    );
  }
}

