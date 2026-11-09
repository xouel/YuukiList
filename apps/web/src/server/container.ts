import {
  CatalogController,
  AuthModule,
  LibraryController,
  LibraryRepository,
  LibraryService,
  CatalogRepository,
} from '@yuukilist/api';

class ServerContainer {
  readonly catalogController: CatalogController;
  readonly authModule: AuthModule;
  readonly libraryController: LibraryController;

  constructor() {
    this.catalogController = new CatalogController();
    this.authModule = new AuthModule();
    const catalogRepo = new CatalogRepository();
    const libraryRepo = new LibraryRepository();
    const libraryService = new LibraryService(libraryRepo, catalogRepo);
    this.libraryController = new LibraryController(libraryService, this.authModule.authGuard);
  }
}

const globalForContainer = globalThis as unknown as { __container?: ServerContainer };
export const container = globalForContainer.__container || new ServerContainer();
if (process.env.NODE_ENV !== 'production') {
  globalForContainer.__container = container;
}
