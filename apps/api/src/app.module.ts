/**
 * YuukiList — Módulo Raiz da Aplicação API (NestJS Modular Architecture)
 */

import { DataModule } from './data/data.module.ts';
import { CatalogModule } from './catalog/catalog.module.ts';
import { AuthModule } from './auth/auth.module.ts';
import { LibraryModule } from './library/library.module.ts';
import { DiaryModule } from './diary/diary.module.ts';
import { RelationsModule } from './relations/relations.module.ts';
import { CalendarModule } from './calendar/calendar.module.ts';
import { ProfileModule } from './profile/profile.module.ts';

export class AppModule {
  static readonly moduleName = 'AppModule';
  static readonly imports = [DataModule, CatalogModule, AuthModule, LibraryModule, DiaryModule, RelationsModule, CalendarModule, ProfileModule];
}

export { DataModule, CatalogModule, AuthModule, LibraryModule, DiaryModule, RelationsModule, CalendarModule, ProfileModule };

