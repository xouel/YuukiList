// apps/api/src/provisional/provisional.service.ts

import crypto from 'node:crypto';
import {
  generateSlug,
  normalizeSearchText,
  type Category,
  type PublicationStatus,
  CATEGORY_ALLOWED_STATUSES,
  RequestStatus,
  type InclusionRequest,
  type CreateInclusionRequestDto,
  type SimilarityCheckResponse,
} from '../../../../packages/shared/src/index.ts';
import { ProvisionalRepository } from './provisional.repository.ts';
import { CatalogRepository } from '../data/catalog.repository.ts';
import { LibraryRepository } from '../library/library.repository.ts';

export class ProvisionalService {
  private readonly provisionalRepository: ProvisionalRepository;
  private readonly catalogRepository: CatalogRepository;
  private readonly libraryRepository: LibraryRepository;

  constructor(
    provisionalRepository: ProvisionalRepository,
    catalogRepository: CatalogRepository,
    libraryRepository: LibraryRepository
  ) {
    this.provisionalRepository = provisionalRepository;
    this.catalogRepository = catalogRepository;
    this.libraryRepository = libraryRepository;
  }

  async checkSimilarity(title: string): Promise<SimilarityCheckResponse> {
    if (!title || typeof title !== 'string' || !title.trim()) {
      return { hasPossibleDuplicates: false, candidates: [] };
    }

    const candidates = await this.catalogRepository.findSimilar(title.trim(), 0.35);
    return {
      hasPossibleDuplicates: candidates.length > 0,
      candidates,
    };
  }

  async createRequest(
    userId: string,
    username: string,
    dto: CreateInclusionRequestDto
  ): Promise<InclusionRequest> {
    if (!dto || !dto.title || !dto.title.trim()) {
      throw new Error('Título é obrigatório para solicitar inclusão.');
    }
    if (!dto.category) {
      throw new Error('Categoria é obrigatória.');
    }
    if (!dto.country) {
      throw new Error('País de origem é obrigatório.');
    }

    const cleanTitle = dto.title.trim();
    const existing = await this.provisionalRepository.findPendingByTitleAndUser(userId, cleanTitle);
    if (existing) {
      throw new Error('Você já possui uma solicitação pendente para esta obra.');
    }

    const requestId = crypto.randomUUID();
    const mediaItemId = crypto.randomUUID();
    const slugSuffix = crypto.randomBytes(3).toString('hex');
    const slug = `${generateSlug(cleanTitle)}-provisional-${slugSuffix}`;
    const now = new Date();

    // 1. Cria obra provisória no catálogo com validationStatus = 'PROVISIONAL'
    const provisionalItem = {
      id: mediaItemId,
      slug,
      title: cleanTitle,
      originalTitle: dto.originalTitle ? dto.originalTitle.trim() : null,
      romanizedTitle: null,
      normalizedTitle: normalizeSearchText(cleanTitle),
      synopsis: dto.synopsis ? dto.synopsis.trim() : 'Obra cadastrada provisoriamente pelo usuário.',
      category: dto.category as Category,
      publicationStatus: 'DESCONHECIDA' as PublicationStatus,
      releaseYear: dto.releaseYear || null,
      originCountry: dto.country,
      rating: null,
      coverPath: '/assets/covers/provisional-placeholder.svg',
      validationStatus: 'PROVISIONAL' as const,
      isManuallyEdited: false,
      lockedFields: [],
      genres: [],
      aliases: [],
      totalEpisodes: null,
      totalChapters: null,
      totalVolumes: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.catalogRepository.upsertMediaItem(provisionalItem);

    // 2. Adiciona a obra provisória imediatamente na biblioteca pessoal do solicitante
    const initialStatus = CATEGORY_ALLOWED_STATUSES[dto.category as Category]?.[0] || 'QUERO_ASSISTIR';
    await this.libraryRepository.upsert(userId, {
      mediaItemId,
      status: initialStatus,
      progress: 0,
      progressVolumes: null,
      rating: null,
      notes: null,
      isFavorite: false,
      rewatchCount: 0,
    });

    // 3. Registra a solicitação de inclusão
    const request: InclusionRequest = {
      id: requestId,
      userId,
      username,
      title: cleanTitle,
      originalTitle: dto.originalTitle ? dto.originalTitle.trim() : undefined,
      category: dto.category,
      format: dto.format,
      releaseYear: dto.releaseYear,
      country: dto.country,
      synopsis: dto.synopsis,
      sourceUrl: dto.sourceUrl,
      status: RequestStatus.PENDENTE,
      provisionalMediaItemId: mediaItemId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    return this.provisionalRepository.create(request);
  }

  async getMyRequests(userId: string): Promise<InclusionRequest[]> {
    return this.provisionalRepository.findByUserId(userId);
  }

  async getRequestById(id: string): Promise<InclusionRequest | null> {
    return this.provisionalRepository.findById(id);
  }
}
