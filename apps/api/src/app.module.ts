/**
 * YuukiList — Módulo Raiz da Aplicação API (NestJS Modular Architecture)
 */

import { DataModule } from './data/data.module.ts';
import { CatalogModule } from './catalog/catalog.module.ts';
import { AuthModule } from './auth/auth.module.ts';
import { LibraryModule } from './library/library.module.ts';

export class AppModule {
  static readonly name = 'AppModule';
  static readonly imports = [DataModule, CatalogModule, AuthModule, LibraryModule];
}

export { DataModule, CatalogModule, AuthModule, LibraryModule };

