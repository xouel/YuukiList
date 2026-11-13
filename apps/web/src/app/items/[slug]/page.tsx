import React from 'react';
import type { MediaItemDetailDto } from '../../../../../../packages/shared/src/index.ts';
import { container } from '../../../server/container.ts';
import { ItemDetailRouteView } from '../../../components/catalog/item-detail-route-view.tsx';

interface ItemDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ItemDetailPage(props: ItemDetailPageProps) {
  const { slug } = await props.params;
  let initialItem: MediaItemDetailDto | null = null;

  try {
    initialItem = await container.catalogController.getBySlug(slug);
  } catch {
    // Fallback seguro: cliente busca via API caso SSR falhe
  }

  return <ItemDetailRouteView slug={slug} initialItem={initialItem} />;
}
