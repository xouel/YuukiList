import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      q: searchParams.get('q') || undefined,
      category: (searchParams.get('category') as any) || undefined,
      status: (searchParams.get('status') as any) || undefined,
      genre: searchParams.get('genre') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      sortBy: (searchParams.get('sortBy') as any) || undefined,
      includeExternal: searchParams.get('includeExternal') !== null
        ? searchParams.get('includeExternal') === 'true'
        : undefined,
    };

    const result = await container.catalogController.list(query);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro interno do servidor' },
      { status: err.statusCode || 500 }
    );
  }
}

