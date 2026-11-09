import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const result = await container.catalogController.getBySlug(slug);
    if (!result) {
      return NextResponse.json({ message: 'Obra não encontrada' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao consultar obra' },
      { status: err.statusCode || 500 }
    );
  }
}

