'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth-context.tsx';
import { HeroSpotlight } from './hero-spotlight.tsx';
import { ContinueWatching } from './continue-watching.tsx';
import { TrendingShowcase } from './trending-showcase.tsx';
import { BentoSidebar } from './bento-sidebar.tsx';
import { CatalogApiClient } from '../../services/catalog-api.client.ts';
import { LibraryApiClient } from '../../services/library-api.client.ts';
import { DiaryApiClient } from '../../services/diary-api.client.ts';
import { CalendarApiClient } from '../../services/calendar-api.client.ts';
import type {
  MediaItemSummaryDto,
  LibraryItemDto,
  HistoryEventDto,
  CalendarEventDto,
} from '../../../../../packages/shared/src/index.ts';

const catalogApi = new CatalogApiClient();
const libraryApi = new LibraryApiClient();
const diaryApi = new DiaryApiClient();
const calendarApi = new CalendarApiClient();

export function HomeHubView() {
  const { isAuthenticated } = useAuth();

  const [featuredMedia, setFeaturedMedia] = useState<MediaItemSummaryDto | null>(null);
  const [libraryItems, setLibraryItems] = useState<LibraryItemDto[]>([]);
  const [trendingItems, setTrendingItems] = useState<MediaItemSummaryDto[]>([]);
  const [historyEvents, setHistoryEvents] = useState<HistoryEventDto[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEventDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Carrega itens do catálogo para destaque e tendências
      const catalogRes = await catalogApi.listItems({ limit: 10 }).catch(() => null);
      if (catalogRes && catalogRes.data) {
        setFeaturedMedia(catalogRes.data[0] || null);
        setTrendingItems(catalogRes.data.slice(1, 7));
      }

      // 2. Se autenticado, carrega biblioteca e diário
      if (isAuthenticated) {
        const [libRes, diaryRes] = await Promise.allSettled([
          libraryApi.listItems(),
          diaryApi.listHistory(),
        ]);

        if (libRes.status === 'fulfilled') {
          const items = libRes.value.data || libRes.value.items || [];
          setLibraryItems(items);
          // Se tiver item em andamento, prioriza para o Hero Spotlight
          const activeItem = items.find((i) => i.status === 'ASSISTINDO' || i.status === 'LENDO');
          if (activeItem && activeItem.mediaItem) {
            setFeaturedMedia(activeItem.mediaItem);
          }
        }

        if (diaryRes.status === 'fulfilled' && Array.isArray(diaryRes.value)) {
          setHistoryEvents(diaryRes.value);
        }
      }

      // 3. Carrega eventos do calendário para próximas estreias
      const calRes = await calendarApi.getEvents({ range: 'WEEK' }).catch(() => null);
      if (calRes && Array.isArray(calRes.events)) {
        setUpcomingEvents(calRes.events);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const handleQuickIncrement = async (mediaItemId: string, nextProgress: number) => {
    try {
      await libraryApi.updateItem(mediaItemId, { progress: nextProgress });
      // Atualiza estado local
      setLibraryItems((prev) =>
        prev.map((item) =>
          item.mediaItemId === mediaItemId ? { ...item, progress: nextProgress } : item
        )
      );
    } catch {
      // Falha graciosa
    }
  };

  // Encontra item da biblioteca correspondente ao destaque
  const featuredLibraryItem = featuredMedia
    ? libraryItems.find((i) => i.mediaItemId === featuredMedia.id) || null
    : null;

  return (
    <div className="w-full space-y-8">
      {/* Grid Assimétrico 8+4 Colunas no Desktop / Coluna Única no Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Principal: Hero + Continuar Acompanhando + Tendências (8 Colunas) */}
        <section className="lg:col-span-8 space-y-8">
          <HeroSpotlight
            media={featuredMedia}
            libraryItem={featuredLibraryItem}
            isAuthenticated={isAuthenticated}
            onQuickIncrement={handleQuickIncrement}
          />

          <ContinueWatching
            items={libraryItems}
            isAuthenticated={isAuthenticated}
            onQuickIncrement={handleQuickIncrement}
          />

          <TrendingShowcase items={trendingItems} />
        </section>

        {/* Coluna Lateral: Bento Sidebar com Métricas e Lançamentos (4 Colunas) */}
        <div className="lg:col-span-4">
          <BentoSidebar
            isAuthenticated={isAuthenticated}
            historyEvents={historyEvents}
            upcomingEvents={upcomingEvents}
            totalEpisodesWeekly={18}
            totalHoursWeekly={7.2}
          />
        </div>
      </div>
    </div>
  );
}

