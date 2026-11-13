import { PrismaClient } from '@prisma/client';
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
  ProfileController,
  ProfileRepository,
  ProfileService,
  ProvisionalController,
  ProvisionalRepository,
  ProvisionalService,
  AdminController,
  AdminService,
  CatalogRepository,
  PrismaCatalogRepository,
  CatalogIngestionService,
} from '@yuukilist/api';
import { SAMPLE_EXTERNAL_TITLES } from '../../../../scripts/sync-catalog.mjs';

class ServerContainer {
  readonly catalogRepository: PrismaCatalogRepository;
  readonly catalogService: CatalogService;
  readonly catalogController: CatalogController;
  readonly authModule: AuthModule;
  readonly libraryController: LibraryController;
  readonly diaryController: DiaryController;
  readonly relationsController: RelationsController;
  readonly calendarController: CalendarController;
  readonly calendarService: CalendarService;
  readonly profileController: ProfileController;
  readonly profileService: ProfileService;
  readonly provisionalRepository: ProvisionalRepository;
  readonly provisionalService: ProvisionalService;
  readonly provisionalController: ProvisionalController;
  readonly adminService: AdminService;
  readonly adminController: AdminController;

  constructor() {
    const prismaClient =
      process.env.DATABASE_URL || process.env.DIRECT_URL ? new PrismaClient() : null;
    this.catalogRepository = new PrismaCatalogRepository(prismaClient || undefined);
    this.catalogService = new CatalogService(this.catalogRepository);
    this.catalogController = new CatalogController(this.catalogService);
    this.authModule = new AuthModule(prismaClient);
    const libraryRepo = new LibraryRepository(prismaClient);
    const diaryRepo = new DiaryRepository();
    const diaryService = new DiaryService(diaryRepo, this.catalogRepository, libraryRepo);
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

    const profileRepo = new ProfileRepository();
    this.profileService = new ProfileService(
      profileRepo,
      libraryRepo,
      this.catalogRepository,
      this.authModule.usersRepository,
      diaryRepo,
      (userId) => this.authModule.invalidateUserCache(userId)
    );
    this.profileController = new ProfileController(this.profileService);

    this.provisionalRepository = new ProvisionalRepository();
    this.provisionalService = new ProvisionalService(
      this.provisionalRepository,
      this.catalogRepository,
      libraryRepo
    );
    this.provisionalController = new ProvisionalController(this.provisionalService);

    this.adminService = new AdminService(
      this.provisionalRepository,
      this.catalogRepository
    );
    this.adminController = new AdminController(this.adminService);

    // Sincroniza amostra canônica apenas se o catálogo estiver vazio (não sobrescreve capas do Supabase)
    this.catalogRepository.count().then((total) => {
      if (total === 0) {
        const ingestion = new CatalogIngestionService(this.catalogRepository);
        return ingestion.syncCatalogBatch(SAMPLE_EXTERNAL_TITLES as any);
      }
      return undefined;
    }).catch(() => {});
  }
}

const globalForContainer = globalThis as unknown as { __container?: ServerContainer };
export const container = globalForContainer.__container || new ServerContainer();
globalForContainer.__container = container;
