import {
  CatalogController,
  CatalogService,
  AuthModule,
  LibraryController,
  LibraryRepository,
  LibraryService,
  DiaryController,
  DiaryRepository,
  DiaryService,
  RelationsController,
  RelationsRepository,
  RelationsService,
  CalendarController,
  CalendarRepository,
  CalendarService,
  NotificationRepository,
  CatalogRepository,
  CatalogIngestionService,
} from '@yuukilist/api';
import { SAMPLE_EXTERNAL_TITLES } from '../../../../scripts/sync-catalog.mjs';

class ServerContainer {
  readonly catalogRepository: CatalogRepository;
  readonly catalogService: CatalogService;
  readonly catalogController: CatalogController;
  readonly authModule: AuthModule;
  readonly libraryController: LibraryController;
  readonly diaryController: DiaryController;
  readonly relationsController: RelationsController;
  readonly calendarController: CalendarController;
  readonly calendarService: CalendarService;

  constructor() {
    this.catalogRepository = new CatalogRepository();
    this.catalogService = new CatalogService(this.catalogRepository);
    this.catalogController = new CatalogController(this.catalogService);
    this.authModule = new AuthModule();
    const libraryRepo = new LibraryRepository();
    const diaryRepo = new DiaryRepository();
    const diaryService = new DiaryService(diaryRepo, libraryRepo);
    const libraryService = new LibraryService(libraryRepo, this.catalogRepository, diaryService);
    this.libraryController = new LibraryController(libraryService, this.authModule.authGuard);
    this.diaryController = new DiaryController(diaryService, this.authModule.authGuard);

    const relationsRepo = new RelationsRepository(this.catalogRepository);
    const relationsService = new RelationsService(relationsRepo, this.catalogRepository, libraryRepo);
    this.relationsController = new RelationsController(relationsService, this.authModule.authGuard);

    const calendarRepo = new CalendarRepository(this.catalogRepository);
    const notifRepo = new NotificationRepository();
    this.calendarService = new CalendarService(calendarRepo, notifRepo, this.catalogRepository, libraryRepo);
    this.calendarController = new CalendarController(this.calendarService);

    // Sincroniza lote canônico ingerido na memória do catálogo (Task 3.1)
    const ingestion = new CatalogIngestionService(this.catalogRepository);
    ingestion.syncCatalogBatch(SAMPLE_EXTERNAL_TITLES as any).catch(() => {});
  }
}

const globalForContainer = globalThis as unknown as { __container?: ServerContainer };
export const container = globalForContainer.__container || new ServerContainer();
if (process.env.NODE_ENV !== 'production') {
  globalForContainer.__container = container;
}
