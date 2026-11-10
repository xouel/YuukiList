import type {
  CalendarEventsResponse,
  NotificationsListResponse,
  NotificationPreferences,
  CalendarViewMode,
} from '@yuukilist/shared';

export class CalendarApiClient {
  async getEvents(params: {
    view?: CalendarViewMode;
    startDate?: string;
    endDate?: string;
    category?: string;
  } = {}): Promise<CalendarEventsResponse> {
    const query = new URLSearchParams();
    if (params.view) query.set('view', params.view);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.category && params.category !== 'ALL') query.set('category', params.category);

    const res = await fetch(`/api/v1/calendar/events?${query.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Falha ao buscar eventos de calendário: ${res.statusText}`);
    }
    return res.json();
  }

  async getNotifications(): Promise<NotificationsListResponse> {
    const res = await fetch('/api/v1/notifications', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Falha ao buscar notificações: ${res.statusText}`);
    }
    return res.json();
  }

  async markAsRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Falha ao marcar notificação como lida`);
    }
    return res.json();
  }

  async markAllAsRead(): Promise<{ success: boolean; markedCount: number }> {
    const res = await fetch('/api/v1/notifications/mark-all-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Falha ao marcar todas notificações como lidas`);
    }
    return res.json();
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const res = await fetch('/api/v1/notifications/preferences', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Falha ao buscar preferências`);
    }
    return res.json();
  }

  async updatePreferences(
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const res = await fetch('/api/v1/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
    if (!res.ok) {
      throw new Error(`Falha ao salvar preferências`);
    }
    return res.json();
  }
}

export const calendarApiClient = new CalendarApiClient();

