'use client';

/**
 * YuukiList — Rota de Detalhes da Obra (Dossiê)
 * /items/[slug] com Paleta Mineral Asian Editorial e Retorno Fluido
 */

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
      <div className="py-24 text-center animate-pulse">
        <div className="inline-flex items-center gap-2.5 text-sm font-semibold text-[#E05347]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E05347] animate-ping" />
          <span>Carregando dossiê da obra...</span>
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
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#9E98A8] hover:text-[#F4EFEA] bg-[#201D28] hover:bg-[#2B2735] border border-[#2B2735] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#E05347] outline-none min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar para o catálogo</span>
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
