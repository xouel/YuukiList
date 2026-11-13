/**
 * YuukiList — Módulo de Perfil, Estatísticas e Compartilhamento (NestJS Modular Architecture)
 */

import { ProfileRepository } from './profile.repository.ts';
import { ProfileService } from './profile.service.ts';
import { ProfileController } from './profile.controller.ts';
import { LibraryRepository } from '../library/library.repository.ts';
import { CatalogRepository, type ICatalogRepository } from '../data/catalog.repository.ts';
import { UsersRepository } from '../auth/users.repository.ts';
import { DiaryRepository } from '../diary/diary.repository.ts';

export class ProfileModule {
  static readonly moduleName = 'ProfileModule';

  readonly repository: ProfileRepository;
  readonly service: ProfileService;
  readonly controller: ProfileController;

  constructor(
    libraryRepo: LibraryRepository,
    catalogRepo: ICatalogRepository,
    usersRepo: UsersRepository,
    diaryRepo?: DiaryRepository,
    onProfileUpdated?: (userId: string) => void
  ) {
    this.repository = new ProfileRepository();
    this.service = new ProfileService(
      this.repository,
      libraryRepo,
      catalogRepo,
      usersRepo,
      diaryRepo,
      onProfileUpdated
    );
    this.controller = new ProfileController(this.service);
  }
}

