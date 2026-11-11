import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { container } from '@/server/container';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('yuukilist_session')?.value;
    const session = token ? container.authModule.tokenService.verifySession(token) : null;
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const result = await container.provisionalController.createRequest(session.sub, session.username, body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Erro ao criar solicitação' }, { status: 400 });
  }
}
