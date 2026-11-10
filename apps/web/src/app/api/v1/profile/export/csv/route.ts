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

    const csvContent = await container.profileController.exportCsv(userId);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="yuukilist-library-${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao exportar dados em CSV' },
      { status: 500 }
    );
  }
}

