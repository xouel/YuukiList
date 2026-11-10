/**
 * YuukiList — Controller REST de Relacionamentos e Franquias
 * Endpoints sob /api/v1/catalog/items/:slug/relations e /api/v1/franchises/:slug
 */

import type {
  ItemRelationsResponseDto,
  FranchiseDto,
} from '../../../../packages/shared/src/index.ts';
import type { AuthGuard } from '../auth/auth.guard.ts';
import { RelationsService } from './relations.service.ts';

export class RelationsController {
  private readonly relationsService: RelationsService;
  private readonly authGuard?: AuthGuard;

  constructor(relationsService: RelationsService, authGuard?: AuthGuard) {
    this.relationsService = relationsService;
    this.authGuard = authGuard;
  }

  private async tryExtractUserId(req: any): Promise<string | undefined> {
    if (!this.authGuard || !req) return undefined;
    try {
      const user = await this.authGuard.validateRequest(req);
      return user?.id;
    } catch {
      return undefined;
    }
  }

  async getItemRelations(
    req: any,
    slug: string
  ): Promise<ItemRelationsResponseDto> {
    const userId = await this.tryExtractUserId(req);
    return this.relationsService.getRelationsForMediaItem(slug, userId);
  }

  async getFranchise(req: any, slug: string): Promise<FranchiseDto> {
    const userId = await this.tryExtractUserId(req);
    const franchise = await this.relationsService.getFranchiseBySlug(slug, userId);
    if (!franchise) {
      const err: any = new Error(`Franquia não encontrada: ${slug}`);
      err.statusCode = 404;
      throw err;
    }
    return franchise;
  }
}
