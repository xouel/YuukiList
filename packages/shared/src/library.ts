/**
 * YuukiList — Contratos e Regras Canônicas da Biblioteca Pessoal
 * Conforme Documento Mestre de Contexto (Seção 5) e PRD (Fase 3 & Expansão R11)
 */

import { type Category, type PublicationStatus } from './enums.ts';
import { type MediaItemSummaryDto } from './types.ts';

export const PERSONAL_STATUSES = Object.freeze([
  'QUERO_ASSISTIR',
  'ASSISTINDO',
  'QUERO_LER',
  'LENDO',
  'PAUSADO',
  'CONCLUIDO',
  'ASSISTIDO',
  'DROPADO',
] as const);

export type PersonalStatus = (typeof PERSONAL_STATUSES)[number];

export const CATEGORY_ALLOWED_STATUSES: Record<Category, readonly PersonalStatus[]> = Object.freeze({
  DORAMA: ['QUERO_ASSISTIR', 'ASSISTINDO', 'PAUSADO', 'CONCLUIDO', 'DROPADO'] as const,
  FILME: ['QUERO_ASSISTIR', 'ASSISTIDO', 'PAUSADO', 'DROPADO'] as const,
  ANIME: ['QUERO_ASSISTIR', 'ASSISTINDO', 'PAUSADO', 'CONCLUIDO', 'DROPADO'] as const,
  MANGA: ['QUERO_LER', 'LENDO', 'PAUSADO', 'CONCLUIDO', 'DROPADO'] as const,
  MANHWA: ['QUERO_LER', 'LENDO', 'PAUSADO', 'CONCLUIDO', 'DROPADO'] as const,
  MANHUA: ['QUERO_LER', 'LENDO', 'PAUSADO', 'CONCLUIDO', 'DROPADO'] as const,
});

export const LIBRARY_SORT_OPTIONS = Object.freeze([
  'updatedAt',
  'createdAt',
  'title',
  'progress',
  'rating',
  'releaseYear',
] as const);

export type LibrarySortBy = (typeof LIBRARY_SORT_OPTIONS)[number];

export function isPersonalStatus(value: unknown): value is PersonalStatus {
  return typeof value === 'string' && (PERSONAL_STATUSES as readonly string[]).includes(value);
}

export function isStatusAllowedForCategory(status: unknown, category: Category): boolean {
  if (!isPersonalStatus(status)) return false;
  const allowed = CATEGORY_ALLOWED_STATUSES[category];
  return Boolean(allowed && allowed.includes(status));
}

/**
 * Calcula dinamicamente a condição "Em dia" conforme a Seção 5.8 do Documento Mestre:
 * - "Em dia" é uma condição calculada, não um status pessoal.
 * - Usuário está Em dia quando alcança a última unidade principal confirmada e disponível.
 * - A obra pode continuar em publicação e permanecer Assistindo/Lendo + Em dia.
 * - Em dia não significa Concluído.
 * - Para Filmes: status ASSISTIDO representa conclusão/em dia; filmes não possuem episódios contínuos.
 */
export function calculateIsUpToDate(params: {
  category: Category;
  status: PersonalStatus;
  progress: number;
  totalUnits?: number | null;
  publicationStatus?: PublicationStatus;
}): boolean {
  const { category, status, progress, totalUnits } = params;

  if (category === 'FILME') {
    return status === 'ASSISTIDO';
  }

  // Se o total de unidades principais confirmadas é conhecido e > 0
  if (typeof totalUnits === 'number' && totalUnits > 0) {
    return progress >= totalUnits;
  }

  return false;
}

export interface CreateLibraryItemDto {
  mediaItemId: string;
  status: PersonalStatus;
  progress?: number;
  progressVolumes?: number | null;
  rating?: number | null;
  notes?: string | null;
  isFavorite?: boolean;
  rewatchCount?: number;
}

export interface UpdateLibraryItemDto {
  status?: PersonalStatus;
  progress?: number;
  progressVolumes?: number | null;
  rating?: number | null;
  notes?: string | null;
  isFavorite?: boolean;
  rewatchCount?: number;
}

export interface LibraryItemDto {
  id: string;
  userId: string;
  mediaItemId: string;
  status: PersonalStatus;
  progress: number;
  progressVolumes?: number | null;
  rating?: number | null;
  notes?: string | null;
  isFavorite: boolean;
  rewatchCount: number;
  isUpToDate: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  mediaItem?: MediaItemSummaryDto;
}

export interface LibraryFilterDto {
  status?: PersonalStatus;
  category?: Category;
  isFavorite?: boolean;
  originCountry?: string;
  sortBy?: LibrarySortBy;
  page?: number;
  limit?: number;
}
