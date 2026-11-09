'use client';

/**
 * YuukiList — Calendário Integrado (Fase 1 do Módulo de Calendário)
 * Conforme Seção 7 do Documento Mestre de Contexto (P-031, P-032)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth-context.tsx';
import { LibraryApiClient } from '../../services/library-api.client.ts';
import type { LibraryItemDto } from '../../../../../packages/shared/src/index.ts';

type CalendarTab = 'LAUNCHES' | 'TRACKING' | 'SCHEDULE';

const libraryApi = new LibraryApiClient();

export default function CalendarPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<CalendarTab>('TRACKING');
  const [libraryItems, setLibraryItems] = useState<LibraryItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadItems() {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await libraryApi.list({ limit: 50 });
        setLibraryItems(res.data);
      } catch {
        setLibraryItems([]);
      } finally {
        setIsLoading(false);
      }
    }
    if (!isAuthLoading) {
      loadItems();
    }
  }, [isAuthenticated, isAuthLoading]);

  const ongoingItems = libraryItems.filter(
    (item) => item.status === 'ASSISTINDO' || item.status === 'LENDO'
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho do Calendário */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2337] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Calendário &amp; Lançamentos
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Acompanhe datas oficiais, novos episódios e sua agenda de exibição.
          </p>
        </div>

        {/* Abas do Calendário (Seção 7.1) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121624] rounded-xl border border-[#1E2337] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('TRACKING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'TRACKING'
                ? 'bg-[#06B6D4] text-black shadow'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Acompanhamento
          </button>
          <button
            onClick={() => setActiveTab('LAUNCHES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'LAUNCHES'
                ? 'bg-[#06B6D4] text-black shadow'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Lançamentos Gerais
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'SCHEDULE'
                ? 'bg-[#06B6D4] text-black shadow'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Minha Agenda
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTab === 'TRACKING' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
              Obras em Acompanhamento Ativo ({ongoingItems.length})
            </h2>
            <span className="text-xs text-[#64748B]">Datas sincronizadas com TVmaze / Kitsu</span>
          </div>

          {!isAuthenticated ? (
            <div className="p-8 rounded-2xl bg-[#101422] border border-[#1E2337] text-center space-y-4">
              <p className="text-[#94A3B8] text-sm">
                Entre na sua conta para acompanhar o calendário das suas obras em andamento.
              </p>
              <a
                href="/login"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#06B6D4] text-black font-semibold text-xs hover:bg-[#22D3EE] transition-colors"
              >
                Fazer Login
              </a>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 rounded-xl bg-[#121624] border border-[#1E2337] animate-pulse" />
              ))}
            </div>
          ) : ongoingItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#101422] border border-[#1E2337] text-center space-y-3">
              <p className="text-[#94A3B8] text-sm font-medium">
                Você não possui obras marcadas como &quot;Assistindo&quot; ou &quot;Lendo&quot; no momento.
              </p>
              <a
                href="/"
                className="inline-block text-xs font-semibold text-[#06B6D4] hover:underline"
              >
                Explorar catálogo de obras →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ongoingItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#101422] border border-[#1E2337] hover:border-[#06B6D4]/40 transition-colors flex gap-4"
                >
                  <img
                    src={`/api/v1/catalog/items/${item.mediaItem.slug}/cover`}
                    alt={item.mediaItem.title}
                    className="w-16 h-24 object-cover rounded-lg shrink-0 border border-[#262C3F]"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#06B6D4]">
                        {item.mediaItem.category}
                      </span>
                      <h3 className="text-sm font-bold text-white truncate mt-0.5">
                        {item.mediaItem.title}
                      </h3>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        Progresso: <strong className="text-white">{item.progress}</strong> de {item.mediaItem.totalEpisodes || item.mediaItem.totalChapters || '?'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#1E2337]/60">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Semanal
                      </span>
                      <span className="text-emerald-400 font-medium">Em dia</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'LAUNCHES' && (
        <div className="p-8 rounded-2xl bg-[#101422] border border-[#1E2337] text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#181C2B] text-[#06B6D4] flex items-center justify-center mx-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-white">Lançamentos da Temporada</h3>
          <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
            Visão consolidada das estreias e lançamentos de animes, doramas e capítulos da indústria asiática. A expansão de horários de exibição detalhados será liberada na fatia R14.
          </p>
        </div>
      )}

      {activeTab === 'SCHEDULE' && (
        <div className="p-8 rounded-2xl bg-[#101422] border border-[#1E2337] text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#181C2B] text-[#8B5CF6] flex items-center justify-center mx-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-white">Minha Agenda Pessoal</h3>
          <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
            Configure lembretes personalizados e organize dias específicos da semana para assistir ou ler suas obras prediletas.
          </p>
        </div>
      )}
    </div>
  );
}
