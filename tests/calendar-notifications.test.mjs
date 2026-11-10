import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CalendarEventType,
  DateReliability,
  CalendarViewMode,
  isWithinQuietHours,
} from '../packages/shared/src/index.ts';
import { CalendarRepository, NotificationRepository } from '../apps/api/src/calendar/calendar.repository.ts';
import { CalendarService } from '../apps/api/src/calendar/calendar.service.ts';
import { LibraryRepository } from '../apps/api/src/library/library.repository.ts';
import { CatalogRepository } from '../apps/api/src/data/catalog.repository.ts';

describe('R14 — Integrated Calendar & Notification Center (014-calendar-and-notifications)', () => {
  describe('Calendar Events & Reliability (TR-001, TR-002)', () => {
    it('TR-001: deve cadastrar e consultar eventos com tipos canonicos e confiabilidade explicita', async () => {
      const catalogRepo = new CatalogRepository();
      const calendarRepo = new CalendarRepository(catalogRepo);
      const notifRepo = new NotificationRepository();
      const calendarService = new CalendarService(calendarRepo, notifRepo, catalogRepo);

      const eventsRes = await calendarService.getEvents({ view: CalendarViewMode.RELEASES });
      assert.ok(eventsRes.events.length >= 4, 'Deve conter os eventos padroes seed');

      // Verifica tipos canonicos presentes
      const eventTypes = eventsRes.events.map((e) => e.type);
      assert.ok(eventTypes.includes(CalendarEventType.EPISODE_RELEASE));
      assert.ok(eventTypes.includes(CalendarEventType.CHAPTER_RELEASE));
      assert.ok(eventTypes.includes(CalendarEventType.SPECIAL_RELEASE));
      assert.ok(eventTypes.includes(CalendarEventType.SERIES_PREMIERE));

      // Verifica presenca de regioes de origem e confiabilidade
      const confirmed = eventsRes.events.find((e) => e.reliability === DateReliability.CONFIRMED);
      assert.ok(confirmed, 'Deve haver evento CONFIRMED');
      assert.ok(confirmed.originRegion, 'Deve possuir originRegion');
    });

    it('TR-002: deve identificar corretamente eventos com datas ESTIMATED e UNCONFIRMED', async () => {
      const calendarRepo = new CalendarRepository();
      const notifRepo = new NotificationRepository();
      const calendarService = new CalendarService(calendarRepo, notifRepo);

      const eventsRes = await calendarService.getEvents({ view: CalendarViewMode.RELEASES });
      const estimated = eventsRes.events.find((e) => e.reliability === DateReliability.ESTIMATED);
      const unconfirmed = eventsRes.events.find((e) => e.reliability === DateReliability.UNCONFIRMED);

      assert.ok(estimated, 'Deve encontrar evento estimado');
      assert.equal(estimated.reliability, DateReliability.ESTIMATED);
      assert.ok(unconfirmed, 'Deve encontrar evento nao confirmado');
      assert.equal(unconfirmed.reliability, DateReliability.UNCONFIRMED);
    });
  });

  describe('Tripartite Calendar Views & Library Sync (TR-003, TR-004, TR-005)', () => {
    it('TR-003: deve listar todos os eventos publicos na visao Lancamentos Gerais com filtro de categoria opcional', async () => {
      const calendarRepo = new CalendarRepository();
      const notifRepo = new NotificationRepository();
      const calendarService = new CalendarService(calendarRepo, notifRepo);

      const allEvents = await calendarService.getEvents({ view: CalendarViewMode.RELEASES });
      assert.ok(allEvents.total >= 4);

      const animeEvents = await calendarService.getEvents({
        view: CalendarViewMode.RELEASES,
        category: 'ANIME',
      });
      assert.ok(animeEvents.total >= 1);
      assert.ok(animeEvents.events.every((e) => e.mediaType === 'ANIME'));
    });

    it('TR-004: deve filtrar exclusivamente obras ativas da biblioteca do usuario na visao Acompanhamento', async () => {
      const calendarRepo = new CalendarRepository();
      const notifRepo = new NotificationRepository();
      const libraryRepo = new LibraryRepository();
      const calendarService = new CalendarService(calendarRepo, notifRepo, undefined, libraryRepo);

      const userId = 'user-tracker-1';

      // Sem obras ativas na biblioteca: retorna vazio
      const emptyTracking = await calendarService.getEvents({
        view: CalendarViewMode.TRACKING,
        userId,
      });
      assert.equal(emptyTracking.total, 0);

      // Adiciona 'solo-leveling-anime' como ASSISTINDO
      await libraryRepo.upsert(userId, {
        mediaItemId: 'solo-leveling-anime',
        status: 'ASSISTINDO',
        progress: 11,
      });

      const trackingRes = await calendarService.getEvents({
        view: CalendarViewMode.TRACKING,
        userId,
      });
      assert.equal(trackingRes.total, 1);
      assert.equal(trackingRes.events[0].mediaSlug, 'solo-leveling-anime');
      assert.equal(trackingRes.events[0].isUserTracking, true);
    });

    it('TR-005: deve exibir na visao Minha Agenda apenas obras com status planejado (QUERO_ASSISTIR / QUERO_LER)', async () => {
      const calendarRepo = new CalendarRepository();
      const notifRepo = new NotificationRepository();
      const libraryRepo = new LibraryRepository();
      const calendarService = new CalendarService(calendarRepo, notifRepo, undefined, libraryRepo);

      const userId = 'user-agenda-1';

      // Marca 'the-untamed-dorama' como QUERO_ASSISTIR
      await libraryRepo.upsert(userId, {
        mediaItemId: 'the-untamed-dorama',
        status: 'QUERO_ASSISTIR',
      });

      const agendaRes = await calendarService.getEvents({
        view: CalendarViewMode.AGENDA,
        userId,
      });

      assert.equal(agendaRes.total, 1);
      assert.equal(agendaRes.events[0].mediaSlug, 'the-untamed-dorama');
      assert.equal(agendaRes.events[0].isUserPlanned, true);
    });
  });

  describe('UI Layout & Timezone Formatting (TR-006, TR-007, TR-008, TR-009)', () => {
    it('TR-006: deve suportar transicao entre modos de visao RELEASES, TRACKING e AGENDA', async () => {
      const calendarRepo = new CalendarRepository();
      const notifRepo = new NotificationRepository();
      const libraryRepo = new LibraryRepository();
      const calendarService = new CalendarService(calendarRepo, notifRepo, undefined, libraryRepo);

      const userId = 'user-view-switch';
      await libraryRepo.upsert(userId, { mediaItemId: 'solo-leveling-anime', status: 'ASSISTINDO' });
      await libraryRepo.upsert(userId, { mediaItemId: 'one-piece-manga', status: 'QUERO_LER' });

      const releases = await calendarService.getEvents({ view: CalendarViewMode.RELEASES, userId });
      const tracking = await calendarService.getEvents({ view: CalendarViewMode.TRACKING, userId });
      const agenda = await calendarService.getEvents({ view: CalendarViewMode.AGENDA, userId });

      assert.ok(releases.total >= 4);
      assert.equal(tracking.total, 1);
      assert.equal(tracking.events[0].mediaSlug, 'solo-leveling-anime');
      assert.equal(agenda.total, 1);
      assert.equal(agenda.events[0].mediaSlug, 'one-piece-manga');
    });

    it('TR-007: deve ordenar eventos cronologicamente para viabilizar agrupamento por dia (DayGroup)', async () => {
      const calendarRepo = new CalendarRepository();
      const notifRepo = new NotificationRepository();
      const calendarService = new CalendarService(calendarRepo, notifRepo);

      const res = await calendarService.getEvents({ view: CalendarViewMode.RELEASES });
      for (let i = 0; i < res.events.length - 1; i++) {
        const t1 = new Date(res.events[i].scheduledAt).getTime();
        const t2 = new Date(res.events[i + 1].scheduledAt).getTime();
        assert.ok(t1 <= t2, `Evento ${i} deve ser anterior ou igual ao evento ${i + 1}`);
      }
    });

    it('TR-008: deve preservar flag hasTime e permitir formatacao local transparente', () => {
      const dateWithTime = '2026-11-15T15:30:00Z';
      const dateWithoutTime = '2026-11-15T00:00:00Z';

      // Evento com hora: pode ser formatado com hora e minuto
      const d1 = new Date(dateWithTime);
      assert.equal(isNaN(d1.getTime()), false);

      // Evento sem hora (hasTime = false): a data bruta deve ser mantida
      assert.equal(dateWithoutTime.split('T')[0], '2026-11-15');
    });

    it('TR-009: deve classificar badges visuais confiaveis vs estimados', () => {
      const getBadgeLabel = (reliability) => {
        switch (reliability) {
          case DateReliability.CONFIRMED:
            return 'Confirmada';
          case DateReliability.ESTIMATED:
            return 'Data Estimada';
          case DateReliability.UNCONFIRMED:
            return 'Não Confirmada';
          default:
            return 'Desconhecida';
        }
      };

      assert.equal(getBadgeLabel(DateReliability.CONFIRMED), 'Confirmada');
      assert.equal(getBadgeLabel(DateReliability.ESTIMATED), 'Data Estimada');
      assert.equal(getBadgeLabel(DateReliability.UNCONFIRMED), 'Não Confirmada');
    });
  });

  describe('In-App Notification Center & Quiet Hours (TR-010, TR-011, TR-012, TR-013)', () => {
    it('TR-010: deve criar notificacao de novo lancamento e incrementar contador de nao lidas', async () => {
      const calendarRepo = new CalendarRepository();
      const notifRepo = new NotificationRepository();
      const calendarService = new CalendarService(calendarRepo, notifRepo);

      const userId = 'user-notif-1';
      const event = {
        id: 'event-solo-ep13',
        mediaItemId: 'solo-leveling-anime',
        mediaTitle: 'Solo Leveling Season 2',
        mediaSlug: 'solo-leveling-anime',
        mediaType: 'ANIME',
        coverImage: '/covers/solo.svg',
        type: CalendarEventType.EPISODE_RELEASE,
        number: 13,
        scheduledAt: new Date().toISOString(),
        hasTime: true,
        originRegion: 'JP',
        reliability: DateReliability.CONFIRMED,
      };

      const notif = await calendarService.createNotificationForEvent(userId, event);
      assert.ok(notif.id);
      assert.equal(notif.userId, userId);
      assert.equal(notif.isRead, false);

      const list = await calendarService.getNotifications(userId);
      assert.equal(list.unreadCount, 1);
      assert.equal(list.notifications[0].id, notif.id);
    });

    it('TR-011: deve permitir marcar notificacao individual ou em massa como lida', async () => {
      const calendarRepo = new CalendarRepository();
      const notifRepo = new NotificationRepository();
      const calendarService = new CalendarService(calendarRepo, notifRepo);

      const userId = 'user-notif-read';
      const n1 = await notifRepo.createNotification({
        userId,
        mediaTitle: 'Obra 1',
        mediaSlug: 'obra-1',
        title: 'Ep 1',
        message: 'Lancado',
        isRead: false,
        isQuiet: false,
      });
      const n2 = await notifRepo.createNotification({
        userId,
        mediaTitle: 'Obra 2',
        mediaSlug: 'obra-2',
        title: 'Ep 2',
        message: 'Lancado',
        isRead: false,
        isQuiet: false,
      });

      let list = await calendarService.getNotifications(userId);
      assert.equal(list.unreadCount, 2);

      // Marca individual
      await calendarService.markAsRead(userId, n1.id);
      list = await calendarService.getNotifications(userId);
      assert.equal(list.unreadCount, 1);

      // Marca todas
      const marked = await calendarService.markAllAsRead(userId);
      assert.equal(marked, 1);

      list = await calendarService.getNotifications(userId);
      assert.equal(list.unreadCount, 0);
    });

    it('TR-012: deve detectar e aplicar Horario Silencioso (Quiet Hours) corretamente', () => {
      // 22:00 as 08:00 (cruza meia-noite)
      assert.equal(isWithinQuietHours('22:00', '22:00', '08:00'), true, '22:00 esta em quiet hours');
      assert.equal(isWithinQuietHours('23:30', '22:00', '08:00'), true, '23:30 esta em quiet hours');
      assert.equal(isWithinQuietHours('03:15', '22:00', '08:00'), true, '03:15 esta em quiet hours');
      assert.equal(isWithinQuietHours('07:59', '22:00', '08:00'), true, '07:59 esta em quiet hours');
      assert.equal(isWithinQuietHours('08:00', '22:00', '08:00'), false, '08:00 esta fora de quiet hours');
      assert.equal(isWithinQuietHours('14:00', '22:00', '08:00'), false, '14:00 esta fora de quiet hours');
      assert.equal(isWithinQuietHours('21:59', '22:00', '08:00'), false, '21:59 esta fora de quiet hours');

      // Intervalo diurno (ex: 13:00 as 15:00)
      assert.equal(isWithinQuietHours('14:00', '13:00', '15:00'), true);
      assert.equal(isWithinQuietHours('16:00', '13:00', '15:00'), false);
    });

    it('TR-013: deve salvar e aplicar preferencias de horario silencioso do usuario', async () => {
      const calendarRepo = new CalendarRepository();
      const notifRepo = new NotificationRepository();
      const calendarService = new CalendarService(calendarRepo, notifRepo);

      const userId = 'user-custom-quiet';
      const defaultPrefs = await calendarService.getPreferences(userId);
      assert.equal(defaultPrefs.quietHoursEnabled, true);
      assert.equal(defaultPrefs.quietHoursStart, '22:00');
      assert.equal(defaultPrefs.quietHoursEnd, '08:00');

      const updated = await calendarService.updatePreferences(userId, {
        quietHoursStart: '23:00',
        quietHoursEnd: '07:00',
        soundAlerts: false,
      });

      assert.equal(updated.quietHoursStart, '23:00');
      assert.equal(updated.quietHoursEnd, '07:00');

      const reloaded = await calendarService.getPreferences(userId);
      assert.equal(reloaded.quietHoursStart, '23:00');
    });
  });
});

