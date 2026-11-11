import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { container } from '@/server/container';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('yuukilist_session')?.value;
    const session = token ? container.authModule.tokenService.verifySession(token) : null;
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const result = await container.provisionalController.getMyRequests(session.sub);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Erro ao listar solicitações' }, { status: 500 });
  }
}
