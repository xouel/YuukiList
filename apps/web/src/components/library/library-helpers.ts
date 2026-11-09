/**
 * YuukiList — Funções Puras e Tipos Auxiliares da Biblioteca Pessoal
 * Conforme Requisitos: Personal Library View and Layout Toggle & Quick Progress Tracking
 */

import {
  type Category,
  type PersonalStatus,
  type LibraryItemDto,
  calculateIsUpToDate,
} from '../../../../../packages/shared/src/index.ts';

export type LibraryLayoutMode = 'grid' | 'list';

export type StatusTabKey =
  | 'ALL'
  | 'WATCHING_READING'
  | 'PLAN_TO'
  | 'COMPLETED'
  | 'PAUSED'
  | 'DROPPED';

export interface StatusTabOption {
  key: StatusTabKey;
  label: string;
}

export const STORAGE_LAYOUT_KEY = 'yuukilist_library_layout';

export const STATUS_TABS: readonly StatusTabOption[] = Object.freeze([
  { key: 'ALL', label: 'Todos' },
  { key: 'WATCHING_READING', label: 'Em Andamento' },
  { key: 'PLAN_TO', label: 'Planejados' },
  { key: 'COMPLETED', label: 'Concluídos' },
  { key: 'PAUSED', label: 'Pausados' },
  { key: 'DROPPED', label: 'Dropados' },
]);

/**
 * Carrega a preferência de layout salva no localStorage com fallback 'grid'.
 */
export function loadSavedLayout(storage?: Storage): LibraryLayoutMode {
  try {
    const s = storage || (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!s) return 'grid';
    const saved = s.getItem(STORAGE_LAYOUT_KEY);
    return saved === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

/**
 * Salva a preferência de layout no localStorage.
 */
export function saveLayoutPreference(layout: LibraryLayoutMode, storage?: Storage): void {
  try {
    const s = storage || (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (s) {
      s.setItem(STORAGE_LAYOUT_KEY, layout);
    }
  } catch {
    // Ignora restrições de storage privado
  }
}

/**
 * Resolve o enum canônico de status pessoal com base na aba inteligente e na categoria.
 */
export function resolveStatusForTab(
  tab: StatusTabKey,
  category?: Category
): PersonalStatus | undefined {
  if (tab === 'ALL') return undefined;

  const isLiterary = category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA';

  switch (tab) {
    case 'WATCHING_READING':
      return isLiterary ? 'LENDO' : 'ASSISTINDO';
    case 'PLAN_TO':
      return isLiterary ? 'QUERO_LER' : 'QUERO_ASSISTIR';
    case 'COMPLETED':
      return category === 'FILME' ? 'ASSISTIDO' : 'CONCLUIDO';
    case 'PAUSED':
      return 'PAUSADO';
    case 'DROPPED':
      return 'DROPADO';
    default:
      return undefined;
  }
}

/**
 * Calcula o próximo progresso numérico ou null se o incremento não for permitido.
 */
export function calculateNextProgress(
  currentProgress: number,
  totalUnits?: number | null,
  category?: Category
): number | null {
  if (category === 'FILME') {
    return null;
  }

  if (typeof totalUnits === 'number' && totalUnits > 0 && currentProgress >= totalUnits) {
    return null;
  }

  return currentProgress + 1;
}

/**
 * Aplica atualização otimista em um item de biblioteca recalculando isUpToDate.
 */
export function computeOptimisticItemUpdate(
  item: LibraryItemDto,
  newProgress: number,
  totalUnits?: number | null
): LibraryItemDto {
  const category = item.mediaItem?.category || ('DORAMA' as Category);
  const publicationStatus = item.mediaItem?.publicationStatus;

  const isUpToDate = calculateIsUpToDate({
    category,
    status: item.status,
    progress: newProgress,
    totalUnits,
    publicationStatus,
  });

  return {
    ...item,
    progress: newProgress,
    isUpToDate,
    updatedAt: new Date(),
  };
}

/**
 * Formata o progresso para exibição na interface.
 */
export function formatProgressDisplay(
  progress: number,
  totalUnits?: number | null,
  category?: Category
): string {
  if (category === 'FILME') {
    return 'Longa-metragem';
  }

  const prefix =
    category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA'
      ? 'Cap.'
      : 'Ep.';

  if (typeof totalUnits === 'number' && totalUnits > 0) {
    return `${prefix} ${progress}/${totalUnits}`;
  }

  return `${prefix} ${progress}`;
}

