'use client';

/**
 * YuukiList — Modal para Criar Anotações no Diário com Proteção de Spoiler
 * Conforme Requisito: Interactive Timeline View and Unit Notes Interface
 */

import React, { useState, useEffect } from 'react';
import type { Category } from '../../../../../packages/shared/src/index.ts';

export interface CreateNoteModalProps {
  isOpen: boolean;
  mediaItemId: string;
  mediaTitle?: string;
  category?: Category;
  onClose: () => void;
  onSubmit: (data: {
    mediaItemId: string;
    note: string;
    episodeNumber?: number | null;
    chapterNumber?: number | null;
    volumeNumber?: number | null;
    containsSpoiler: boolean;
    occurredAt?: string;
  }) => Promise<void>;
}

export function CreateNoteModal({
  isOpen,
  mediaItemId,
  mediaTitle,
  category,
  onClose,
  onSubmit,
}: CreateNoteModalProps) {
  const [note, setNote] = useState<string>('');
  const [unitNumber, setUnitNumber] = useState<string>('');
  const [volumeNumber, setVolumeNumber] = useState<string>('');
  const [containsSpoiler, setContainsSpoiler] = useState<boolean>(false);
  const [occurredDate, setOccurredDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isLiterary = category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA';

  useEffect(() => {
    if (isOpen) {
      setNote('');
      setUnitNumber('');
      setVolumeNumber('');
      setContainsSpoiler(false);
      setOccurredDate(new Date().toISOString().split('T')[0]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Por favor, digite sua reflexão ou anotação');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const parsedUnit = unitNumber.trim() !== '' ? Math.max(0, parseInt(unitNumber, 10)) : null;
      const parsedVol = volumeNumber.trim() !== '' ? Math.max(0, parseInt(volumeNumber, 10)) : null;

      await onSubmit({
        mediaItemId,
        note: note.trim(),
        episodeNumber: !isLiterary ? parsedUnit : null,
        chapterNumber: isLiterary ? parsedUnit : null,
        volumeNumber: parsedVol,
        containsSpoiler,
        occurredAt: occurredDate ? new Date(occurredDate).toISOString() : new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar anotação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-note-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-surface-raised rounded-2xl border border-stroke-subtle p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stroke-subtle">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
              Diário Pessoal
            </span>
            <h2 id="create-note-title" className="text-lg font-bold text-[var(--color-text-primary)] mt-1.5 line-clamp-1">
              Nova Anotação — {mediaTitle || 'Obra'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-surface-overlay transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300">
              {error}
            </div>
          )}

          {/* Vínculo com Unidade (Episódio / Capítulo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="note-unit" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                {isLiterary ? 'Capítulo Vinculado' : 'Episódio Vinculado'} (Opcional)
              </label>
              <input
                id="note-unit"
                type="number"
                min="0"
                placeholder={isLiterary ? 'Ex: 45' : 'Ex: 8'}
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-surface-canvas border border-stroke-subtle text-[var(--color-text-primary)] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
            </div>

            {isLiterary ? (
              <div>
                <label htmlFor="note-volume" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Volume (Opcional)
                </label>
                <input
                  id="note-volume"
                  type="number"
                  min="0"
                  placeholder="Ex: 5"
                  value={volumeNumber}
                  onChange={(e) => setVolumeNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-surface-canvas border border-stroke-subtle text-[var(--color-text-primary)] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="note-date" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Data da Experiência
                </label>
                <input
                  id="note-date"
                  type="date"
                  value={occurredDate}
                  onChange={(e) => setOccurredDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-surface-canvas border border-stroke-subtle text-[var(--color-text-primary)] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
            )}
          </div>

          {/* Data para obras literárias */}
          {isLiterary && (
            <div>
              <label htmlFor="note-date-lit" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                Data da Experiência
              </label>
              <input
                id="note-date-lit"
                type="date"
                value={occurredDate}
                onChange={(e) => setOccurredDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-surface-canvas border border-stroke-subtle text-[var(--color-text-primary)] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
            </div>
          )}

          {/* Texto da Anotação */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="note-text" className="block text-xs font-medium text-[var(--color-text-secondary)]">
                Sua Reflexão ou Comentário (Privado)
              </label>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {note.length}/1000
              </span>
            </div>
            <textarea
              id="note-text"
              rows={4}
              maxLength={1000}
              placeholder="O que você achou desta parte? Registre suas impressões, teorias e sentimentos..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-surface-canvas border border-stroke-subtle text-[var(--color-text-primary)] focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none"
            />
          </div>

          {/* Checkbox de Spoiler */}
          <div className="p-3 rounded-xl bg-surface-sunken border border-stroke-subtle flex items-center justify-between gap-3 cursor-pointer" onClick={() => setContainsSpoiler(!containsSpoiler)}>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                !
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                  Contém Spoiler
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  Oculta este texto automaticamente para visitantes e quem ainda não alcançou esta parte.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              id="spoiler-checkbox"
              checked={containsSpoiler}
              onChange={(e) => setContainsSpoiler(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded text-accent focus:ring-accent bg-surface-canvas border-stroke-subtle cursor-pointer"
            />
          </div>

          {/* Rodapé */}
          <div className="pt-3 border-t border-stroke-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-surface-overlay text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-surface-sunken transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar no Diário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

