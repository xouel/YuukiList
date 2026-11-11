import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { container } from '@/server/container';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('yuukilist_session')?.value;
    const session = token ? container.authModule.tokenService.verifySession(token) : null;
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = await container.adminController.moderateRequest(session.sub, session.role, id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 400;
    return NextResponse.json({ message: error.message || 'Erro na moderação' }, { status: statusCode });
  }
}

