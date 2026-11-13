'use client';

/**
 * YuukiList — Wrapper Cliente para a Rota de Detalhes da Obra (/items/[slug])
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { MediaItemDetailDto } from '../../../../../packages/shared/src/index.ts';
import { CatalogApiClient } from '../../services/catalog-api.client.ts';
import { ItemDetailView } from './item-detail-view.tsx';
import { ErrorState } from './async-feedback.tsx';

interface ItemDetailRouteViewProps {
  slug: string;
  initialItem?: MediaItemDetailDto | null;
}

const catalogClient = new CatalogApiClient();

export function ItemDetailRouteView({ slug, initialItem = null }: ItemDetailRouteViewProps) {
  const router = useRouter();
  const [item, setItem] = useState<MediaItemDetailDto | null>(initialItem);
  const [loading, setLoading] = useState<boolean>(!initialItem);
  const [error, setError] = useState<string | null>(null);

  const loadItem = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await catalogClient.getItemBySlug(slug);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar detalhes da obra.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (initialItem && initialItem.slug === slug) {
      setItem(initialItem);
      setLoading(false);
      setError(null);
      return;
    }
    loadItem();
  }, [slug, initialItem, loadItem]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="py-24 text-center animate-pulse">
        <div className="inline-flex items-center gap-2.5 text-sm font-semibold text-accent">
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
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
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-surface-raised hover:bg-surface-overlay border border-stroke-subtle rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent outline-none min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar para o catálogo</span>
          </button>
        </div>
        <ErrorState
          message={error || 'Obra não encontrada no catálogo.'}
          onRetry={loadItem}
        />
      </div>
    );
  }

  return <ItemDetailView item={item} onBack={handleBack} />;
}

