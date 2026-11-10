import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';
import { CalendarViewMode } from '@yuukilist/shared';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = (searchParams.get('view') as CalendarViewMode) || CalendarViewMode.RELEASES;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const category = searchParams.get('category') || undefined;

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
      // Visitante não autenticado
    }

    const result = await container.calendarController.getEvents({
      view,
      startDate,
      endDate,
      category,
      userId,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao carregar eventos de calendário' },
      { status: 500 }
    );
  }
}

