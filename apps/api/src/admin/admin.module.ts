/**
 * YuukiList — Módulo de Administração e Governança de Catálogo
 */

import { AdminService } from './admin.service.ts';
import { AdminController } from './admin.controller.ts';
import { ProvisionalRepository } from '../provisional/provisional.repository.ts';
import { CatalogRepository } from '../data/catalog.repository.ts';

export class AdminModule {
  static readonly moduleName = 'AdminModule';

  readonly service: AdminService;
  readonly controller: AdminController;

  constructor(provisionalRepo: ProvisionalRepository, catalogRepo: CatalogRepository) {
    this.service = new AdminService(provisionalRepo, catalogRepo);
    this.controller = new AdminController(this.service);
  }
}
