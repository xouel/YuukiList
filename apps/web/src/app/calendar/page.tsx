import React from 'react';
import { CalendarView } from '@/components/calendar/calendar-view';

export const metadata = {
  title: 'Calendário de Lançamentos | YuukiList',
  description: 'Calendário de estreias, episódios e capítulos de doramas, animes, mangás e manhwas.',
};

export default function CalendarPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <CalendarView />
    </main>
  );
}
