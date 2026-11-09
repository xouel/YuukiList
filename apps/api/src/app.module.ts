/**
 * YuukiList — Módulo Raiz da Aplicação API (NestJS Modular Architecture)
 */

import { DataModule } from './data/data.module.ts';
import { CatalogModule } from './catalog/catalog.module.ts';
import { AuthModule } from './auth/auth.module.ts';

export class AppModule {
  static readonly name = 'AppModule';
  static readonly imports = [DataModule, CatalogModule, AuthModule];
}

export { DataModule, CatalogModule, AuthModule };

