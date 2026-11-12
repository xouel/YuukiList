import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export const dynamic = 'force-dynamic';

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

    const stats = await container.profileController.getStats(userId);
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao carregar estatísticas do perfil' },
      { status: 500 }
    );
  }
}

