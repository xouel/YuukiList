import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cover = container.catalogController.getCover(slug);

    return new Response(cover.svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  } catch {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect width="100%" height="100%" fill="#181C2B"/></svg>',
      {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
      }
    );
  }
}

