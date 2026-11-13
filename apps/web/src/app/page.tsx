import React from 'react';
import { redirect } from 'next/navigation';
import { HomeHubView } from '../components/home/home-hub-view.tsx';
import { container } from '../server/container.ts';
import type { MediaItemSummaryDto } from '../../../../packages/shared/src/index.ts';

interface HomePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'YuukiList — Início & Painel de Acompanhamento',
  description: 'Acompanhe seus doramas, animes e mangás em andamento com progresso tátil e recomendações da temporada.',
};

export default async function HomePage(props: HomePageProps) {
  const searchParams = await props.searchParams;

  // Redireciona consultas de busca legadas diretamente para a rota /explore
  if (searchParams && (searchParams.q || searchParams.category || searchParams.country || searchParams.theme || searchParams.status)) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(searchParams)) {
      if (typeof val === 'string') {
        params.set(key, val);
      } else if (Array.isArray(val) && val[0]) {
        params.set(key, val[0]);
      }
    }
    redirect(`/explore?${params.toString()}`);
  }

  let initialFeatured: MediaItemSummaryDto[] = [];
  let initialCatalog: MediaItemSummaryDto[] = [];

  try {
    const [featuredRes, catalogRes] = await Promise.all([
      container.catalogController.getFeaturedByCategory(),
      container.catalogController.list({ page: 1, limit: 8 }),
    ]);
    initialFeatured = featuredRes.items || [];
    initialCatalog = catalogRes.data || [];
  } catch {
    // Fallback resiliente para carregamento no cliente caso DB esteja indisponível no SSR
  }

  return (
    <HomeHubView
      initialFeatured={initialFeatured}
      initialCatalog={initialCatalog}
    />
  );
}
