'use client';

/**
 * YuukiList — Página de Universo e Franquia Transmídia
 * Conforme Requisito: Franchise Universe Explorer View with Timeline Modes
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { FranchiseDto } from '../../../../../../packages/shared/src/index.ts';
import { RelationsApiClient } from '../../../services/relations-api.client.ts';
import { FranchiseView } from '../../../components/relations/franchise-view.tsx';

export default function FranchiseDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [franchise, setFranchise] = useState<FranchiseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const client = new RelationsApiClient();

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    client
      .getFranchise(slug)
      .then((data) => {
        if (isMounted) {
          setFranchise(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar franquia.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center animate-pulse">
        <div className="inline-flex items-center gap-2 text-sm text-[#06B6D4]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] animate-ping" />
          <span>Carregando universo da franquia...</span>
        </div>
      </div>
    );
  }

  if (error || !franchise) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800 flex items-center justify-center mx-auto text-xl">
          ⚠
        </div>
        <h2 className="text-lg font-bold text-[#F3F4F6]">
          {error || 'Franquia não encontrada'}
        </h2>
        <p className="text-xs text-[#9CA3AF]">
          Não foi possível localizar este universo transmídia ou o identificador informado está incorreto.
        </p>
        <div>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181C2B] hover:bg-[#262C3F] text-[#06B6D4] border border-[#06B6D4]/30 font-semibold text-xs transition-colors"
          >
            ← Voltar ao catálogo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <FranchiseView franchise={franchise} />
    </div>
  );
}

