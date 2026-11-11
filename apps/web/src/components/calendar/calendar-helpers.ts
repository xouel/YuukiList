import type { CalendarEvent } from '@yuukilist/shared';
import { CalendarEventType } from '@yuukilist/shared';

export interface WeeklyStripDay {
  dateStr: string;        // "YYYY-MM-DD"
  dayName: string;        // "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"
  dayNumber: number;      // 10, 11, etc.
  isToday: boolean;
  eventCount: number;
}

export type DayShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT';

export interface ShiftGroup {
  shift: DayShiftType;
  label: string;          // "Manhã", "Tarde", "Noite"
  timeRange: string;      // "06:00 – 12:00", etc.
  events: CalendarEvent[];
}

export interface CalendarKpis {
  todayCount: number;
  queueCount: number;
  weekTotalCount: number;
  seasonTag: string;
}

export interface DualTimezones {
  localTime: string;
  jstTime: string;
  localLabel: string;
  jstLabel: string;
}

export interface WeeklyHighlightItem {
  id: string;
  mediaItemId: string;
  mediaTitle: string;
  mediaSlug: string;
  subtitle: string;
  coverImage?: string;
  scheduledAt: string;
  hasTime: boolean;
  formattedTime: string;
  isUserTracking: boolean;
}

export function computeCalendarKpis(events: CalendarEvent[], todayDateStr?: string): CalendarKpis {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fallbackTodayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const targetToday = todayDateStr || fallbackTodayStr;

  const todayCount = events.filter((e) => e.scheduledAt?.startsWith(targetToday)).length;
  const queueCount = events.filter((e) => Boolean(e.isUserTracking)).length;
  const weekTotalCount = events.length;

  const month = now.getMonth();
  const year = now.getFullYear();
  let season = 'OUTONO';
  if (month >= 0 && month <= 2) {
    season = 'INVERNO';
  } else if (month >= 3 && month <= 5) {
    season = 'PRIMAVERA';
  } else if (month >= 6 && month <= 8) {
    season = 'VERÃO';
  } else {
    season = 'OUTONO';
  }
  const seasonTag = `TEMPORADA DE ${season} ${year}`;

  return {
    todayCount,
    queueCount,
    weekTotalCount,
    seasonTag,
  };
}

export function formatDualTimezones(date: Date = new Date()): DualTimezones {
  const pad = (n: number) => String(n).padStart(2, '0');
  const localTime = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  const jstFormatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const jstTime = jstFormatter.format(date);

  return {
    localTime,
    jstTime,
    localLabel: 'Horário Local',
    jstLabel: 'Tóquio (JST, UTC+9)',
  };
}

export function extractWeeklyHighlights(events: CalendarEvent[], limit = 4): WeeklyHighlightItem[] {
  const sorted = [...events].sort((a, b) => {
    if (a.isUserTracking && !b.isUserTracking) return -1;
    if (!a.isUserTracking && b.isUserTracking) return 1;
    return a.scheduledAt.localeCompare(b.scheduledAt);
  });

  return sorted.slice(0, limit).map((ev) => ({
    id: ev.id,
    mediaItemId: ev.mediaItemId,
    mediaTitle: ev.mediaTitle,
    mediaSlug: ev.mediaSlug,
    subtitle: formatEventSubtitle(ev),
    coverImage: ev.coverImage,
    scheduledAt: ev.scheduledAt,
    hasTime: ev.hasTime,
    formattedTime: formatEventTime(ev.scheduledAt, ev.hasTime),
    isUserTracking: Boolean(ev.isUserTracking),
  }));
}

export function generateIcsCalendarContent(
  events: CalendarEvent[],
  calendarTitle = 'YuukiList - Programação Semanal'
): string {
  const formatIcsUtcDate = (d: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${d.getUTCFullYear()}` +
      `${pad(d.getUTCMonth() + 1)}` +
      `${pad(d.getUTCDate())}T` +
      `${pad(d.getUTCHours())}` +
      `${pad(d.getUTCMinutes())}` +
      `${pad(d.getUTCSeconds())}Z`
    );
  };

  const nowStamp = formatIcsUtcDate(new Date());

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YuukiList//Calendario//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarTitle}`,
  ];

  for (const ev of events) {
    const startObj = new Date(ev.scheduledAt);
    const endObj = new Date(startObj.getTime() + 30 * 60 * 1000);

    const dtStart = formatIcsUtcDate(startObj);
    const dtEnd = formatIcsUtcDate(endObj);
    const summary = `${ev.mediaTitle} - ${formatEventSubtitle(ev)}`;
    const description = `Lançamento catalogado no YuukiList.\\nOrigem: ${ev.originRegion || 'N/A'}`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.id || Math.random().toString(36).slice(2)}@yuukilist.local`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n') + '\r\n';
}

export function getWeeklyStripDays(mondayDate: Date, events: CalendarEvent[]): WeeklyStripDay[] {
  const days: WeeklyStripDay[] = [];
  const pad = (n: number) => String(n).padStart(2, '0');
  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const isToday =
      now.getFullYear() === d.getFullYear() &&
      now.getMonth() === d.getMonth() &&
      now.getDate() === d.getDate();

    const count = events.filter((e) => e.scheduledAt?.startsWith(dateStr)).length;
    days.push({
      dateStr,
      dayName: dayNames[i],
      dayNumber: d.getDate(),
      isToday,
      eventCount: count,
    });
  }
  return days;
}

export function getEventShift(event: Partial<CalendarEvent>): DayShiftType {
  if (!event.hasTime || !event.scheduledAt) {
    return 'NIGHT';
  }
  try {
    const d = new Date(event.scheduledAt);
    const hours = d.getHours();
    if (hours >= 6 && hours < 12) return 'MORNING';
    if (hours >= 12 && hours < 18) return 'AFTERNOON';
    return 'NIGHT';
  } catch {
    return 'NIGHT';
  }
}

export function groupEventsByShift(events: CalendarEvent[]): ShiftGroup[] {
  const morning: CalendarEvent[] = [];
  const afternoon: CalendarEvent[] = [];
  const night: CalendarEvent[] = [];

  for (const ev of events) {
    const shift = getEventShift(ev);
    if (shift === 'MORNING') morning.push(ev);
    else if (shift === 'AFTERNOON') afternoon.push(ev);
    else night.push(ev);
  }

  const result: ShiftGroup[] = [];
  if (morning.length > 0) {
    result.push({
      shift: 'MORNING',
      label: 'Manhã',
      timeRange: '06:00 – 12:00',
      events: morning,
    });
  }
  if (afternoon.length > 0) {
    result.push({
      shift: 'AFTERNOON',
      label: 'Tarde',
      timeRange: '12:00 – 18:00',
      events: afternoon,
    });
  }
  if (night.length > 0) {
    result.push({
      shift: 'NIGHT',
      label: 'Noite',
      timeRange: '18:00 – 06:00',
      events: night,
    });
  }
  return result;
}

export function formatEventTime(scheduledAt?: string, hasTime?: boolean): string {
  if (!scheduledAt || !hasTime) {
    return 'Horário a definir';
  }
  try {
    const d = new Date(scheduledAt);
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return 'Horário a definir';
  }
}

export function formatEventSubtitle(event: Partial<CalendarEvent>): string {
  const categoryNames: Record<string, string> = {
    DORAMA: 'Dorama',
    ANIME: 'Anime',
    MANGA: 'Mangá',
    MANHWA: 'Manhwa',
    MANHUA: 'Manhua',
    FILME: 'Filme',
  };
  const cat = (event.mediaType && categoryNames[event.mediaType]) || event.mediaType || 'Obra';
  let unit = '';
  if (event.type === CalendarEventType.EPISODE_RELEASE && event.number) {
    unit = `Ep. ${event.number}`;
  } else if (event.type === CalendarEventType.CHAPTER_RELEASE && event.number) {
    unit = `Cap. ${event.number}`;
  } else if (event.type === CalendarEventType.VOLUME_RELEASE && event.number) {
    unit = `Vol. ${event.number}`;
  } else if (event.type === CalendarEventType.SEASON_PREMIERE) {
    unit = event.season ? `Estreia T${event.season}` : 'Nova Temporada';
  } else if (event.type === CalendarEventType.SERIES_PREMIERE) {
    unit = 'Estreia';
  } else if (event.type === CalendarEventType.MOVIE_RELEASE) {
    unit = 'Lançamento';
  } else if (event.type === CalendarEventType.SPECIAL_RELEASE) {
    unit = 'Especial';
  }

  const parts = [cat];
  if (unit) parts.push(unit);
  if (event.originRegion) parts.push(event.originRegion);
  return parts.join(' • ');
}
