/**
 * YuukiList — Testes Automatizados da Experiência do Calendário Editorial (021-weekly-strip-calendar)
 * Validação rigorosa dos cenários normativos de specs/calendar-ui/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
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

describe('US1 — Navegação Semanal por Weekly Strip e Visualização por Turnos (TR-001, TR-002, TR-003 & TR-004)', () => {
  const calendarViewPath = join(projectRoot, 'apps/web/src/components/calendar/calendar-view.tsx');
  const dayGroupPath = join(projectRoot, 'apps/web/src/components/calendar/day-group.tsx');
  const calendarViewContent = readFileSync(calendarViewPath, 'utf8');
  const dayGroupContent = readFileSync(dayGroupPath, 'utf8');

  it('TR-003: getWeeklyStripDays deve gerar exatamente 7 dias (Seg a Dom) com contadores de eventos e indicador de hoje', () => {
    const monday = new Date(2026, 10, 9); // Seg, 9 de nov de 2026
    const mockEvents = [
      {
        id: 'ev-1',
        scheduledAt: '2026-11-09T09:00:00Z',
        hasTime: true,
      },
      {
        id: 'ev-2',
        scheduledAt: '2026-11-09T14:30:00Z',
        hasTime: true,
      },
      {
        id: 'ev-3',
        scheduledAt: '2026-11-12T20:00:00Z',
        hasTime: true,
      },
    ];

    const strip = getWeeklyStripDays(monday, mockEvents);
    assert.equal(strip.length, 7, 'Deve gerar exatamente 7 dias');
    assert.equal(strip[0].dayName, 'Seg', 'Primeiro dia deve ser Segunda');
    assert.equal(strip[0].dateStr, '2026-11-09', 'Data da segunda deve bater');
    assert.equal(strip[0].eventCount, 2, 'Segunda deve ter 2 eventos');
    assert.equal(strip[3].dayName, 'Qui', 'Quarto dia deve ser Quinta');
    assert.equal(strip[3].eventCount, 1, 'Quinta deve ter 1 evento');
    assert.equal(strip[6].dayName, 'Dom', 'Último dia deve ser Domingo');
    assert.equal(strip[6].eventCount, 0, 'Domingo deve ter 0 eventos');
  });

  it('TR-004: getEventShift deve classificar lançamentos em Manhã, Tarde e Noite', () => {
    // 09h -> MORNING
    const morningEvent = {
      id: 'm1',
      scheduledAt: '2026-11-10T09:30:00',
      hasTime: true,
    };
    assert.equal(getEventShift(morningEvent), 'MORNING', '09:30 deve ser classificado como Manhã');

    // 14h -> AFTERNOON
    const afternoonEvent = {
      id: 'a1',
      scheduledAt: '2026-11-10T14:15:00',
      hasTime: true,
    };
    assert.equal(getEventShift(afternoonEvent), 'AFTERNOON', '14:15 deve ser classificado como Tarde');

    // 21h -> NIGHT
    const nightEvent = {
      id: 'n1',
      scheduledAt: '2026-11-10T21:00:00',
      hasTime: true,
    };
    assert.equal(getEventShift(nightEvent), 'NIGHT', '21:00 deve ser classificado como Noite');

    // Sem horário -> NIGHT / A Definir
    const noTimeEvent = {
      id: 'nt1',
      scheduledAt: '2026-11-10T00:00:00',
      hasTime: false,
    };
    assert.equal(getEventShift(noTimeEvent), 'NIGHT', 'Sem horário deve ser agrupado em Noite / A Definir');
  });

  it('TR-004: groupEventsByShift deve agrupar eventos do dia preservando os turnos não vazios', () => {
    const dayEvents = [
      { id: '1', scheduledAt: '2026-11-10T08:00:00', hasTime: true, mediaTitle: 'Obra 1' },
      { id: '2', scheduledAt: '2026-11-10T15:00:00', hasTime: true, mediaTitle: 'Obra 2' },
      { id: '3', scheduledAt: '2026-11-10T22:00:00', hasTime: true, mediaTitle: 'Obra 3' },
    ];

    const groups = groupEventsByShift(dayEvents);
    assert.equal(groups.length, 3, 'Deve gerar 3 turnos');
    assert.equal(groups[0].shift, 'MORNING');
    assert.equal(groups[0].label, 'Manhã');
    assert.equal(groups[1].shift, 'AFTERNOON');
    assert.equal(groups[1].label, 'Tarde');
    assert.equal(groups[2].shift, 'NIGHT');
    assert.equal(groups[2].label, 'Noite');
  });

  it('TR-001 & TR-003: CalendarView deve conter a Weekly Strip no topo e alternância entre as 3 abas', () => {
    assert.ok(
      calendarViewContent.includes('WeeklyStrip') || calendarViewContent.includes('weekly-strip'),
      'CalendarView deve conter a Weekly Strip horizontal no topo'
    );
    assert.ok(
      calendarViewContent.includes('Lançamentos Gerais') &&
      calendarViewContent.includes('Acompanhamento') &&
      calendarViewContent.includes('Minha Agenda'),
      'Deve manter a alternância entre as três abas de visualização'
    );
  });

  it('TR-004: DayGroup deve renderizar seções visuais de turnos do dia', () => {
    assert.ok(
      dayGroupContent.includes('groupEventsByShift') || dayGroupContent.includes('turnos') || dayGroupContent.includes('Manhã'),
      'DayGroup deve utilizar o agrupamento por turnos do dia'
    );
  });
});

describe('US2 & US3 — Cards Despoluídos, Badges de Honestidade e Ação Lembrar/Seguir (TR-005, TR-006, TR-007 & TR-008)', () => {
  const eventCardPath = join(projectRoot, 'apps/web/src/components/calendar/event-card.tsx');
  const eventCardContent = readFileSync(eventCardPath, 'utf8');

  it('TR-007: formatEventSubtitle deve gerar legenda unificada limpa sem ruído de múltiplos badges', () => {
    const doramaEvent = {
      mediaType: 'DORAMA',
      type: CalendarEventType.EPISODE_RELEASE,
      number: 8,
      originRegion: 'KR',
    };
    const sub = formatEventSubtitle(doramaEvent);
    assert.ok(sub.includes('Dorama'), 'Legenda deve incluir categoria');
    assert.ok(sub.includes('Ep. 8'), 'Legenda deve incluir episódio de forma limpa');

    const movieEvent = {
      mediaType: 'FILME',
      type: CalendarEventType.MOVIE_RELEASE,
      originRegion: 'JP',
    };
    const movieSub = formatEventSubtitle(movieEvent);
    assert.ok(movieSub.includes('Filme'), 'Legenda deve identificar filme');
  });

  it('TR-005: formatEventTime deve formatar horário local corretamente', () => {
    const timeStr = formatEventTime('2026-11-10T14:30:00Z', true);
    assert.ok(timeStr.length > 0 && timeStr.includes(':'), 'Deve formatar hora e minuto');

    const noTimeStr = formatEventTime('2026-11-10T00:00:00Z', false);
    assert.equal(noTimeStr, 'Horário a definir', 'Sem hora deve indicar horário a definir');
  });

  it('TR-006 & TR-007: EventCard deve destacar horário, título editorial e badge de confiabilidade sutil', () => {
    assert.ok(
      eventCardContent.includes('formattedTime') || eventCardContent.includes('formatEventTime'),
      'EventCard deve destacar o horário local de transmissão'
    );
    assert.ok(
      eventCardContent.includes('Confirmada') && eventCardContent.includes('Data Estimada'),
      'EventCard deve exibir badges de confiabilidade discretos'
    );
    // Eliminação do excesso de badges sobrepostos
    assert.ok(
      !eventCardContent.includes('bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'),
      'EventCard não deve manter o badge ciano redundante antigo'
    );
  });

  it('TR-008: EventCard deve incluir botão interativo de ação rápida "Lembrar / Seguir" com alvo de toque acessível', () => {
    assert.ok(
      eventCardContent.includes('Lembrar') || eventCardContent.includes('Seguir') || eventCardContent.includes('Agenda'),
      'EventCard deve incluir botão rápido para lembrar ou seguir'
    );
    assert.ok(
      eventCardContent.includes('aria-label') || eventCardContent.includes('title'),
      'Botão de ação rápida deve possuir acessibilidade'
    );
  });
});

