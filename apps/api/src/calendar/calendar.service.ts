import {
  CalendarViewMode,
  isWithinQuietHours,
} from '../../../../packages/shared/src/calendar.ts';
import type {
  CalendarEvent,
  CalendarEventsResponse,
  NotificationItem,
  NotificationPreferences,
  NotificationsListResponse,
} from '../../../../packages/shared/src/calendar.ts';
import { CalendarRepository, NotificationRepository } from './calendar.repository.ts';
import type { ICatalogRepository } from '../data/catalog.repository.ts';
import { LibraryRepository } from '../library/library.repository.ts';

export class CalendarService {
  private readonly calendarRepo: CalendarRepository;
  private readonly notificationRepo: NotificationRepository;
  private readonly catalogRepo?: ICatalogRepository;
  private readonly libraryRepo?: LibraryRepository;

  constructor(
    calendarRepo: CalendarRepository,
    notificationRepo: NotificationRepository,
    catalogRepo?: ICatalogRepository,
    libraryRepo?: LibraryRepository
  ) {
    this.calendarRepo = calendarRepo;
    this.notificationRepo = notificationRepo;
    this.catalogRepo = catalogRepo;
    this.libraryRepo = libraryRepo;
  }

  async getEvents(query: {
    view?: CalendarViewMode;
    startDate?: string;
    endDate?: string;
    category?: string;
    userId?: string;
  }): Promise<CalendarEventsResponse> {
    const view = query.view || CalendarViewMode.RELEASES;
    let events = await this.calendarRepo.findByDateRange(query.startDate, query.endDate);

    if (query.category && query.category !== 'ALL') {
      events = events.filter((e) => e.mediaType.toUpperCase() === query.category?.toUpperCase());
    }

    if (query.userId && this.libraryRepo) {
      const { items } = await this.libraryRepo.findMany(query.userId, { limit: 1000 });
      const trackingIds = new Set(
        items
          .filter(
            (i) =>
              i.status === 'ASSISTINDO' ||
              i.status === 'LENDO' ||
              (i.status as string) === 'WATCHING' ||
              (i.status as string) === 'READING'
          )
          .map((i) => i.mediaItemId)
      );

      const plannedIds = new Set(
        items
          .filter(
            (i) =>
              i.status === 'QUERO_ASSISTIR' ||
              i.status === 'QUERO_LER' ||
              (i.status as string) === 'PLAN_TO_WATCH' ||
              (i.status as string) === 'PLAN_TO_READ'
          )
          .map((i) => i.mediaItemId)
      );

      events = events.map((e) => ({
        ...e,
        isUserTracking: trackingIds.has(e.mediaItemId) || trackingIds.has(e.mediaSlug),
        isUserPlanned: plannedIds.has(e.mediaItemId) || plannedIds.has(e.mediaSlug),
      }));

      if (view === CalendarViewMode.TRACKING) {
        events = events.filter((e) => e.isUserTracking);
      } else if (view === CalendarViewMode.AGENDA) {
        events = events.filter((e) => e.isUserPlanned);
      }
    } else {
      if (view === CalendarViewMode.TRACKING || view === CalendarViewMode.AGENDA) {
        events = [];
      }
    }

    // Sort chronologically
    events.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    return {
      events,
      view,
      total: events.length,
    };
  }

  async createNotificationForEvent(
    userId: string,
    event: CalendarEvent
  ): Promise<NotificationItem> {
    const prefs = await this.notificationRepo.getPreferences(userId);
    let isQuiet = false;

    if (prefs.quietHoursEnabled) {
      isQuiet = isWithinQuietHours(new Date(), prefs.quietHoursStart, prefs.quietHoursEnd);
    }

    const title = `Novo lançamento: ${event.mediaTitle}`;
    const detail = event.number ? `Episódio / Capítulo ${event.number}` : 'Novo conteúdo disponível';
    const message = `${detail} agora disponível no YuukiList.`;

    return this.notificationRepo.createNotification({
      userId,
      eventId: event.id,
      mediaTitle: event.mediaTitle,
      mediaSlug: event.mediaSlug,
      coverImage: event.coverImage,
      title,
      message,
      isRead: false,
      isQuiet,
    });
  }

  async getNotifications(userId: string): Promise<NotificationsListResponse> {
    const notifications = await this.notificationRepo.findNotificationsByUser(userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationItem | null> {
    return this.notificationRepo.markAsRead(userId, notificationId);
  }

  async markAllAsRead(userId: string): Promise<number> {
    return this.notificationRepo.markAllAsRead(userId);
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    return this.notificationRepo.getPreferences(userId);
  }

  async updatePreferences(
    userId: string,
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const current = await this.notificationRepo.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...prefs,
      userId,
    };
    return this.notificationRepo.savePreferences(updated);
  }
}
