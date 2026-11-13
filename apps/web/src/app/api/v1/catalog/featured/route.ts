import { NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function GET() {
  try {
    const result = await container.catalogController.getFeaturedByCategory();
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro interno ao buscar destaques do catálogo' },
      { status: err.statusCode || 500 }
    );
  }
}

