'use client';

/**
 * YuukiList — Visualização da Linha do Tempo e Diário Pessoal
 * Conforme Requisito: Interactive Timeline View and Unit Notes Interface
 */

import React from 'react';
import type { HistoryEventDto, HistoryEventType } from '../../../../../packages/shared/src/index.ts';
import { SpoilerMask } from './spoiler-mask.tsx';

export interface TimelineViewProps {
  events: HistoryEventDto[];
  isLoading?: boolean;
  onDeleteEvent?: (eventId: string) => Promise<void>;
  onAddNoteClick?: () => void;
}

const EVENT_TYPE_CONFIG: Record<HistoryEventType, { label: string; color: string; dot: string; icon: string }> = {
  STATUS_CHANGE: {
    label: 'Status Alterado',
    color: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
    dot: 'bg-cyan-400 ring-cyan-950',
    icon: '⚡',
  },
  PROGRESS_UPDATE: {
    label: 'Progresso Atualizado',
    color: 'bg-purple-950/80 text-purple-300 border-purple-800',
    dot: 'bg-purple-400 ring-purple-950',
    icon: '▶',
  },
  COMPLETED: {
    label: 'Obra Concluída',
    color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    dot: 'bg-emerald-400 ring-emerald-950',
    icon: '✓',
  },
  RATING_SET: {
    label: 'Nota Avaliada',
    color: 'bg-amber-950/80 text-amber-300 border-amber-800',
    dot: 'bg-amber-400 ring-amber-950',
    icon: '★',
  },
  FAVORITE_TOGGLED: {
    label: 'Favorito',
    color: 'bg-rose-950/80 text-rose-300 border-rose-800',
    dot: 'bg-rose-400 ring-rose-950',
    icon: '♥',
  },
  REWATCH_CYCLE: {
    label: 'Novo Ciclo',
    color: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
    dot: 'bg-indigo-400 ring-indigo-950',
    icon: '↻',
  },
  NOTE: {
    label: 'Anotação do Diário',
    color: 'bg-sky-950/80 text-sky-300 border-sky-800',
    dot: 'bg-sky-400 ring-sky-950',
    icon: '📝',
  },
  EXPERIENCE: {
    label: 'Experiência Registrada',
    color: 'bg-teal-950/80 text-teal-300 border-teal-800',
    dot: 'bg-teal-400 ring-teal-950',
    icon: '✨',
  },
};

export function TimelineView({
  events,
  isLoading = false,
  onDeleteEvent,
  onAddNoteClick,
}: TimelineViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 py-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-surface-raised border border-stroke-subtle" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-16 px-4 text-center border border-dashed border-stroke-subtle rounded-2xl bg-surface-sunken/40 max-w-lg mx-auto my-6">
        <div className="w-14 h-14 rounded-full bg-surface-raised border border-stroke-subtle flex items-center justify-center mx-auto mb-4 text-accent shadow-sm">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Seu diário ainda não possui registros</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-sm mx-auto">
          À medida que você avança suas obras ou registra anotações privadas sobre episódios, sua linha do tempo será construída aqui!
        </p>
        {onAddNoteClick && (
          <div className="mt-6">
            <button
              type="button"
              onClick={onAddNoteClick}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer"
            >
              + Nova Anotação
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-stroke-subtle">
      {events.map((event) => {
        const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.NOTE;
        const media = event.mediaItem;
        const dateObj = new Date(event.occurredAt);
        const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const timeFormatted = dateObj.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <article
            key={event.id}
            className="relative bg-surface-raised rounded-xl border border-stroke-subtle p-4 sm:p-5 hover:border-stroke-accent transition-all shadow-sm group"
          >
            {/* Marcador na Linha do Tempo */}
            <span
              className={`absolute -left-[29px] sm:-left-[37px] top-5 w-3.5 h-3.5 rounded-full ring-4 ring-[var(--surface-canvas)] ${config.dot}`}
              aria-hidden="true"
            />

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              {/* Informações da Obra e Evento */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {media && (
                  <div className="relative w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-surface-canvas border border-stroke-subtle">
                    <img
                      src={media.coverUrl || '/covers/fallback.svg'}
                      alt={`Capa de ${media.title}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border ${config.color}`}
                    >
                      {config.icon} {config.label}
                    </span>

                    {/* Unidade (Episódio / Capítulo / Volume) */}
                    {typeof event.episodeNumber === 'number' && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-black/60 text-purple-300 border border-purple-800/40">
                        Episódio {event.episodeNumber}
                      </span>
                    )}
                    {typeof event.chapterNumber === 'number' && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-black/60 text-rose-300 border border-rose-800/40">
                        Capítulo {event.chapterNumber}
                      </span>
                    )}
                    {typeof event.volumeNumber === 'number' && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-black/60 text-cyan-300 border border-cyan-800/40">
                        Volume {event.volumeNumber}
                      </span>
                    )}

                    <span className="text-[11px] text-[#94A3B8]">
                      {dateFormatted} às {timeFormatted}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm sm:text-base text-[var(--color-text-primary)] truncate">
                    {media?.title || 'Obra do Acervo'}
                  </h4>

                  {/* Resumo do Delta */}
                  {event.type === 'PROGRESS_UPDATE' && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      {event.previousProgress !== null && event.previousProgress !== undefined
                        ? `Avançou de ${event.previousProgress} para ${event.newProgress} unidades`
                        : `Progresso: ${event.newProgress} unidades`}
                    </p>
                  )}

                  {event.type === 'STATUS_CHANGE' && event.newStatus && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      Status alterado para <strong>{event.newStatus}</strong>
                    </p>
                  )}

                  {event.type === 'RATING_SET' && typeof event.rating === 'number' && (
                    <p className="text-xs text-amber-500 mt-1 font-semibold">
                      Atribuiu nota ★ {event.rating.toFixed(1)}
                    </p>
                  )}

                  {event.type === 'FAVORITE_TOGGLED' && (
                    <p className="text-xs text-rose-500 mt-1 font-semibold">
                      {event.isFavorite ? 'Marcou como favorito ♥' : 'Desmarcou favorito'}
                    </p>
                  )}

                  {event.type === 'REWATCH_CYCLE' && (
                    <p className="text-xs text-purple-400 mt-1 font-semibold">
                      Iniciou ciclo de repetição (Total: {event.rewatchCount}x)
                    </p>
                  )}

                  {/* Anotação do Usuário (com Proteção Anti-Spoiler se aplicável) */}
                  {event.note && (
                    <div className="mt-3">
                      {event.containsSpoiler ? (
                        <SpoilerMask
                          isMaskedDefault={Boolean(event.isMasked)}
                          label={`Spoiler • ${event.episodeNumber ? `Ep. ${event.episodeNumber}` : event.chapterNumber ? `Cap. ${event.chapterNumber}` : 'Obra'}`}
                        >
                          <p className="text-xs sm:text-sm text-[var(--color-text-primary)] p-3 rounded-lg bg-surface-canvas border border-stroke-subtle whitespace-pre-wrap leading-relaxed">
                            {event.note}
                          </p>
                        </SpoilerMask>
                      ) : (
                        <p className="text-xs sm:text-sm text-[var(--color-text-primary)] p-3 rounded-lg bg-surface-canvas border border-stroke-subtle whitespace-pre-wrap leading-relaxed">
                          {event.note}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações (Excluir Evento) */}
              {onDeleteEvent && (
                <div className="shrink-0 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => onDeleteEvent(event.id)}
                    aria-label="Excluir este evento do diário"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors opacity-70 group-hover:opacity-100"
                    title="Excluir evento (não altera o estado atual da sua biblioteca)"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

