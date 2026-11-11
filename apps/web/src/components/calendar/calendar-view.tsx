'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarViewMode, type CalendarEvent } from '@yuukilist/shared';
import { calendarApiClient } from '@/services/calendar-api.client';
import { DayGroup } from './day-group';
import { getWeeklyStripDays } from './calendar-helpers';

export function CalendarView() {
  const [activeView, setActiveView] = useState<CalendarViewMode>(CalendarViewMode.RELEASES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [offsetWeeks, setOffsetWeeks] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calcula a segunda-feira da semana de referência
  const mondayDate = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + offsetWeeks * 7);
    return monday;
  }, [offsetWeeks]);

  // Calcula datas de início e fim baseadas no offset
  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (timeRange === 'WEEK') {
      const sunday = new Date(mondayDate);
      sunday.setDate(mondayDate.getDate() + 6);

      const label = offsetWeeks === 0
        ? 'Esta Semana'
        : `${mondayDate.getDate()} de ${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(mondayDate)} - ${sunday.getDate()} de ${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(sunday)}`;

      return {
        startDate: toYMD(mondayDate),
        endDate: toYMD(sunday),
        rangeLabel: label,
      };
    } else {
      // MONTH view
      const now = new Date();
      const targetMonth = new Date(now.getFullYear(), now.getMonth() + offsetWeeks, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + offsetWeeks + 1, 0);
      const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(targetMonth);
      return {
        startDate: toYMD(targetMonth),
        endDate: toYMD(lastDay),
        rangeLabel: label.charAt(0).toUpperCase() + label.slice(1),
      };
    }
  }, [timeRange, offsetWeeks, mondayDate]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await calendarApiClient.getEvents({
        view: activeView,
        startDate,
        endDate,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      });
      setEvents(res.events || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar eventos de calendário');
    } finally {
      setLoading(false);
    }
  }, [activeView, startDate, endDate, selectedCategory]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Reset de dia selecionado ao mudar de semana/mês ou visão
  useEffect(() => {
    setSelectedDay(null);
  }, [offsetWeeks, timeRange, activeView]);

  // Gera dados da Weekly Strip horizontal (7 dias)
  const weeklyDays = useMemo(() => {
    return getWeeklyStripDays(mondayDate, events);
  }, [mondayDate, events]);

  // Agrupa eventos por data YYYY-MM-DD
  const groupedEvents = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const dateKey = event.scheduledAt.split('T')[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    }
    return Array.from(map.entries()).sort(([d1], [d2]) => d1.localeCompare(d2));
  }, [events]);

  // Filtra pelo dia selecionado se ativo
  const displayGroupedEvents = useMemo(() => {
    if (!selectedDay) return groupedEvents;
    return groupedEvents.filter(([dateKey]) => dateKey === selectedDay);
  }, [groupedEvents, selectedDay]);

  const categories = [
    { id: 'ALL', label: 'Todas as Categorias' },
    { id: 'DORAMA', label: 'Doramas' },
    { id: 'ANIME', label: 'Animes' },
    { id: 'MANGA', label: 'Mangás' },
    { id: 'MANHWA', label: 'Manhwas' },
    { id: 'MANHUA', label: 'Manhuas' },
    { id: 'FILME', label: 'Filmes' },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Abas Principais */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2B2735]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4EFEA] tracking-tight">
            Calendário de Lançamentos
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Acompanhe estreias, novos episódios e capítulos no seu fuso horário local.
          </p>
        </div>

        {/* Seletor das 3 Visões Canônicas */}
        <div
          role="tablist"
          aria-label="Modo de visualização do calendário"
          className="inline-flex p-1 rounded-xl bg-[#1A1820] border border-[#2B2735] self-start md:self-auto"
        >
          <button
            role="tab"
            aria-selected={activeView === CalendarViewMode.RELEASES}
            onClick={() => setActiveView(CalendarViewMode.RELEASES)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === CalendarViewMode.RELEASES
                ? 'bg-[#E05347] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Lançamentos Gerais
          </button>
          <button
            role="tab"
            aria-selected={activeView === CalendarViewMode.TRACKING}
            onClick={() => setActiveView(CalendarViewMode.TRACKING)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === CalendarViewMode.TRACKING
                ? 'bg-[#E05347] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Acompanhamento
          </button>
          <button
            role="tab"
            aria-selected={activeView === CalendarViewMode.AGENDA}
            onClick={() => setActiveView(CalendarViewMode.AGENDA)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === CalendarViewMode.AGENDA
                ? 'bg-[#E05347] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Minha Agenda
          </button>
        </div>
      </div>

      {/* Controles de Navegação Temporal */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1A1820] p-3 rounded-xl border border-[#2B2735]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffsetWeeks((prev) => prev - 1)}
            aria-label="Período anterior"
            className="p-1.5 rounded-lg bg-[#24202C] hover:bg-[#2F2A3A] text-zinc-300 border border-[#2B2735] transition-colors cursor-pointer"
          >
            ◀
          </button>
          <button
            onClick={() => setOffsetWeeks(0)}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#24202C] text-zinc-200 hover:bg-[#2F2A3A] border border-[#2B2735] transition-colors cursor-pointer"
          >
            Hoje
          </button>
          <button
            onClick={() => setOffsetWeeks((prev) => prev + 1)}
            aria-label="Próximo período"
            className="p-1.5 rounded-lg bg-[#24202C] hover:bg-[#2F2A3A] text-zinc-300 border border-[#2B2735] transition-colors cursor-pointer"
          >
            ▶
          </button>

          <span className="text-sm font-serif font-bold text-[#F4EFEA] ml-2">
            {rangeLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-0.5 rounded-lg bg-[#24202C] border border-[#2B2735] text-xs">
            <button
              onClick={() => { setTimeRange('WEEK'); setOffsetWeeks(0); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                timeRange === 'WEEK' ? 'bg-[#E05347] text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => { setTimeRange('MONTH'); setOffsetWeeks(0); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                timeRange === 'MONTH' ? 'bg-[#E05347] text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Strip (Carrossel Horizontal de Dias da Semana no Topo) */}
      {timeRange === 'WEEK' && (
        <section aria-label="Navegação semanal em faixa" className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <span>Programação da Semana</span>
            {selectedDay && (
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="text-[#E05347] hover:underline normal-case font-medium text-xs cursor-pointer"
              >
                Ver semana completa
              </button>
            )}
          </div>

          <div
            data-testid="weekly-strip"
            className="grid grid-cols-7 gap-2 overflow-x-auto pb-1"
          >
            {weeklyDays.map((day) => {
              const isSelected = selectedDay === day.dateStr;
              return (
                <button
                  key={day.dateStr}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedDay(isSelected ? null : day.dateStr)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center cursor-pointer min-w-[50px] ${
                    isSelected
                      ? 'bg-[#E05347]/20 border-[#E05347] text-[#F4EFEA] shadow-sm ring-1 ring-[#E05347]'
                      : day.isToday
                      ? 'bg-[#24202C] border-[#E05347]/60 text-[#F4EFEA]'
                      : 'bg-[#1A1820] border-[#2B2735] hover:border-[#3B3647] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-[11px] font-medium uppercase tracking-wider">
                    {day.dayName}
                  </span>
                  <span
                    className={`text-base font-bold my-0.5 font-mono ${
                      isSelected
                        ? 'text-[#E05347]'
                        : day.isToday
                        ? 'text-[#F4EFEA]'
                        : 'text-zinc-300'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {day.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E05347]" title="Hoje" />
                    )}
                    <span
                      className={`text-[10px] font-mono px-1 rounded ${
                        day.eventCount > 0 ? 'bg-[#2B2735] text-zinc-300' : 'text-zinc-600'
                      }`}
                    >
                      {day.eventCount}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Filtro de Categorias */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#E05347]/15 text-[#E05347] border-[#E05347]/40 shadow-sm font-semibold'
                : 'bg-[#1A1820] text-zinc-400 border-[#2B2735] hover:border-[#3B3647] hover:text-zinc-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Conteúdo: Loading, Erro ou Lista de Grupos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E05347]/20 border-t-[#E05347] animate-spin" />
          <p className="text-sm font-medium">Carregando calendário de lançamentos...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-red-950/30 border border-red-800/60 text-center space-y-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={loadEvents}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-900/60 hover:bg-red-800 text-red-200 transition-colors cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      ) : displayGroupedEvents.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#1A1820] border border-[#2B2735] text-center space-y-3">
          <div className="text-3xl text-zinc-600">📅</div>
          <h2 className="text-base font-serif font-bold text-[#F4EFEA]">
            {selectedDay
              ? 'Nenhum lançamento catalogado para este dia específico'
              : 'Nenhum lançamento encontrado para este período'}
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {selectedDay ? (
              <span>
                Não há lançamentos previstos para esta data.{' '}
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="text-[#E05347] underline hover:text-[#E05347]/80"
                >
                  Ver a programação completa da semana
                </button>
              </span>
            ) : activeView === CalendarViewMode.TRACKING ? (
              'Você ainda não possui obras ativas (Assistindo ou Lendo) com lançamentos previstos nesta data. Adicione obras à sua biblioteca!'
            ) : activeView === CalendarViewMode.AGENDA ? (
              'Sua agenda pessoal não possui estreias ou obras planejadas para este período. Marque obras com o botão "Lembrar" para vê-las aqui!'
            ) : (
              'Não há novos episódios ou capítulos catalogados para o filtro selecionado. Tente navegar para a próxima semana ou mês.'
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {displayGroupedEvents.map(([dateKey, dayEvents]) => (
            <DayGroup key={dateKey} dateString={dateKey} events={dayEvents} />
          ))}
        </div>
      )}
    </div>
  );
}
