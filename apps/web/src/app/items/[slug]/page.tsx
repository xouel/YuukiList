'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { MediaItemDetailDto } from '../../../../../../packages/shared/src/index.ts';
import { CatalogApiClient } from '../../../services/catalog-api.client.ts';
import { ItemDetailView } from '../../../components/catalog/item-detail-view.tsx';
import { ErrorState } from '../../../components/catalog/async-feedback.tsx';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [item, setItem] = useState<MediaItemDetailDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const client = new CatalogApiClient();

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    client
      .getItemBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setItem(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar detalhes da obra.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse">
        <div className="inline-flex items-center gap-2 text-sm text-[#06B6D4]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] animate-ping" />
          <span>Carregando detalhes da obra...</span>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#9CA3AF] hover:text-[#F3F4F6] bg-[#181C2B] hover:bg-[#1F2438] border border-[#262C3F] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] outline-none"
          >
            ← Voltar para o catálogo
          </button>
        </div>
        <ErrorState
          message={error || 'Obra não encontrada no catálogo.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return <ItemDetailView item={item} onBack={handleBack} />;
}
