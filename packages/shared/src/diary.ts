/**
 * YuukiList — Contratos e DTOs de Diário Pessoal, Histórico e Proteção Anti-Spoiler
 * Conforme Documento Mestre de Contexto (Seção 6) e X-Spec (012-diary-history-and-spoilers)
 */

import type { Category } from './enums.ts';
import type { PersonalStatus } from './library.ts';

export const HISTORY_EVENT_TYPES = Object.freeze([
  'STATUS_CHANGE',
  'PROGRESS_UPDATE',
  'COMPLETED',
  'RATING_SET',
  'FAVORITE_TOGGLED',
  'REWATCH_CYCLE',
  'NOTE',
  'EXPERIENCE',
] as const);

export type HistoryEventType = (typeof HISTORY_EVENT_TYPES)[number];

export function isHistoryEventType(value: unknown): value is HistoryEventType {
  return typeof value === 'string' && (HISTORY_EVENT_TYPES as readonly string[]).includes(value);
}

export interface HistoryEventDto {
  id: string;
  userId: string;
  mediaItemId: string;
  type: HistoryEventType;
  occurredAt: string; // ISO-8601
  createdAt: string;
  updatedAt: string;
  previousStatus?: PersonalStatus | null;
  newStatus?: PersonalStatus | null;
  previousProgress?: number | null;
  newProgress?: number | null;
  rating?: number | null;
  isFavorite?: boolean | null;
  rewatchCount?: number | null;
  note?: string | null;
  episodeNumber?: number | null;
  chapterNumber?: number | null;
  volumeNumber?: number | null;
  containsSpoiler: boolean;
  isMasked?: boolean;
  mediaItem?: {
    id: string;
    slug: string;
    title: string;
    originalTitle?: string | null;
    category: Category;
    coverUrl: string;
  } | null;
}

export interface CreateHistoryEventDto {
  mediaItemId: string;
  type: HistoryEventType;
  occurredAt?: string;
  note?: string | null;
  episodeNumber?: number | null;
  chapterNumber?: number | null;
  volumeNumber?: number | null;
  containsSpoiler?: boolean;
  previousStatus?: PersonalStatus | null;
  newStatus?: PersonalStatus | null;
  previousProgress?: number | null;
  newProgress?: number | null;
  rating?: number | null;
  isFavorite?: boolean | null;
  rewatchCount?: number | null;
}

export interface UpdateHistoryEventDto {
  occurredAt?: string;
  note?: string | null;
  containsSpoiler?: boolean;
  episodeNumber?: number | null;
  chapterNumber?: number | null;
  volumeNumber?: number | null;
}

export interface HistoryFilterDto {
  mediaItemId?: string;
  type?: HistoryEventType;
  startDate?: string;
  endDate?: string;
  containsSpoiler?: boolean;
  page?: number;
  limit?: number;
}

export interface SpoilerVisibilityParams {
  containsSpoiler: boolean;
  targetUnit?: number | null;
  viewerProgress?: number | null;
  isAuthor?: boolean;
  isAnonymous?: boolean;
}

export interface SpoilerVisibilityResult {
  isMasked: boolean;
  reason: 'ANONYMOUS' | 'PROGRESS_INFERIOR' | 'NONE';
}

/**
 * Computa o mascaramento inteligente de spoilers:
 * - Se não contiver spoiler, exibe diretamente.
 * - Visitantes anônimos sempre recebem conteúdo mascarado.
 * - Autores da anotação visualizam sem máscara.
 * - Se vinculado à unidade X, mascara se viewerProgress < X; se viewerProgress >= X, exibe diretamente.
 */
export function computeSpoilerVisibility(params: SpoilerVisibilityParams): SpoilerVisibilityResult {
  if (!params.containsSpoiler) {
    return { isMasked: false, reason: 'NONE' };
  }
  if (params.isAnonymous) {
    return { isMasked: true, reason: 'ANONYMOUS' };
  }
  if (params.isAuthor) {
    return { isMasked: false, reason: 'NONE' };
  }
  const targetUnit = params.targetUnit;
  if (typeof targetUnit === 'number' && targetUnit > 0) {
    const viewerProgress = params.viewerProgress ?? 0;
    if (viewerProgress < targetUnit) {
      return { isMasked: true, reason: 'PROGRESS_INFERIOR' };
    }
  }
  return { isMasked: false, reason: 'NONE' };
}

