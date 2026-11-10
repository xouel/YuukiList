export const CalendarEventType = Object.freeze({
  SERIES_PREMIERE: 'SERIES_PREMIERE',
  SEASON_PREMIERE: 'SEASON_PREMIERE',
  EPISODE_RELEASE: 'EPISODE_RELEASE',
  CHAPTER_RELEASE: 'CHAPTER_RELEASE',
  VOLUME_RELEASE: 'VOLUME_RELEASE',
  MOVIE_RELEASE: 'MOVIE_RELEASE',
  SPECIAL_RELEASE: 'SPECIAL_RELEASE',
} as const);

export type CalendarEventType = (typeof CalendarEventType)[keyof typeof CalendarEventType];

export const DateReliability = Object.freeze({
  CONFIRMED: 'CONFIRMED',
  ESTIMATED: 'ESTIMATED',
  UNCONFIRMED: 'UNCONFIRMED',
} as const);

export type DateReliability = (typeof DateReliability)[keyof typeof DateReliability];

export const CalendarViewMode = Object.freeze({
  RELEASES: 'RELEASES',
  TRACKING: 'TRACKING',
  AGENDA: 'AGENDA',
} as const);

export type CalendarViewMode = (typeof CalendarViewMode)[keyof typeof CalendarViewMode];

export interface CalendarEvent {
  id: string;
  mediaItemId: string;
  mediaTitle: string;
  mediaSlug: string;
  mediaType: string;
  coverImage?: string;
  type: CalendarEventType;
  number?: number;
  season?: number;
  scheduledAt: string; // ISO 8601
  hasTime: boolean;
  originRegion: string;
  reliability: DateReliability;
  sourceName?: string;
  isUserTracking?: boolean;
  isUserPlanned?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  eventId?: string;
  mediaTitle: string;
  mediaSlug: string;
  coverImage?: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isQuiet: boolean;
}

export interface NotificationPreferences {
  userId: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "08:00"
  soundAlerts: boolean;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  view: CalendarViewMode;
  total: number;
}

export interface NotificationsListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

/**
 * Checks if a given time (in "HH:mm" format or a Date object) falls within the quiet hours range.
 * Properly handles midnight-spanning ranges (e.g. 22:00 to 08:00).
 */
export function isWithinQuietHours(
  timeInput: string | Date,
  startStr: string = '22:00',
  endStr: string = '08:00'
): boolean {
  let timeStr: string;
  if (timeInput instanceof Date) {
    const hours = String(timeInput.getHours()).padStart(2, '0');
    const minutes = String(timeInput.getMinutes()).padStart(2, '0');
    timeStr = `${hours}:${minutes}`;
  } else if (typeof timeInput === 'string' && timeInput.includes('T')) {
    const date = new Date(timeInput);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    timeStr = `${hours}:${minutes}`;
  } else {
    timeStr = timeInput;
  }

  if (startStr === endStr) {
    return false;
  }

  if (startStr < endStr) {
    return timeStr >= startStr && timeStr < endStr;
  }

  // Crosses midnight (e.g., "22:00" to "08:00")
  return timeStr >= startStr || timeStr < endStr;
}
