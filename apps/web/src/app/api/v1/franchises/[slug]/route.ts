import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const reqMock = {
      headers: {
        cookie: request.headers.get('cookie') || '',
        authorization: request.headers.get('authorization') || undefined,
      },
      cookies: Object.fromEntries(request.cookies.getAll().map((c) => [c.name, c.value])),
    };

    const result = await container.relationsController.getFranchise(reqMock, slug);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao carregar franquia' },
      { status: err.statusCode || 404 }
    );
  }
}

