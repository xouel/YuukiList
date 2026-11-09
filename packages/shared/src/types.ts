/**
 * YuukiList — Contratos e Interfaces Compartilhados
 */

import type { Category, PublicationStatus } from './enums.ts';

export interface ItemGenreDto {
  name: string;
}

export interface ItemAliasDto {
  alias: string;
  normalizedAlias: string;
  languageCode: string;
}

export interface MediaItemDto {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string | null;
  romanizedTitle?: string | null;
  normalizedTitle: string;
  synopsis: string;
  category: Category;
  publicationStatus: PublicationStatus;
  releaseYear?: number | null;
  originCountry: string;
  rating?: number | null;
  coverPath: string;
  genres: ItemGenreDto[];
  aliases?: ItemAliasDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SeedItemInput {
  title: string;
  originalTitle?: string;
  romanizedTitle?: string;
  synopsis: string;
  category: Category;
  publicationStatus: PublicationStatus;
  releaseYear: number;
  originCountry: string;
  rating?: number;
  genres: string[];
  aliases?: Array<{ alias: string; languageCode: string }>;
  totalEpisodes?: number | null;
  totalChapters?: number | null;
  totalVolumes?: number | null;
}

export interface CoverResult {
  slug: string;
  contentType: 'image/svg+xml';
  svg: string;
  isFallback: boolean;
}

