/**
 * YuukiList — Módulo de Obras Provisórias e Solicitações de Inclusão
 */

import { ProvisionalRepository } from './provisional.repository.ts';
import { ProvisionalService } from './provisional.service.ts';
import { ProvisionalController } from './provisional.controller.ts';
import { CatalogRepository } from '../data/catalog.repository.ts';
import { LibraryRepository } from '../library/library.repository.ts';

export class ProvisionalModule {
  static readonly moduleName = 'ProvisionalModule';

  readonly repository: ProvisionalRepository;
  readonly service: ProvisionalService;
  readonly controller: ProvisionalController;

  constructor(catalogRepo: CatalogRepository, libraryRepo: LibraryRepository) {
    this.repository = new ProvisionalRepository();
    this.service = new ProvisionalService(this.repository, catalogRepo, libraryRepo);
    this.controller = new ProvisionalController(this.service);
  }
}
