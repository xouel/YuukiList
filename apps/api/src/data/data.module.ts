/**
 * YuukiList — Módulo de Dados (Camada de Persistência e Storage)
 */

import { CoverStorageService } from './cover-storage.service.ts';
import type { ICatalogRepository } from './catalog.repository.ts';

export class DataModule {
  static readonly name = 'DataModule';

  static getProviders() {
    return [CoverStorageService];
  }
}

export { CoverStorageService, type ICatalogRepository };

