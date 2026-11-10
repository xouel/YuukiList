'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { SharedProfileViewDto } from '@yuukilist/shared';
import { profileApiClient } from '@/services/profile-api.client';

export default function SharedProfilePage() {
  const params = useParams();
  const token = params?.token as string;

  const [data, setData] = useState<SharedProfileViewDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    profileApiClient
      .getSharedView(token)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message || 'Link de compartilhamento expirado ou inexistente');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-zinc-400 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <p className="text-sm font-medium">Carregando perfil compartilhado...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-4xl block text-zinc-600">⌛</span>
        <h1 className="text-xl font-bold text-zinc-200">Link Indisponível</h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {error || 'Este link de compartilhamento expirou ou foi revogado pelo proprietário.'}
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-200 transition-colors"
        >
          Voltar ao YuukiList
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Banner de Aviso Somente Leitura */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-cyan-300 font-medium">
          <span>👀</span>
          <span>
            Você está visualizando a coleção compartilhada de <strong>{data.username}</strong> em modo somente leitura.
          </span>
        </div>
        <span className="text-zinc-400 font-mono text-[11px]">
          Válido até {new Date(data.expiresAt).toLocaleDateString('pt-BR')}
        </span>
      </div>

      {/* Cabeçalho do Perfil Compartilhado */}
      <section className="flex items-center gap-4 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-2xl font-black text-zinc-950 shadow-md">
          {data.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">
            Coleção de {data.username}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Membro do YuukiList desde{' '}
            {new Date(data.joinedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Resumo Rápido de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase">Obras Concluídas</span>
          <p className="text-xl font-bold text-zinc-100 font-mono mt-1">{data.stats.totalCompleted}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
          <span className="text-[11px] font-semibold text-cyan-400 uppercase">Horas Estimadas</span>
          <p className="text-xl font-bold text-cyan-300 font-mono mt-1">{data.stats.totalEstimatedHours}h</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
          <span className="text-[11px] font-semibold text-amber-400 uppercase">Capítulos Lidos</span>
          <p className="text-xl font-bold text-amber-300 font-mono mt-1">{data.stats.totalChaptersRead}</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
          <span className="text-[11px] font-semibold text-violet-400 uppercase">Média de Notas</span>
          <p className="text-xl font-bold text-violet-300 font-mono mt-1">
            {data.stats.averageRating ? `★ ${data.stats.averageRating}` : '—'}
          </p>
        </div>
      </div>

      {/* Grade de Obras Compartilhadas */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h2 className="text-base font-bold text-zinc-200">
            Obras Compartilhadas ({data.items.length})
          </h2>
          <span className="text-xs text-zinc-500 font-medium">Acesso Somente Leitura</span>
        </div>

        {data.items.length === 0 ? (
          <p className="text-xs text-zinc-500 py-8 text-center">Nenhuma obra compartilhada nesta lista.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {data.items.map((item) => (
              <div
                key={item.mediaItemId}
                className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col"
              >
                <div className="aspect-[3/4] w-full bg-zinc-800 overflow-hidden relative">
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {item.isFavorite && (
                    <span className="absolute top-1.5 right-1.5 text-rose-500 drop-shadow">♥</span>
                  )}
                  {item.rating && (
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                      ★ {item.rating}
                    </span>
                  )}
                </div>

                <div className="p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 uppercase">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {item.progress > 0 && `Prog: ${item.progress}`}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-zinc-200 truncate">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

