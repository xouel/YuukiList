/**
 * YuukiList — Módulo de Diário Pessoal e Histórico
 */

import { CatalogRepository, type ICatalogRepository } from '../data/catalog.repository.ts';
import { AuthGuard } from '../auth/auth.guard.ts';
import { TokenService } from '../auth/token.service.ts';
import { UsersRepository } from '../auth/users.repository.ts';
import { LibraryRepository } from '../library/library.repository.ts';
import { DiaryRepository } from './diary.repository.ts';
import { DiaryService } from './diary.service.ts';
import { DiaryController } from './diary.controller.ts';

export class DiaryModule {
  static readonly moduleName = 'DiaryModule';

  readonly diaryRepository: DiaryRepository;
  readonly catalogRepository: ICatalogRepository;
  readonly libraryRepository: LibraryRepository;
  readonly diaryService: DiaryService;
  readonly authGuard: AuthGuard;
  readonly diaryController: DiaryController;

  constructor(
    diaryRepository?: DiaryRepository,
    catalogRepository?: ICatalogRepository,
    libraryRepository?: LibraryRepository,
    authGuard?: AuthGuard
  ) {
    this.diaryRepository = diaryRepository ?? new DiaryRepository();
    this.catalogRepository = catalogRepository ?? new CatalogRepository();
    this.libraryRepository = libraryRepository ?? new LibraryRepository();
    this.diaryService = new DiaryService(
      this.diaryRepository,
      this.catalogRepository,
      this.libraryRepository
    );

    if (authGuard) {
      this.authGuard = authGuard;
    } else {
      const tokenService = new TokenService();
      const usersRepository = new UsersRepository();
      this.authGuard = new AuthGuard(tokenService, usersRepository);
    }

    this.diaryController = new DiaryController(this.diaryService, this.authGuard);
  }
}

