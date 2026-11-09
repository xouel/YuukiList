/**
 * YuukiList — Módulo de Catálogo e Busca (Controllers, Services e DTOs)
 */

import { DataModule } from '../data/data.module.ts';
import { CatalogService } from './catalog.service.ts';
import { CatalogController, CatalogNotFoundError } from './catalog.controller.ts';

export class CatalogModule {
  static readonly moduleName = 'CatalogModule';
  static readonly imports = [DataModule];
  static readonly controllers = [CatalogController];
  static readonly providers = [CatalogService];
}

export { CatalogService, CatalogController, CatalogNotFoundError, DataModule };

