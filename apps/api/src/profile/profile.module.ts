/**
 * YuukiList — Módulo de Perfil, Estatísticas e Compartilhamento (NestJS Modular Architecture)
 */

import { ProfileRepository } from './profile.repository.ts';
import { ProfileService } from './profile.service.ts';
import { ProfileController } from './profile.controller.ts';
import { LibraryRepository } from '../library/library.repository.ts';
import { CatalogRepository } from '../data/catalog.repository.ts';
import { UsersRepository } from '../auth/users.repository.ts';
import { DiaryRepository } from '../diary/diary.repository.ts';

export class ProfileModule {
  static readonly moduleName = 'ProfileModule';

  readonly repository: ProfileRepository;
  readonly service: ProfileService;
  readonly controller: ProfileController;

  constructor(
    libraryRepo: LibraryRepository,
    catalogRepo: CatalogRepository,
    usersRepo: UsersRepository,
    diaryRepo?: DiaryRepository
  ) {
    this.repository = new ProfileRepository();
    this.service = new ProfileService(
      this.repository,
      libraryRepo,
      catalogRepo,
      usersRepo,
      diaryRepo
    );
    this.controller = new ProfileController(this.service);
  }
}

