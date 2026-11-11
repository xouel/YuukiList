/**
 * YuukiList — Testes Automatizados do Live Calendar & Widgets (R26: 026-live-calendar-and-widgets)
 * Validação rigorosa dos cenários normativos de specs/calendar-ui/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  computeCalendarKpis,
  formatDualTimezones,
  extractWeeklyHighlights,
  generateIcsCalendarContent,
  getWeeklyStripDays,
  getEventShift,
  groupEventsByShift,
  formatEventTime,
  formatEventSubtitle,
} from '../apps/web/src/components/calendar/calendar-helpers.ts';
import {
  CalendarEventType,
  DateReliability,
} from '../packages/shared/src/index.ts';

const projectRoot = process.cwd();

describe('US1 — Faixa de KPIs ao Vivo e Layout Assimétrico 8+4 (TR-001, TR-002, TR-003, TR-004 & TR-005)', () => {
  const sampleEvents = [
    {
      id: 'ev-1',
      mediaItemId: 'm-1',
      mediaTitle: 'Frieren e a Jornada Para o Além',
      mediaSlug: 'frieren',
      mediaType: 'ANIME',
      type: CalendarEventType.EPISODE_RELEASE,
      number: 29,
      scheduledAt: '2026-11-11T14:30:00Z',
      hasTime: true,
      originRegion: 'JP',
      reliability: DateReliability.CONFIRMED,
      isUserTracking: true,
      isUserPlanned: true,
    },
    {
      id: 'ev-2',
      mediaItemId: 'm-2',
      mediaTitle: 'Solo Leveling',
      mediaSlug: 'solo-leveling',
      mediaType: 'ANIME',
      type: CalendarEventType.EPISODE_RELEASE,
      number: 14,
      scheduledAt: '2026-11-11T18:00:00Z',
      hasTime: true,
      originRegion: 'KR',
      reliability: DateReliability.CONFIRMED,
      isUserTracking: false,
      isUserPlanned: false,
    },
    {
      id: 'ev-3',
      mediaItemId: 'm-3',
      mediaTitle: 'Queen of Tears',
      mediaSlug: 'queen-of-tears',
      mediaType: 'DORAMA',
      type: CalendarEventType.EPISODE_RELEASE,
      number: 8,
      scheduledAt: '2026-11-13T21:00:00Z',
      hasTime: true,
      originRegion: 'KR',
      reliability: DateReliability.ESTIMATED,
      isUserTracking: true,
      isUserPlanned: false,
    },
  ];

  it('TR-005: computeCalendarKpis deve calcular Hoje, Na Sua Fila e Eventos da Semana', () => {
    const kpis = computeCalendarKpis(sampleEvents, '2026-11-11');
    assert.equal(kpis.todayCount, 2, 'Hoje deve contabilizar 2 eventos no dia 2026-11-11');
    assert.equal(kpis.queueCount, 2, 'Na Sua Fila deve contabilizar 2 eventos com isUserTracking=true');
    assert.equal(kpis.weekTotalCount, 3, 'Total de eventos da semana deve ser 3');
    assert.ok(kpis.seasonTag.includes('TEMPORADA DE') || kpis.seasonTag.includes('2026'), 'Tag de temporada deve ser calculada');
  });

  it('TR-003: getWeeklyStripDays deve gerar 7 dias com suporte ao selo HOJE', () => {
    const monday = new Date(2026, 10, 9); // 09/11/2026
    const strip = getWeeklyStripDays(monday, sampleEvents);
    assert.equal(strip.length, 7, 'Deve gerar 7 dias da semana');
    const dayWithEvents = strip.find((d) => d.dateStr === '2026-11-11');
    assert.ok(dayWithEvents, 'Dia 2026-11-11 deve estar na faixa semanal');
    assert.equal(dayWithEvents.eventCount, 2, 'Dia 2026-11-11 deve ter 2 eventos');
  });

  it('TR-005: Componente CalendarHeaderKpis deve existir e não conter emojis', () => {
    const headerPath = join(projectRoot, 'apps/web/src/components/calendar/calendar-header-kpis.tsx');
    assert.ok(existsSync(headerPath), 'calendar-header-kpis.tsx deve existir');
    const content = readFileSync(headerPath, 'utf8');
    assert.ok(content.includes('CalendarHeaderKpis'), 'Deve exportar CalendarHeaderKpis');
    assert.ok(content.includes('Hoje'), 'Deve exibir card Hoje');
    assert.ok(content.includes('Na Sua Fila'), 'Deve exibir card Na Sua Fila');
    assert.ok(content.includes('Eventos da Semana'), 'Deve exibir card Eventos da Semana');
    assert.ok(!/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(content), 'Não deve conter emojis');
  });

  it('TR-001 & TR-002: CalendarView deve conter grade assimétrica 8+4 e ausência de emojis', () => {
    const viewPath = join(projectRoot, 'apps/web/src/components/calendar/calendar-view.tsx');
    assert.ok(existsSync(viewPath), 'calendar-view.tsx deve existir');
    const content = readFileSync(viewPath, 'utf8');
    assert.ok(content.includes('lg:col-span-8'), 'Deve conter coluna de 8 slots para a timeline');
    assert.ok(content.includes('lg:col-span-4'), 'Deve conter coluna de 4 slots para a sidebar de widgets');
    assert.ok(content.includes('CalendarHeaderKpis'), 'Deve integrar CalendarHeaderKpis');
    assert.ok(content.includes('CalendarSidebarWidgets'), 'Deve integrar CalendarSidebarWidgets');
    assert.ok(content.includes('HOJE'), 'Weekly strip deve conter selo textual HOJE');
    // Verifica ausencia de caracteres legados no arquivo
    assert.ok(!content.includes('\u{1F4C5}'), 'Nao deve conter emoji de calendario');
    assert.ok(!content.includes('\u25C0'), 'Nao deve conter seta unicode');
    assert.ok(!content.includes('\u25B6'), 'Nao deve conter seta unicode');
  });
});

describe('US2 — Card de Lançamento com Horário Dedicado e Ação +1 Visto (TR-007, TR-008, TR-009, TR-010 & TR-011)', () => {
  it('TR-007 & TR-009: formatEventTime e formatEventSubtitle devem formatar horário e subtítulo', () => {
    const event = {
      type: CalendarEventType.EPISODE_RELEASE,
      number: 12,
      mediaType: 'ANIME',
      originRegion: 'Japão',
      scheduledAt: '2026-11-11T15:30:00Z',
      hasTime: true,
    };
    const time = formatEventTime(event.scheduledAt, event.hasTime);
    assert.ok(time.includes(':'), 'Horário deve ser formatado no formato HH:mm');
    const subtitle = formatEventSubtitle(event);
    assert.ok(subtitle.includes('Anime'), 'Subtítulo deve conter o tipo de mídia');
    assert.ok(subtitle.includes('Ep. 12'), 'Subtítulo deve conter o número do episódio');
    assert.ok(subtitle.includes('Japão'), 'Subtítulo deve conter a região');
  });

  it('TR-011: EventCard deve possuir botão tátil +1 Visto com alvo mínimo de 44px e sem emojis', () => {
    const cardPath = join(projectRoot, 'apps/web/src/components/calendar/event-card.tsx');
    assert.ok(existsSync(cardPath), 'event-card.tsx deve existir');
    const content = readFileSync(cardPath, 'utf8');

    assert.ok(content.includes('+1 Visto'), 'Deve conter botão de ação rápida +1 Visto');
    assert.ok(content.includes('min-h-[44px]'), 'Botões devem ter alvo tátil mínimo de 44px');
    assert.ok(content.includes('LibraryApiClient'), 'Deve importar ou instanciar LibraryApiClient');
    assert.ok(content.includes('DiaryApiClient'), 'Deve importar ou instanciar DiaryApiClient');
    // Verifica ausencia de caracteres legados no card
    assert.ok(!content.includes('\u{1F514}'), 'Nao deve conter emoji de sino');
    assert.ok(!content.includes('\u2713'), 'Nao deve conter simbolo de check unicode solto');
    assert.ok(!/[\u{1F300}-\u{1F9FF}]/u.test(content), 'Não deve conter nenhum emoji unicode');
  });
});

describe('US3 — Widgets Laterais: Relógio Duplo, Mais Esperados e RFC 5545 iCal (TR-006 & TR-010)', () => {
  const sampleEvents = [
    {
      id: 'ev-highlight-1',
      mediaItemId: 'm-snk',
      mediaTitle: 'Attack on Titan Especial',
      mediaSlug: 'attack-on-titan',
      mediaType: 'ANIME',
      type: CalendarEventType.SPECIAL_RELEASE,
      scheduledAt: '2026-11-11T12:00:00Z',
      hasTime: true,
      originRegion: 'JP',
      reliability: DateReliability.CONFIRMED,
      isUserTracking: true,
    },
    {
      id: 'ev-highlight-2',
      mediaItemId: 'm-frieren',
      mediaTitle: 'Frieren Além do Fim',
      mediaSlug: 'frieren',
      mediaType: 'ANIME',
      type: CalendarEventType.EPISODE_RELEASE,
      number: 28,
      scheduledAt: '2026-11-12T14:00:00Z',
      hasTime: true,
      originRegion: 'JP',
      reliability: DateReliability.CONFIRMED,
      isUserTracking: false,
    },
  ];

  it('TR-006: formatDualTimezones deve retornar horários no fuso local e em Tóquio JST', () => {
    const referenceDate = new Date('2026-11-11T12:00:00Z');
    const dual = formatDualTimezones(referenceDate);
    assert.ok(dual.localTime, 'Deve calcular horário local');
    assert.ok(dual.jstTime, 'Deve calcular horário JST Tóquio');
    // Em UTC 12:00, no Japão (UTC+9) são 21:00
    assert.equal(dual.jstTime, '21:00', 'Tóquio deve ser UTC+9 (21:00)');
    assert.ok(dual.jstLabel.includes('Tóquio') || dual.jstLabel.includes('JST'), 'Deve indicar o rótulo de Tóquio JST');
  });

  it('TR-006: extractWeeklyHighlights deve priorizar e limitar obras em destaque', () => {
    const highlights = extractWeeklyHighlights(sampleEvents, 2);
    assert.equal(highlights.length, 2, 'Deve extrair até o limite informado');
    assert.equal(highlights[0].id, 'ev-highlight-1', 'Primeiro destaque deve ser a obra em acompanhamento');
  });

  it('TR-006: generateIcsCalendarContent deve gerar arquivo RFC 5545 iCalendar válido com CRLF', () => {
    const ics = generateIcsCalendarContent(sampleEvents, 'YuukiList Agenda');
    assert.ok(ics.includes('BEGIN:VCALENDAR'), 'Deve conter BEGIN:VCALENDAR');
    assert.ok(ics.includes('VERSION:2.0'), 'Deve conter VERSION:2.0');
    assert.ok(ics.includes('BEGIN:VEVENT'), 'Deve conter blocos BEGIN:VEVENT');
    assert.ok(ics.includes('SUMMARY:Attack on Titan Especial'), 'Deve conter título do evento');
    assert.ok(ics.includes('END:VCALENDAR'), 'Deve conter END:VCALENDAR');
    assert.ok(ics.includes('\r\n'), 'Linhas devem ser terminadas em CRLF (RFC 5545)');
  });

  it('TR-006: Componente CalendarSidebarWidgets deve existir com relógio duplo, destaques e botão iCal', () => {
    const sidebarPath = join(projectRoot, 'apps/web/src/components/calendar/calendar-sidebar-widgets.tsx');
    assert.ok(existsSync(sidebarPath), 'calendar-sidebar-widgets.tsx deve existir');
    const content = readFileSync(sidebarPath, 'utf8');

    assert.ok(content.includes('CalendarSidebarWidgets'), 'Deve exportar CalendarSidebarWidgets');
    assert.ok(content.includes('Tóquio') || content.includes('JST'), 'Deve exibir fuso de Tóquio');
    assert.ok(content.includes('Mais Esperados') || content.includes('Destaques'), 'Deve exibir seção de destaques');
    assert.ok(content.includes('.ics') || content.includes('iCal') || content.includes('Exportar'), 'Deve conter ação de exportação de calendário');
    assert.ok(content.includes('min-h-[44px]'), 'Botão de exportação deve respeitar 44x44px');
    assert.ok(!/[\u{1F300}-\u{1F9FF}]/u.test(content), 'Não deve conter emojis');
  });
});
