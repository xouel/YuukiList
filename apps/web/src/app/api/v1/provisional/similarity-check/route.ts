import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await container.provisionalController.checkSimilarity(body.title);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Erro ao checar similaridade' }, { status: 400 });
  }
}

