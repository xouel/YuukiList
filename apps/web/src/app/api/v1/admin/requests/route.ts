import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { container } from '@/server/container';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('yuukilist_session')?.value;
    const session = token ? container.authModule.tokenService.verifySession(token) : null;
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;

    const result = await container.adminController.listRequests(session.role, status || undefined);
    return NextResponse.json(result);
  } catch (error: any) {
    const statusCode = error.statusCode || 403;
    return NextResponse.json({ message: error.message || 'Acesso negado' }, { status: statusCode });
  }
}
