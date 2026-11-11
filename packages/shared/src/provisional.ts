// packages/shared/src/provisional.ts

export const UserRole = Object.freeze({
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
} as const);

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const RequestStatus = Object.freeze({
  PENDENTE: 'PENDENTE',
  EM_ANALISE: 'EM_ANALISE',
  APROVADA: 'APROVADA',
  RECUSADA: 'RECUSADA',
} as const);

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export interface InclusionRequest {
  id: string;
  userId: string;
  username: string;
  title: string;
  originalTitle?: string;
  category: string;
  format: string;
  releaseYear?: number;
  country: string;
  synopsis?: string;
  sourceUrl?: string;
  status: RequestStatus;
  rejectionReason?: string;
  provisionalMediaItemId?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInclusionRequestDto {
  title: string;
  originalTitle?: string;
  category: string;
  format: string;
  releaseYear?: number;
  country: string;
  synopsis?: string;
  sourceUrl?: string;
}

export interface ModerateInclusionRequestDto {
  status: 'APROVADA' | 'RECUSADA';
  rejectionReason?: string;
  lockedFields?: string[];
  title?: string;
  synopsis?: string;
  releaseYear?: number;
}

export interface SimilarItemResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  similarity: number;
  releaseYear?: number;
}

export interface SimilarityCheckResponse {
  hasPossibleDuplicates: boolean;
  candidates: SimilarItemResult[];
}

export interface LockFieldsDto {
  lockedFields: string[];
}
