import React from 'react';
import { CatalogView } from '../../components/catalog/catalog-view.tsx';
import { CatalogApiClient } from '../../services/catalog-api.client.ts';
import { container } from '../../server/container.ts';
import type { CatalogQueryDto, FederatedCatalogResponse } from '../../../../../packages/shared/src/index.ts';

interface ExplorePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Explorar Catálogo — YuukiList',
  description: 'Catálogo unificado de doramas, filmes, animes, mangás, manhwas e manhuas com filtros avançados.',
};

export default async function ExplorePage(props: ExplorePageProps) {
  const rawParams = (await props.searchParams) || {};
  const parser = new CatalogApiClient();
  const initialQuery: CatalogQueryDto = parser.parseQueryParams(rawParams);

  let initialData: FederatedCatalogResponse | undefined;
  try {
    initialData = await container.catalogController.list(initialQuery);
  } catch {
    // Fallback seguro: CatalogView carrega no cliente se o SSR falhar
  }

  return <CatalogView initialQuery={initialQuery} initialData={initialData} />;
}
