/**
 * YuukiList — Controller REST da Biblioteca Pessoal
 * Endpoints sob /api/v1/library protegidos por AuthGuard
 */

import type {
  CreateLibraryItemDto,
  UpdateLibraryItemDto,
  LibraryFilterDto,
  LibraryItemDto,
  PaginatedResponse,
} from '../../../../packages/shared/src/index.ts';
import { AuthGuard } from '../auth/auth.guard.ts';
import { LibraryService } from './library.service.ts';

export class LibraryController {
  private readonly libraryService: LibraryService;
  private readonly authGuard: AuthGuard;

  constructor(libraryService: LibraryService, authGuard: AuthGuard) {
    this.libraryService = libraryService;
    this.authGuard = authGuard;
  }

  async list(
    req: any,
    query: LibraryFilterDto = {}
  ): Promise<PaginatedResponse<LibraryItemDto>> {
    const user = await this.authGuard.validateRequest(req);
    return this.libraryService.listUserLibrary(user.id, query);
  }

  async getItem(req: any, mediaItemId: string): Promise<LibraryItemDto> {
    const user = await this.authGuard.validateRequest(req);
    return this.libraryService.getItem(user.id, mediaItemId);
  }

  async addItem(req: any, body: CreateLibraryItemDto): Promise<LibraryItemDto> {
    const user = await this.authGuard.validateRequest(req);
    return this.libraryService.addOrUpdateItem(user.id, body);
  }

  async updateItem(
    req: any,
    mediaItemId: string,
    body: UpdateLibraryItemDto
  ): Promise<LibraryItemDto> {
    const user = await this.authGuard.validateRequest(req);
    return this.libraryService.updateItem(user.id, mediaItemId, body);
  }

  async removeItem(req: any, mediaItemId: string): Promise<{ success: boolean }> {
    const user = await this.authGuard.validateRequest(req);
    return this.libraryService.removeItem(user.id, mediaItemId);
  }
}

