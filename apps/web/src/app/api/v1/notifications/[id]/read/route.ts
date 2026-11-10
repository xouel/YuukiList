import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reqMock = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        authorization: request.headers.get('authorization') || undefined,
      },
      cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value])),
    };

    let userId: string | undefined = undefined;
    try {
      const user = await container.authModule.authGuard.validateRequest(reqMock);
      userId = user.id;
    } catch {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const result = await container.calendarController.markAsRead(userId, id);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao marcar notificação como lida' },
      { status: 500 }
    );
  }
}

