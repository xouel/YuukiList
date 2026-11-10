/**
 * YuukiList — Módulo de Calendário e Notificações (NestJS Modular Architecture)
 */

import { CalendarRepository, NotificationRepository } from './calendar.repository.ts';
import { CalendarService } from './calendar.service.ts';
import { CalendarController } from './calendar.controller.ts';
import { CatalogRepository } from '../data/catalog.repository.ts';
import { LibraryRepository } from '../library/library.repository.ts';

export class CalendarModule {
  static readonly moduleName = 'CalendarModule';

  readonly calendarRepository: CalendarRepository;
  readonly notificationRepository: NotificationRepository;
  readonly service: CalendarService;
  readonly controller: CalendarController;

  constructor(catalogRepo?: CatalogRepository, libraryRepo?: LibraryRepository) {
    this.calendarRepository = new CalendarRepository(catalogRepo);
    this.notificationRepository = new NotificationRepository();
    this.service = new CalendarService(
      this.calendarRepository,
      this.notificationRepository,
      catalogRepo,
      libraryRepo
    );
    this.controller = new CalendarController(this.service);
  }
}

