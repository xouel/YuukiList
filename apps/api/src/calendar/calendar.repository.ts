import {
  CalendarEventType,
  DateReliability,
} from '../../../../packages/shared/src/calendar.ts';
import type {
  CalendarEvent,
  NotificationItem,
  NotificationPreferences,
} from '../../../../packages/shared/src/calendar.ts';
import type { MediaItemDetailDto } from '../../../../packages/shared/src/catalog.ts';
import type { ICatalogRepository } from '../data/catalog.repository.ts';

const CALENDAR_CACHE_TTL_MS = 60_000;

export class CalendarRepository {
  private readonly catalogRepo?: ICatalogRepository;
  private events: CalendarEvent[] = [];
  private generatedCache: { expiresAt: number; events: CalendarEvent[] } | null = null;

  constructor(catalogRepo?: ICatalogRepository) {
    this.catalogRepo = catalogRepo;
    if (this.catalogRepo) {
      this.catalogRepo.onItemUpserted?.(() => {
        this.generatedCache = null;
      });
    } else {
      this.seedDefaultEvents();
    }
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

  private formatDateYmd(offsetDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  private mapWorkToEvent(item: MediaItemDetailDto, index: number): CalendarEvent {
    const isReading =
      item.category === 'MANGA' || item.category === 'MANHWA' || item.category === 'MANHUA';
    const isMovie = item.category === 'FILME';

    const type = isMovie
      ? CalendarEventType.SPECIAL_RELEASE
      : isReading
        ? CalendarEventType.CHAPTER_RELEASE
        : CalendarEventType.EPISODE_RELEASE;

    const reliability = isMovie ? DateReliability.ESTIMATED : DateReliability.CONFIRMED;
    const number = isReading
      ? item.totalChapters && item.totalChapters > 0
        ? item.totalChapters
        : index + 1
      : item.totalEpisodes && item.totalEpisodes > 0
        ? item.totalEpisodes
        : index + 1;

    const defaultRegion =
      item.category === 'DORAMA' || item.category === 'MANHWA'
        ? 'KR'
        : item.category === 'MANHUA'
          ? 'CN'
          : 'JP';
    const originRegion = (item as any).originCountry || defaultRegion;
    const dayOffset = (index % 7) - 1;
    const hasTime = !isReading;
    const timeSuffix = hasTime ? 'T18:00:00Z' : 'T00:00:00Z';

    return {
      id: `cal-${item.id}`,
      mediaItemId: item.id,
      mediaTitle: item.title,
      mediaSlug: item.slug,
      mediaType: item.category,
      coverImage: item.coverUrl || `/api/v1/catalog/items/${item.slug}/cover`,
      type,
      number,
      ...(isReading || isMovie ? {} : { season: 1 }),
      scheduledAt: `${this.formatDateYmd(dayOffset)}${timeSuffix}`,
      hasTime,
      originRegion,
      reliability,
      sourceName: isReading ? 'Publicação Oficial' : 'Transmissão Oficial',
    };
  }

  private async getGeneratedEvents(): Promise<CalendarEvent[]> {
    if (!this.catalogRepo) return [];
    const now = Date.now();
    if (this.generatedCache && this.generatedCache.expiresAt > now) {
      return this.generatedCache.events;
    }

    const ongoing = await this.catalogRepo.findOngoingWorks(30);
    const generated = ongoing.map((item: MediaItemDetailDto, idx: number) =>
      this.mapWorkToEvent(item, idx)
    );

    // When catalog covers at least 4 ongoing works, represent upcoming/new premiere cadence if none present
    if (generated.length >= 4 && !generated.some((e) => e.type === CalendarEventType.SERIES_PREMIERE)) {
      const episodeEvents = generated.filter((e) => e.type === CalendarEventType.EPISODE_RELEASE);
      const chapterEvents = generated.filter((e) => e.type === CalendarEventType.CHAPTER_RELEASE);
      const premiereCandidate =
        episodeEvents.length >= 2
          ? episodeEvents.find((e) => e.mediaType !== 'ANIME') || episodeEvents[1]
          : chapterEvents.length >= 2
            ? chapterEvents[chapterEvents.length - 1]
            : undefined;
      if (premiereCandidate) {
        premiereCandidate.type = CalendarEventType.SERIES_PREMIERE;
        premiereCandidate.reliability = DateReliability.UNCONFIRMED;
      }
    }

    this.generatedCache = { expiresAt: now + CALENDAR_CACHE_TTL_MS, events: generated };
    return generated;
  }

  private async resolveAllEvents(): Promise<CalendarEvent[]> {
    if (!this.catalogRepo) {
      return [...this.events];
    }
    const generated = await this.getGeneratedEvents();
    const existingIds = new Set(this.events.map((e) => e.id));
    return [...this.events, ...generated.filter((e) => !existingIds.has(e.id))];
  }

  async findAll(): Promise<CalendarEvent[]> {
    return this.resolveAllEvents();
  }

  async findByDateRange(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    const all = await this.resolveAllEvents();
    return all.filter((event) => {
      const eventDate = event.scheduledAt.split('T')[0];
      if (startDate && eventDate < startDate) return false;
      if (endDate && eventDate > endDate) return false;
      return true;
    });
  }

  async findById(id: string): Promise<CalendarEvent | null> {
    const all = await this.resolveAllEvents();
    const found = all.find((e) => e.id === id);
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
