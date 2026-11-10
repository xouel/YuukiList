'use client';

/**
 * YuukiList — Modal Acessível de Edição de Detalhes da Biblioteca
 * Conforme Requisito: Quick Progress Tracking and Detail Modal (Scenario: Edicao de status e nota pessoal)
 */

import React, { useState, useEffect } from 'react';
import {
  type LibraryItemDto,
  type UpdateLibraryItemDto,
  type PersonalStatus,
  CATEGORY_ALLOWED_STATUSES,
} from '../../../../../packages/shared/src/index.ts';

export interface EditItemModalProps {
  isOpen: boolean;
  item: LibraryItemDto | null;
  onClose: () => void;
  onSave: (mediaItemId: string, update: UpdateLibraryItemDto) => Promise<void>;
  onRemove: (mediaItemId: string) => Promise<void>;
}

const STATUS_LABELS: Record<string, string> = {
  ASSISTINDO: 'Assistindo',
  LENDO: 'Lendo',
  QUERO_ASSISTIR: 'Quero Assistir',
  QUERO_LER: 'Quero Ler',
  CONCLUIDO: 'Concluído',
  ASSISTIDO: 'Assistido',
  PAUSADO: 'Pausado',
  DROPADO: 'Dropado',
};

export function EditItemModal({
  isOpen,
  item,
  onClose,
  onSave,
  onRemove,
}: EditItemModalProps) {
  const [status, setStatus] = useState<PersonalStatus>('ASSISTINDO');
  const [progress, setProgress] = useState<number>(0);
  const [rating, setRating] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [rewatchCount, setRewatchCount] = useState<number>(0);
  const [progressVolumes, setProgressVolumes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza estado quando o item selecionado muda
  useEffect(() => {
    if (item) {
      setStatus(item.status);
      setProgress(item.progress || 0);
      setRating(item.rating != null ? String(item.rating) : '');
      setNotes(item.notes || '');
      setIsFavorite(Boolean(item.isFavorite));
      setRewatchCount(item.rewatchCount || 0);
      setProgressVolumes(item.progressVolumes != null ? String(item.progressVolumes) : '');
      setShowConfirmDelete(false);
      setError(null);
    }
  }, [item]);

  // Listener para fechar modal com tecla ESC
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

  if (!isOpen || !item) return null;

  const media = item.mediaItem;
  const category = media?.category;
  const isFilm = category === 'FILME';
  const isLiterary = category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA';
  const allowedStatuses = (category && CATEGORY_ALLOWED_STATUSES[category]) || [
    'ASSISTINDO',
    'QUERO_ASSISTIR',
    'CONCLUIDO',
    'PAUSADO',
    'DROPADO',
  ];

  const totalUnits = isLiterary
    ? (media as any)?.totalChapters
    : (media as any)?.totalEpisodes;

  const hasInconsistency =
    (status === 'CONCLUIDO' || status === 'ASSISTIDO') &&
    typeof totalUnits === 'number' &&
    totalUnits > 0 &&
    progress < totalUnits;

  const handleStartNewCycle = () => {
    setRewatchCount((prev) => prev + 1);
    setProgress(0);
    setStatus(isLiterary ? 'LENDO' : 'ASSISTINDO');
  };

  const handleIncrementRewatch = () => {
    setRewatchCount((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const parsedRating = rating.trim() !== '' ? Number(rating) : null;
      const parsedVolumes = progressVolumes.trim() !== '' ? Math.max(0, parseInt(progressVolumes, 10)) : null;
      const updateDto: UpdateLibraryItemDto = {
        status,
        progress: isFilm ? 0 : Math.max(0, Math.floor(Number(progress) || 0)),
        rating: parsedRating != null && !isNaN(parsedRating) ? parsedRating : null,
        notes: notes.trim() !== '' ? notes.trim() : null,
        isFavorite,
        rewatchCount,
        progressVolumes: parsedVolumes != null && !isNaN(parsedVolumes) ? parsedVolumes : null,
      };

      await onSave(item.mediaItemId, updateDto);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar alterações');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await onRemove(item.mediaItemId);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao remover item da biblioteca');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#181C2B] rounded-2xl border border-[#262C3F] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#262C3F]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                {category || 'Obra'}
              </span>
              {rewatchCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#8B5CF6]/30 text-[#C4B5FD] border border-[#8B5CF6]/40">
                  ↻ {rewatchCount}x
                </span>
              )}
            </div>
            <h2
              id="edit-modal-title"
              className="text-lg font-bold text-[#F3F4F6] mt-1.5 line-clamp-1"
            >
              {media?.title || 'Detalhes da Obra'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              aria-label={isFavorite ? 'Desmarcar favorito' : 'Marcar como favorito'}
              className={`p-2 rounded-lg border transition-all ${
                isFavorite
                  ? 'bg-rose-500/25 text-rose-400 border-rose-500/50 hover:bg-rose-500/35'
                  : 'bg-[#121520] text-gray-400 hover:text-rose-400 border-[#262C3F]'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#262C3F] transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300">
              {error}
            </div>
          )}

          {/* Banner de Aviso Amigável de Inconsistência de Status (TR-006) */}
          {hasInconsistency && (
            <div
              data-testid="inconsistency-warning"
              className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-300 text-xs flex items-start gap-3 shadow-lg"
            >
              <span className="text-lg leading-none shrink-0">⚠️</span>
              <div>
                <p className="font-semibold text-amber-200">Aviso de Inconsistência de Status</p>
                <p className="text-amber-300/90 mt-0.5 leading-relaxed">
                  Atenção: A obra está marcada como Concluída, mas o progresso registrado ({progress}) é inferior ao total cadastrado ({totalUnits}). Você pode salvar normalmente se desejar.
                </p>
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label
              htmlFor="status-select"
              className="block text-xs font-medium text-[#94A3B8] mb-1.5"
            >
              Status de Acompanhamento
            </label>
            <select
              id="status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as PersonalStatus)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#121520] border border-[#262C3F] text-[#F3F4F6] focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] outline-none"
            >
              {allowedStatuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s] || s}
                </option>
              ))}
            </select>
          </div>

          {/* Progresso (não aplicável para filmes) */}
          {!isFilm && (
            <div>
              <label
                htmlFor="progress-input"
                className="block text-xs font-medium text-[#94A3B8] mb-1.5"
              >
                {category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA'
                  ? 'Capítulo Atual'
                  : 'Episódio Atual'}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProgress((p) => Math.max(0, p - 1))}
                  className="w-9 h-9 rounded-lg bg-[#262C3F] text-white hover:bg-[#323950] font-bold flex items-center justify-center transition-colors"
                  aria-label="Diminuir uma unidade"
                >
                  -
                </button>
                <input
                  id="progress-input"
                  type="number"
                  min="0"
                  value={progress}
                  onChange={(e) => setProgress(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="flex-1 px-3 py-2 text-sm text-center rounded-lg bg-[#121520] border border-[#262C3F] text-[#F3F4F6] focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] outline-none font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setProgress((p) => p + 1)}
                  className="w-9 h-9 rounded-lg bg-[#262C3F] text-white hover:bg-[#323950] font-bold flex items-center justify-center transition-colors"
                  aria-label="Aumentar uma unidade"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Volume Atual (Opcional para Obras Literárias) */}
          {isLiterary && (
            <div>
              <label
                htmlFor="volume-input"
                className="block text-xs font-medium text-[#94A3B8] mb-1.5"
              >
                Volume Atual (Opcional)
              </label>
              <input
                id="volume-input"
                type="number"
                min="0"
                placeholder="Ex: 5"
                value={progressVolumes}
                onChange={(e) => setProgressVolumes(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[#121520] border border-[#262C3F] text-[#F3F4F6] focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] outline-none"
              />
            </div>
          )}

          {/* Nota Pessoal (0.0 a 10.0) */}
          <div>
            <label
              htmlFor="rating-input"
              className="block text-xs font-medium text-[#94A3B8] mb-1.5"
            >
              Sua Nota (0.0 a 10.0)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="rating-input"
                type="number"
                min="0"
                max="10"
                step="0.5"
                placeholder="Sem nota"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[#121520] border border-[#262C3F] text-[#F3F4F6] focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] outline-none"
              />
              {rating !== '' && (
                <button
                  type="button"
                  onClick={() => setRating('')}
                  className="text-xs text-[#94A3B8] hover:text-[#F3F4F6] px-2 py-1 rounded bg-[#262C3F]"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Bloco de Reassistir / Reler (TR-005) */}
          <div className="p-3.5 rounded-xl bg-[#121520] border border-[#262C3F] space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#F3F4F6]">
                  {isLiterary ? 'Reler Obra' : 'Reassistir Obra'}
                </h4>
                <p className="text-[11px] text-[#94A3B8]">
                  {isLiterary ? 'Relido' : 'Reassistido'}: <strong className="text-purple-300">{rewatchCount}</strong> {rewatchCount === 1 ? 'vez' : 'vezes'}
                </p>
              </div>

              {rewatchCount > 0 && (
                <button
                  type="button"
                  onClick={() => setRewatchCount(Math.max(0, rewatchCount - 1))}
                  className="text-[11px] text-[#94A3B8] hover:text-rose-400 px-2 py-0.5 rounded border border-[#262C3F] hover:border-rose-500/40 transition-colors"
                  title="Decrementar contador"
                >
                  -1 vez
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartNewCycle}
                className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/30 active:scale-95 transition-all text-center"
              >
                ↻ Iniciar Novo Ciclo
              </button>
              <button
                type="button"
                onClick={handleIncrementRewatch}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#262C3F] text-[#F3F4F6] hover:bg-[#323950] border border-white/5 active:scale-95 transition-all"
              >
                +1 Vez
              </button>
            </div>
          </div>

          {/* Anotações Privadas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="notes-textarea"
                className="block text-xs font-medium text-[#94A3B8]"
              >
                Anotações Pessoais (Privadas)
              </label>
              <span className="text-[10px] text-gray-500">
                {notes.length}/1000
              </span>
            </div>
            <textarea
              id="notes-textarea"
              rows={3}
              maxLength={1000}
              placeholder="Ex: Assisti até o arco do torneio, recomendo pelos efeitos visuais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#121520] border border-[#262C3F] text-[#F3F4F6] focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] outline-none resize-none"
            />
          </div>

          {/* Rodapé com Ações */}
          <div className="pt-4 border-t border-[#262C3F] flex flex-col sm:flex-row items-center justify-between gap-3">
            {showConfirmDelete ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isDeleting}
                  className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                >
                  {isDeleting ? 'Removendo...' : 'Confirmar Remoção'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1.5 text-xs text-[#94A3B8] hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline transition-colors order-2 sm:order-1"
              >
                Remover da Biblioteca
              </button>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-[#262C3F] text-[#F3F4F6] hover:bg-[#323950] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#06B6D4] text-[#0B0D13] hover:bg-[#22D3EE] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

