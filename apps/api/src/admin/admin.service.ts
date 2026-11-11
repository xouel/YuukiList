// apps/api/src/admin/admin.service.ts

import {
  UserRole,
  RequestStatus,
  type InclusionRequest,
  type ModerateInclusionRequestDto,
} from '../../../../packages/shared/src/index.ts';
import { ProvisionalRepository } from '../provisional/provisional.repository.ts';
import { CatalogRepository } from '../data/catalog.repository.ts';

export class AdminForbiddenError extends Error {
  readonly statusCode = 403;
  constructor(message = 'Acesso restrito a moderadores e administradores.') {
    super(message);
    this.name = 'AdminForbiddenError';
  }
}

export class AdminNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = 'Recurso não encontrado.') {
    super(message);
    this.name = 'AdminNotFoundError';
  }
}

export class AdminService {
  private readonly provisionalRepository: ProvisionalRepository;
  private readonly catalogRepository: CatalogRepository;

  constructor(
    provisionalRepository: ProvisionalRepository,
    catalogRepository: CatalogRepository
  ) {
    this.provisionalRepository = provisionalRepository;
    this.catalogRepository = catalogRepository;
  }

  private assertAdminRole(role?: string): void {
    if (role !== UserRole.MODERATOR && role !== UserRole.ADMIN) {
      throw new AdminForbiddenError('Acesso restrito a moderadores e administradores.');
    }
  }

  async listRequests(adminRole?: string, status?: RequestStatus): Promise<InclusionRequest[]> {
    this.assertAdminRole(adminRole);
    return this.provisionalRepository.findAll(status);
  }

  async moderateRequest(
    adminUserId: string,
    adminRole: string | undefined,
    requestId: string,
    dto: ModerateInclusionRequestDto
  ): Promise<InclusionRequest> {
    this.assertAdminRole(adminRole);

    const request = await this.provisionalRepository.findById(requestId);
    if (!request) {
      throw new AdminNotFoundError('Solicitação de inclusão não encontrada.');
    }

    const now = new Date().toISOString();

    if (dto.status === RequestStatus.APROVADA) {
      // Promove obra provisória ao catálogo oficial
      if (request.provisionalMediaItemId) {
        const allItems = await this.catalogRepository.getAllItems();
        const mediaItem = allItems.find((i) => i.id === request.provisionalMediaItemId);
        if (mediaItem) {
          const lockedFields = dto.lockedFields && dto.lockedFields.length > 0
            ? dto.lockedFields
            : ['title', 'synopsis', 'releaseYear'];

          await this.catalogRepository.upsertMediaItem({
            ...mediaItem,
            title: dto.title ? dto.title.trim() : mediaItem.title,
            synopsis: dto.synopsis ? dto.synopsis.trim() : mediaItem.synopsis,
            releaseYear: typeof dto.releaseYear === 'number' ? dto.releaseYear : mediaItem.releaseYear,
            validationStatus: 'VALIDATED',
            isManuallyEdited: true,
            lockedFields,
            updatedAt: new Date(),
          });
        }
      }

      const updated = await this.provisionalRepository.update(requestId, {
        status: RequestStatus.APROVADA,
        reviewedBy: adminUserId,
        reviewedAt: now,
      });
      return updated!;
    }

    // Caso recusada
    const updated = await this.provisionalRepository.update(requestId, {
      status: RequestStatus.RECUSADA,
      rejectionReason: dto.rejectionReason || 'Solicitação não atende aos critérios do catálogo.',
      reviewedBy: adminUserId,
      reviewedAt: now,
    });
    return updated!;
  }

  async lockFields(
    adminRole: string | undefined,
    mediaItemId: string,
    lockedFields: string[]
  ): Promise<any> {
    this.assertAdminRole(adminRole);

    const allItems = await this.catalogRepository.getAllItems();
    const mediaItem = allItems.find((i) => i.id === mediaItemId || i.slug === mediaItemId);
    if (!mediaItem) {
      throw new AdminNotFoundError('Obra não encontrada no catálogo.');
    }

    const updated = await this.catalogRepository.upsertMediaItem({
      ...mediaItem,
      isManuallyEdited: true,
      lockedFields: Array.from(new Set([...(mediaItem.lockedFields || []), ...lockedFields])),
      updatedAt: new Date(),
    });

    return updated;
  }

  async syncExternalCatalogItem(mediaItemId: string, incomingData: Record<string, any>): Promise<any> {
    const allItems = await this.catalogRepository.getAllItems();
    const mediaItem = allItems.find((i) => i.id === mediaItemId || i.slug === mediaItemId);
    if (!mediaItem) {
      throw new AdminNotFoundError('Obra não encontrada no catálogo.');
    }

    const locked = mediaItem.lockedFields || [];
    const mergedData = { ...mediaItem };

    // Aplica apenas campos não protegidos
    for (const [key, value] of Object.entries(incomingData)) {
      if (!locked.includes(key) && value !== undefined && value !== null) {
        (mergedData as any)[key] = value;
      }
    }

    mergedData.updatedAt = new Date();
    return this.catalogRepository.upsertMediaItem(mergedData);
  }
}

