/**
 * YuukiList — Contratos e DTOs de APIs Externas e Prova de Conceito (PoC)
 * Conforme Documento Mestre de Contexto (Seções 9 e 10) e PRD (Fase 4)
 */

import { type Category, type PublicationStatus } from './enums.ts';

export const EXTERNAL_SOURCES = Object.freeze([
  'TMDB',
  'TVMAZE',
  'KITSU',
  'ANN',
  'MANGAUPDATES',
] as const);

export type ExternalApiSource = (typeof EXTERNAL_SOURCES)[number];

export type ProvenanceSource = ExternalApiSource | 'SEED_CANONICAL' | 'LOCAL';

export interface FieldProvenance {
  source: ProvenanceSource;
  externalId?: string;
  syncedAt: string;
}

export type MediaItemProvenance = Record<string, FieldProvenance>;

export interface CanonicalExternalMediaDto {
  source: ExternalApiSource;
  externalId: string;
  category: Category;
  title: string;
  originalTitle?: string | null;
  romanizedTitle?: string | null;
  synopsis?: string | null;
  releaseYear?: number | null;
  originCountry?: string | null;
  publicationStatus?: PublicationStatus;
  totalEpisodes?: number | null;
  totalSeasons?: number | null;
  totalChapters?: number | null;
  totalVolumes?: number | null;
  genres: string[];
  aliases: string[];
  coverUrl?: string | null;
  authors?: string[];
  rating?: number | null;
  externalUrls?: Record<string, string>;
  rawPayload?: unknown;
}

export interface ExternalSearchQuery {
  title: string;
  category?: Category;
  year?: number;
}

export interface ExternalFieldCoverage {
  hasTitle: boolean;
  hasOriginalTitle: boolean;
  hasSynopsis: boolean;
  hasReleaseYear: boolean;
  hasOriginCountry: boolean;
  hasUnitsCount: boolean; // episódios para vídeo, capítulos para leitura
  hasGenres: boolean;
  hasCover: boolean;
  hasStatus: boolean;
}

export interface ExternalCoverageEntry {
  title: string;
  category: Category;
  targetFormat: 'AUDIOVISUAL' | 'LITERARY';
  evaluatedSources: {
    source: ExternalApiSource;
    found: boolean;
    externalId?: string;
    coverage: ExternalFieldCoverage;
    confidenceScore: number; // 0 a 100
    notes?: string;
  }[];
  primaryRecommendedSource: ExternalApiSource;
  secondaryFallbackSource?: ExternalApiSource;
  licensingSummary: {
    licenseType: string;
    commercialUseAllowed: boolean;
    attributionRequired: boolean;
    attributionNotice: string;
    imageReuseAllowed: boolean;
  };
}

export interface ExternalComparisonMatrix {
  generatedAt: string;
  totalTitlesEvaluated: number;
  sourcesEvaluated: ExternalApiSource[];
  coverageByTitle: ExternalCoverageEntry[];
  conclusionsByCategory: Record<
    Category,
    {
      recommendedPrimary: ExternalApiSource;
      recommendedFallback?: ExternalApiSource;
      justification: string;
    }
  >;
  permanentZeroCostCheck: {
    passed: boolean;
    freeTierLimitsBySource: Record<ExternalApiSource, string>;
    creditCardRequired: boolean;
  };
}

export interface IExternalApiClient {
  readonly source: ExternalApiSource;
  search(query: ExternalSearchQuery): Promise<CanonicalExternalMediaDto[]>;
  getDetails(externalId: string): Promise<CanonicalExternalMediaDto | null>;
}

