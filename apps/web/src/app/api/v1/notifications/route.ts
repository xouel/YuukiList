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

    let userId: string | undefined = undefined;
    try {
      const user = await container.authModule.authGuard.validateRequest(reqMock);
      userId = user.id;
    } catch {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const result = await container.calendarController.getNotifications(userId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao carregar notificações' },
      { status: 500 }
    );
  }
}

