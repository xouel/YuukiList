/**
 * YuukiList — Módulo de Relacionamentos e Franquias (NestJS Modular Architecture)
 */

import { RelationsRepository } from './relations.repository.ts';
import { RelationsService } from './relations.service.ts';
import { RelationsController } from './relations.controller.ts';
import { CatalogRepository } from '../data/catalog.repository.ts';
import { LibraryRepository } from '../library/library.repository.ts';
import { AuthGuard } from '../auth/auth.guard.ts';

export class RelationsModule {
  static readonly moduleName = 'RelationsModule';

  readonly repository: RelationsRepository;
  readonly service: RelationsService;
  readonly controller: RelationsController;

  constructor(
    catalogRepo: CatalogRepository,
    libraryRepo?: LibraryRepository,
    authGuard?: AuthGuard
  ) {
    this.repository = new RelationsRepository(catalogRepo);
    this.service = new RelationsService(this.repository, catalogRepo, libraryRepo);
    this.controller = new RelationsController(this.service, authGuard);
  }
}

