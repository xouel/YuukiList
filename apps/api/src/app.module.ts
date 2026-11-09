/**
 * YuukiList — Módulo Raiz da Aplicação API (NestJS Modular Architecture)
 */

import { DataModule } from './data/data.module.ts';
import { CatalogModule } from './catalog/catalog.module.ts';

export class AppModule {
  static readonly name = 'AppModule';
  static readonly imports = [DataModule, CatalogModule];
}

export { DataModule, CatalogModule };

