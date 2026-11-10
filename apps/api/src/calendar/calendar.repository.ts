import {
  CalendarEventType,
  DateReliability,
} from '../../../../packages/shared/src/calendar.ts';
import type {
  CalendarEvent,
  NotificationItem,
  NotificationPreferences,
} from '../../../../packages/shared/src/calendar.ts';
import { CatalogRepository } from '../data/catalog.repository.ts';

export class CalendarRepository {
  private readonly catalogRepo?: CatalogRepository;
  private events: CalendarEvent[] = [];

  constructor(catalogRepo?: CatalogRepository) {
    this.catalogRepo = catalogRepo;
    this.seedDefaultEvents();
  }

  private seedDefaultEvents(): void {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    // Generate relative dates around current week
    const d1 = new Date(today);
    d1.setDate(today.getDate() - 1);
    const d2 = new Date(today);
    const d3 = new Date(today);
    d3.setDate(today.getDate() + 1);
    const d4 = new Date(today);
    d4.setDate(today.getDate() + 3);
    const d5 = new Date(today);
    d5.setDate(today.getDate() + 7);

    this.events = [
      {
        id: 'event-solo-ep12',
        mediaItemId: 'solo-leveling-anime',
        mediaTitle: 'Solo Leveling Season 2',
        mediaSlug: 'solo-leveling-anime',
        mediaType: 'ANIME',
        coverImage: '/covers/solo-leveling.svg',
        type: CalendarEventType.EPISODE_RELEASE,
        number: 12,
        season: 2,
        scheduledAt: `${toYMD(d2)}T15:30:00Z`,
        hasTime: true,
        originRegion: 'JP',
        reliability: DateReliability.CONFIRMED,
        sourceName: 'Tokyo MX',
      },
      {
        id: 'event-untamed-special',
        mediaItemId: 'the-untamed-dorama',
        mediaTitle: 'The Untamed: Special Edition',
        mediaSlug: 'the-untamed-dorama',
        mediaType: 'DORAMA',
        coverImage: '/covers/the-untamed.svg',
        type: CalendarEventType.SPECIAL_RELEASE,
        number: 1,
        season: 1,
        scheduledAt: `${toYMD(d3)}T12:00:00Z`,
        hasTime: true,
        originRegion: 'CN',
        reliability: DateReliability.ESTIMATED,
        sourceName: 'Tencent Video / WeTV',
      },
      {
        id: 'event-one-piece-ch1135',
        mediaItemId: 'one-piece-manga',
        mediaTitle: 'One Piece',
        mediaSlug: 'one-piece-manga',
        mediaType: 'MANGA',
        coverImage: '/covers/one-piece.svg',
        type: CalendarEventType.CHAPTER_RELEASE,
        number: 1135,
        scheduledAt: `${toYMD(d4)}T00:00:00Z`,
        hasTime: false,
        originRegion: 'JP',
        reliability: DateReliability.CONFIRMED,
        sourceName: 'Weekly Shonen Jump',
      },
      {
        id: 'event-crash-landing-remake',
        mediaItemId: 'crash-landing-on-you',
        mediaTitle: 'Crash Landing on You (American Adaptation)',
        mediaSlug: 'crash-landing-on-you',
        mediaType: 'DORAMA',
        coverImage: '/covers/crash-landing.svg',
        type: CalendarEventType.SERIES_PREMIERE,
        scheduledAt: `${toYMD(d5)}T00:00:00Z`,
        hasTime: false,
        originRegion: 'US',
        reliability: DateReliability.UNCONFIRMED,
        sourceName: 'Studio Dragon Press',
      },
    ];
  }

  async findAll(): Promise<CalendarEvent[]> {
    return [...this.events];
  }

  async findByDateRange(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    return this.events.filter((event) => {
      const eventDate = event.scheduledAt.split('T')[0];
      if (startDate && eventDate < startDate) return false;
      if (endDate && eventDate > endDate) return false;
      return true;
    });
  }

  async findById(id: string): Promise<CalendarEvent | null> {
    const found = this.events.find((e) => e.id === id);
    return found ? { ...found } : null;
  }

  async addEvent(event: CalendarEvent): Promise<CalendarEvent> {
    this.events.push({ ...event });
    return { ...event };
  }
}

export class NotificationRepository {
  private notifications: NotificationItem[] = [];
  private preferences: Map<string, NotificationPreferences> = new Map();

  async findNotificationsByUser(userId: string): Promise<NotificationItem[]> {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(
    data: Omit<NotificationItem, 'id' | 'createdAt'>
  ): Promise<NotificationItem> {
    const newItem: NotificationItem = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.notifications.push(newItem);
    return { ...newItem };
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationItem | null> {
    const item = this.notifications.find((n) => n.userId === userId && n.id === notificationId);
    if (!item) return null;
    item.isRead = true;
    return { ...item };
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    for (const item of this.notifications) {
      if (item.userId === userId && !item.isRead) {
        item.isRead = true;
        count++;
      }
    }
    return count;
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const existing = this.preferences.get(userId);
    if (existing) {
      return { ...existing };
    }
    const defaultPrefs: NotificationPreferences = {
      userId,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      soundAlerts: false,
    };
    this.preferences.set(userId, defaultPrefs);
    return { ...defaultPrefs };
  }

  async savePreferences(prefs: NotificationPreferences): Promise<NotificationPreferences> {
    this.preferences.set(prefs.userId, { ...prefs });
    return { ...prefs };
  }
}
