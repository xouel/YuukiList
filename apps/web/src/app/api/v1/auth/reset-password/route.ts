import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || '';
    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token de redefinição não fornecido', code: 'RESET_TOKEN_INVALID' },
        { status: 400 }
      );
    }

    const result = await container.authModule.authController.validateResetToken(token);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    const statusCode = err?.statusCode || 400;
    return NextResponse.json(
      {
        valid: false,
        message: err?.message || 'Link de redefinição inválido ou expirado',
        code: err?.code || 'RESET_TOKEN_INVALID',
      },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || !body.token || !body.newPassword) {
      return NextResponse.json(
        { message: 'Token e nova senha são obrigatórios', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const result = await container.authModule.authController.resetPassword(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    const statusCode = err?.statusCode || 400;
    return NextResponse.json(
      {
        message: err?.message || 'Falha ao redefinir senha',
        code: err?.code || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'RESET_TOKEN_INVALID'),
      },
      { status: statusCode }
    );
  }
}
