'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarViewMode, type CalendarEvent } from '@yuukilist/shared';
import { calendarApiClient } from '@/services/calendar-api.client';
import { DayGroup } from './day-group';

export function CalendarView() {
  const [activeView, setActiveView] = useState<CalendarViewMode>(CalendarViewMode.RELEASES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [offsetWeeks, setOffsetWeeks] = useState<number>(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calcula datas de início e fim baseadas no offset
  const { startDate, endDate, rangeLabel } = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (timeRange === 'WEEK') {
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday + offsetWeeks * 7);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const label = offsetWeeks === 0
        ? 'Esta Semana'
        : `${monday.getDate()} de ${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(monday)} - ${sunday.getDate()} de ${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(sunday)}`;

      return {
        startDate: toYMD(monday),
        endDate: toYMD(sunday),
        rangeLabel: label,
      };
    } else {
      // MONTH view
      const targetMonth = new Date(now.getFullYear(), now.getMonth() + offsetWeeks, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + offsetWeeks + 1, 0);
      const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(targetMonth);
      return {
        startDate: toYMD(targetMonth),
        endDate: toYMD(lastDay),
        rangeLabel: label.charAt(0).toUpperCase() + label.slice(1),
      };
    }
  }, [timeRange, offsetWeeks]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
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
          className="inline-flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start md:self-auto"
        >
          <button
            role="tab"
            aria-selected={activeView === CalendarViewMode.RELEASES}
            onClick={() => setActiveView(CalendarViewMode.RELEASES)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === CalendarViewMode.RELEASES
                ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Lançamentos Gerais
          </button>
          <button
            role="tab"
            aria-selected={activeView === CalendarViewMode.TRACKING}
            onClick={() => setActiveView(CalendarViewMode.TRACKING)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === CalendarViewMode.TRACKING
                ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Acompanhamento
          </button>
          <button
            role="tab"
            aria-selected={activeView === CalendarViewMode.AGENDA}
            onClick={() => setActiveView(CalendarViewMode.AGENDA)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === CalendarViewMode.AGENDA
                ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Minha Agenda
          </button>
        </div>
      </div>

      {/* Controles de Navegação Temporal e Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-850">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffsetWeeks((prev) => prev - 1)}
            aria-label="Período anterior"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 transition-colors"
          >
            ◀
          </button>
          <button
            onClick={() => setOffsetWeeks(0)}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-200 hover:bg-zinc-750 border border-zinc-700 transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => setOffsetWeeks((prev) => prev + 1)}
            aria-label="Próximo período"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 transition-colors"
          >
            ▶
          </button>

          <span className="text-sm font-semibold text-zinc-200 ml-2">
            {rangeLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs">
            <button
              onClick={() => { setTimeRange('WEEK'); setOffsetWeeks(0); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                timeRange === 'WEEK' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => { setTimeRange('MONTH'); setOffsetWeeks(0); }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                timeRange === 'MONTH' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
      </div>

      {/* Filtro de Categorias */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-sm'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Conteúdo: Loading, Erro ou Lista de Grupos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          <p className="text-sm font-medium">Carregando calendário de lançamentos...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-red-950/30 border border-red-800/60 text-center space-y-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={loadEvents}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-900/60 hover:bg-red-800 text-red-200 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : groupedEvents.length === 0 ? (
        <div className="p-12 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
          <div className="text-3xl text-zinc-600">📅</div>
          <h2 className="text-base font-semibold text-zinc-300">
            Nenhum lançamento encontrado para este período
          </h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {activeView === CalendarViewMode.TRACKING
              ? 'Você ainda não possui obras ativas (Assistindo ou Lendo) com lançamentos previstos nesta data. Adicione obras à sua biblioteca!'
              : activeView === CalendarViewMode.AGENDA
              ? 'Sua agenda pessoal não possui estreias ou obras planejadas para este período. Marque obras como "Quero Assistir" para vê-las aqui!'
              : 'Não há novos episódios ou capítulos catalogados para o filtro selecionado. Tente navegar para a próxima semana ou mês.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEvents.map(([dateKey, dayEvents]) => (
            <DayGroup key={dateKey} dateString={dateKey} events={dayEvents} />
          ))}
        </div>
      )}
    </div>
  );
}

