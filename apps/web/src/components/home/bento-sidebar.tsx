'use client';

import React from 'react';
import Link from 'next/link';
import type { HistoryEventDto, CalendarEventDto } from '../../../../../packages/shared/src/index.ts';

interface BentoSidebarProps {
  isAuthenticated: boolean;
  historyEvents?: HistoryEventDto[];
  upcomingEvents?: CalendarEventDto[];
  totalEpisodesWeekly?: number;
  totalHoursWeekly?: number;
}

export function BentoSidebar({
  isAuthenticated,
  historyEvents = [],
  upcomingEvents = [],
  totalEpisodesWeekly = 18,
  totalHoursWeekly = 7.2,
}: BentoSidebarProps) {
  // Dias da semana para a régua de constância (Seg a Dom)
  const daysOfWeek = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  // Simula dias ativos com base na semana atual (ou histórico real)
  const activeDays = [true, true, true, false, true, true, false];

  return (
    <aside aria-label="Painel Lateral Bento" className="rounded-2xl bg-surface-raised border border-stroke-subtle shadow-hairline-top divide-y divide-stroke-subtle">
      {/* 1. SEÇÃO: RESUMO SEMANAL */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">Resumo Semanal</h4>
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)]">Últimos 7 dias</span>
        </div>

        {/* Régua de Métricas Semanais De-Boxed */}
        <div className="grid grid-cols-2 divide-x divide-stroke-subtle py-2.5 border-y border-stroke-subtle/70">
          <div className="pr-4">
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider block">Episódios</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">{totalEpisodesWeekly}</span>
              <span className="text-[10px] text-emerald-400 font-medium">ritmo alto</span>
            </div>
          </div>

          <div className="pl-4">
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider block">Horas Vistas</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">{totalHoursWeekly}h</span>
              <span className="text-[10px] text-[var(--color-text-secondary)]">estimadas</span>
            </div>
          </div>
        </div>

        {/* Régua de Constância Diária */}
        <div className="pt-2 border-t border-stroke-subtle space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-secondary)]">Constância Diária</span>
            <span className="text-accent font-semibold flex items-center gap-1">
              5 Dias Seguidos (Ativo)
            </span>
          </div>

          <div className="flex items-center justify-between gap-1.5 pt-1">
            {daysOfWeek.map((day, idx) => {
              const isActive = activeDays[idx];
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full h-2 rounded-full transition-colors ${
                      isActive ? 'bg-accent' : 'bg-surface-overlay'
                    }`}
                  />
                  <span className="text-[10px] text-[var(--color-text-muted)]">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. SEÇÃO: PRÓXIMAS ESTREIAS */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">Próximas Estreias</h4>
          </div>
          <Link href="/calendar" className="text-[11px] text-accent hover:underline font-medium">
            Ver Grade
          </Link>
        </div>

        <div className="divide-y divide-stroke-subtle">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{event.mediaTitle}</p>
                  <p className="text-[10px] text-[var(--color-text-secondary)]">
                    {event.mediaType === 'MANGA' || event.mediaType === 'MANHWA' || event.mediaType === 'MANHUA'
                      ? 'Cap.'
                      : 'Ep.'}{' '}
                    {event.number ?? 1} • {event.hasTime ? '14:00 BRT' : 'Em breve'}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  HOJE
                </span>
              </div>
            ))
          ) : (
            <>
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">Demon Slayer: T4</p>
                  <p className="text-[10px] text-[var(--color-text-secondary)]">Episódio 5 • 17:30 BRT</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  HOJE
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">Wind Breaker</p>
                  <p className="text-[10px] text-[var(--color-text-secondary)]">Episódio 10 • 14:00 BRT</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-overlay text-[var(--color-text-secondary)] border border-stroke-subtle shrink-0">
                  AMANHÃ
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. SEÇÃO: FEED DE ATIVIDADE PESSOAL */}
      {isAuthenticated && (
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">Feed de Atividade</h4>
            </div>
            <Link href="/library" className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
              Ver Diário
            </Link>
          </div>

          <div className="divide-y divide-stroke-subtle">
            {historyEvents.length > 0 ? (
              historyEvents.slice(0, 2).map((ev) => (
                <div key={ev.id} className="text-xs space-y-1 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--color-text-primary)]">{ev.mediaItem?.title || 'Obra'}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">recente</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    {ev.episodeNumber
                      ? `Episódio ${ev.episodeNumber}`
                      : ev.chapterNumber
                        ? `Capítulo ${ev.chapterNumber}`
                        : ev.note || 'Novo registro no diário'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-xs space-y-1.5 py-2.5">
                <p className="font-medium text-[var(--color-text-primary)]">Registro recente:</p>
                <p className="text-[11px] text-[var(--color-text-secondary)] italic">
                  "Marcou Ep 14 de Sousou no Frieren e adicionou notas privadas."
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
