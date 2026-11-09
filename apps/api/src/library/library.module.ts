/**
 * YuukiList — Módulo de Biblioteca Pessoal
 */

import { CatalogRepository, type ICatalogRepository } from '../data/catalog.repository.ts';
import { AuthGuard } from '../auth/auth.guard.ts';
import { TokenService } from '../auth/token.service.ts';
import { UsersRepository } from '../auth/users.repository.ts';
import { LibraryRepository } from './library.repository.ts';
import { LibraryService } from './library.service.ts';
import { LibraryController } from './library.controller.ts';

export class LibraryModule {
  static readonly moduleName = 'LibraryModule';

  readonly libraryRepository: LibraryRepository;
  readonly catalogRepository: ICatalogRepository;
  readonly libraryService: LibraryService;
  readonly authGuard: AuthGuard;
  readonly libraryController: LibraryController;

  constructor(
    libraryRepository?: LibraryRepository,
    catalogRepository?: ICatalogRepository,
    authGuard?: AuthGuard
  ) {
    this.libraryRepository = libraryRepository ?? new LibraryRepository();
    this.catalogRepository = catalogRepository ?? new CatalogRepository();
    this.libraryService = new LibraryService(this.libraryRepository, this.catalogRepository);

    if (authGuard) {
      this.authGuard = authGuard;
    } else {
      const tokenService = new TokenService();
      const usersRepository = new UsersRepository();
      this.authGuard = new AuthGuard(tokenService, usersRepository);
    }

    this.libraryController = new LibraryController(this.libraryService, this.authGuard);
  }
}

