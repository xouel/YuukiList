import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/server/container';
import {
  CatalogIngestionService,
  TmdbClient,
  TvmazeClient,
  type CanonicalExternalMediaDto,
} from '@yuukilist/api';

const ingestionService = new CatalogIngestionService(container.catalogRepository);
const tmdbClient = new TmdbClient();
const tvmazeClient = new TvmazeClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let canonicalDto: CanonicalExternalMediaDto | null = null;

    if (body.title && body.source && body.externalId) {
      // Já é um CanonicalExternalMediaDto completo retornado pela busca federada
      canonicalDto = body as CanonicalExternalMediaDto;
    } else if (body.source && body.externalId) {
      // Ingestão por referência de ID externo
      const { source, externalId, category } = body;
      if (source === 'TMDB') {
        canonicalDto = await tmdbClient.getDetails(
          String(externalId),
          category === 'FILME' ? 'movie' : 'tv'
        );
      } else if (source === 'TVMAZE') {
        canonicalDto = await tvmazeClient.getShowWithEpisodes(String(externalId));
      }
    }

    if (!canonicalDto) {
      return NextResponse.json(
        { message: 'Dados insuficientes para ingestao da obra externa' },
        { status: 400 }
      );
    }

    const storedItem = await ingestionService.ingestFromExternalDto(canonicalDto);
    const detail = await container.catalogService.getItemBySlug(storedItem.slug);

    return NextResponse.json(detail || storedItem, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao ingerir obra externa' },
      { status: 500 }
    );
  }
}

