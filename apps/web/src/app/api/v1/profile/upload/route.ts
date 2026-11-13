import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB (compatível com limite de payload da Vercel)
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'avatar';

    if (!file) {
      return NextResponse.json({ message: 'Arquivo não informado' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: 'Formato inválido. Envie uma imagem JPEG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'Arquivo inválido ou muito grande. O limite máximo é de 4 MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = file.type.split('/')[1] || 'webp';
    const filename = `${userId}/${type}-${Date.now()}.${extension}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let publicUrl = '';

    if (supabaseUrl && supabaseKey) {
      try {
        const uploadRes = await fetch(
          `${supabaseUrl}/storage/v1/object/profiles/${filename}`,
          {
            method: 'POST',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': file.type,
              'x-upsert': 'true',
            },
            body: new Uint8Array(bytes),
          }
        );

        if (uploadRes.ok) {
          publicUrl = `${supabaseUrl}/storage/v1/object/public/profiles/${filename}`;
        }
      } catch {
        // Fallback para Base64 persistente caso o bucket ainda não esteja criado
      }
    }

    // Se o upload remoto não foi concluído, gera Data URL válida de alta fidelidade
    if (!publicUrl) {
      publicUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Falha ao processar upload de imagem' },
      { status: 500 }
    );
  }
}

