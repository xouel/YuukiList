import { CalendarService } from './calendar.service.ts';
import type { CalendarViewMode, NotificationPreferences } from '../../../../packages/shared/src/calendar.ts';

export class CalendarController {
  private readonly calendarService: CalendarService;

  constructor(calendarService: CalendarService) {
    this.calendarService = calendarService;
  }

  async getEvents(query: {
    view?: CalendarViewMode;
    startDate?: string;
    endDate?: string;
    category?: string;
    userId?: string;
  }) {
    return this.calendarService.getEvents(query);
  }

  async getNotifications(userId: string) {
    if (!userId) {
      return { notifications: [], unreadCount: 0 };
    }
    return this.calendarService.getNotifications(userId);
  }

  async markAsRead(userId: string, notificationId: string) {
    if (!userId || !notificationId) {
      return { success: false, error: 'Missing userId or notificationId' };
    }
    const notification = await this.calendarService.markAsRead(userId, notificationId);
    if (!notification) {
      return { success: false, error: 'Notification not found' };
    }
    return { success: true, notification };
  }

  async markAllAsRead(userId: string) {
    if (!userId) {
      return { success: false, markedCount: 0 };
    }
    const count = await this.calendarService.markAllAsRead(userId);
    return { success: true, markedCount: count };
  }

  async getPreferences(userId: string) {
    if (!userId) {
      return null;
    }
    return this.calendarService.getPreferences(userId);
  }

  async updatePreferences(userId: string, body: Partial<NotificationPreferences>) {
    if (!userId) {
      return null;
    }
    return this.calendarService.updatePreferences(userId, body);
  }
}
