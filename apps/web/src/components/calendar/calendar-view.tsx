'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarViewMode, type CalendarEvent } from '@yuukilist/shared';
import { calendarApiClient } from '@/services/calendar-api.client';
import { DayGroup } from './day-group';
import { getWeeklyStripDays, computeCalendarKpis } from './calendar-helpers';
import { CalendarHeaderKpis } from './calendar-header-kpis';
import { CalendarSidebarWidgets } from './calendar-sidebar-widgets';

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

      const label =
        offsetWeeks === 0
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

  // KPIs dinâmicos do cabeçalho
  const kpis = useMemo(() => {
    return computeCalendarKpis(events, selectedDay || undefined);
  }, [events, selectedDay]);

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
    <div className="space-y-8">
      {/* 1. Cabeçalho ao Vivo com Faixa de 3 KPIs */}
      <CalendarHeaderKpis
        kpis={kpis}
        onSelectToday={() => {
          setOffsetWeeks(0);
          const pad = (n: number) => String(n).padStart(2, '0');
          const now = new Date();
          setSelectedDay(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
        }}
        onFilterQueue={() => setActiveView(CalendarViewMode.TRACKING)}
      />

      {/* 2. Barra de Visões e Controles de Navegação Temporal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2B2735]">
        {/* Seletor das 3 Visões Canônicas */}
        <div
          role="tablist"
          aria-label="Modo de visualização do calendário"
          className="inline-flex p-1 rounded-xl bg-[#1A1820] border border-[#2B2735] self-start"
        >
          <button
            role="tab"
            aria-selected={activeView === CalendarViewMode.RELEASES}
            onClick={() => setActiveView(CalendarViewMode.RELEASES)}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E05347]/40 ${
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
            className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E05347]/40 ${
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
            className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E05347]/40 ${
              activeView === CalendarViewMode.AGENDA
                ? 'bg-[#E05347] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Minha Agenda
          </button>
        </div>

        {/* Controles de Navegação Temporal */}
        <div className="flex flex-wrap items-center gap-3 bg-[#1A1820] p-2 rounded-xl border border-[#2B2735]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setOffsetWeeks((prev) => prev - 1)}
              aria-label="Período anterior"
              className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-[#24202C] hover:bg-[#2F2A3A] text-zinc-300 border border-[#2B2735] transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#E05347]/40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                setOffsetWeeks(0);
                setSelectedDay(null);
              }}
              className="min-h-[44px] px-3.5 py-1 rounded-lg text-xs font-semibold bg-[#24202C] text-zinc-200 hover:bg-[#2F2A3A] border border-[#2B2735] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E05347]/40"
            >
              Hoje
            </button>
            <button
              onClick={() => setOffsetWeeks((prev) => prev + 1)}
              aria-label="Próximo período"
              className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-[#24202C] hover:bg-[#2F2A3A] text-zinc-300 border border-[#2B2735] transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#E05347]/40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <span className="text-sm font-serif font-bold text-[#F4EFEA] px-2">
              {rangeLabel}
            </span>
          </div>

          <div className="inline-flex p-0.5 rounded-lg bg-[#24202C] border border-[#2B2735] text-xs ml-auto">
            <button
              onClick={() => {
                setTimeRange('WEEK');
                setOffsetWeeks(0);
              }}
              className={`min-h-[36px] px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                timeRange === 'WEEK'
                  ? 'bg-[#E05347] text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => {
                setTimeRange('MONTH');
                setOffsetWeeks(0);
              }}
              className={`min-h-[36px] px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                timeRange === 'MONTH'
                  ? 'bg-[#E05347] text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
      </div>

      {/* 3. Weekly Strip Horizontal com Selo HOJE */}
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
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center cursor-pointer min-w-[50px] min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#E05347]/40 ${
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
                    {day.isToday ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono uppercase bg-[#E05347] text-white tracking-wider">
                        HOJE
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          day.eventCount > 0 ? 'bg-[#2B2735] text-zinc-300' : 'text-zinc-600'
                        }`}
                      >
                        {day.eventCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Grade Assimétrica 8+4 (Timeline Principal e Sidebar de Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Principal da Timeline: 8 Colunas */}
        <main className="lg:col-span-8 space-y-6">
          {/* Filtro de Categorias */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[36px] px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E05347]/40 ${
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
                className="min-h-[44px] px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-900/60 hover:bg-red-800 text-red-200 transition-colors cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          ) : displayGroupedEvents.length === 0 ? (
            <div className="p-12 rounded-xl bg-[#1A1820] border border-[#2B2735] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#24202C] border border-[#2B2735] flex items-center justify-center mx-auto text-zinc-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-base font-serif font-bold text-[#F4EFEA]">
                {selectedDay
                  ? 'Nenhum lançamento catalogado para este dia específico'
                  : 'Nenhum lançamento encontrado para este período'}
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
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
                  'Você ainda não possui obras ativas com lançamentos previstos nesta data. Adicione obras à sua biblioteca!'
                ) : activeView === CalendarViewMode.AGENDA ? (
                  'Sua agenda pessoal não possui estreias planejadas para este período. Marque obras com o botão "Lembrar" para vê-las aqui!'
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
        </main>

        {/* Coluna Lateral de Widgets: 4 Colunas */}
        <div className="lg:col-span-4 sticky top-6">
          <CalendarSidebarWidgets events={events} />
        </div>
      </div>
    </div>
  );
}
