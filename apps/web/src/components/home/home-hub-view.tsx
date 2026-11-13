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

export interface HomeHubViewProps {
  initialFeatured?: MediaItemSummaryDto[];
  initialCatalog?: MediaItemSummaryDto[];
}

export function HomeHubView({ initialFeatured = [], initialCatalog = [] }: HomeHubViewProps = {}) {
  const { isAuthenticated } = useAuth();

  const [featuredByCategory, setFeaturedByCategory] = useState<MediaItemSummaryDto[]>(initialFeatured);
  const [featuredMedia, setFeaturedMedia] = useState<MediaItemSummaryDto | null>(
    initialFeatured[0] || initialCatalog[0] || null
  );
  const [libraryItems, setLibraryItems] = useState<LibraryItemDto[]>([]);
  const [trendingItems, setTrendingItems] = useState<MediaItemSummaryDto[]>(
    initialCatalog.slice(0, 6)
  );
  const [historyEvents, setHistoryEvents] = useState<HistoryEventDto[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEventDto[]>([]);
  const [isLoading, setIsLoading] = useState(initialFeatured.length === 0 && initialCatalog.length === 0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [featuredRes, catalogRes, calRes, libRes, diaryRes] = await Promise.allSettled([
        catalogApi.getFeatured(),
        catalogApi.listItems({ limit: 8 }),
        calendarApi.getEvents(),
        isAuthenticated ? libraryApi.listItems() : Promise.resolve(null),
        isAuthenticated ? diaryApi.list() : Promise.resolve(null),
      ]);

      let defaultSpotlight: MediaItemSummaryDto | null = null;

      if (featuredRes.status === 'fulfilled' && Array.isArray(featuredRes.value?.items)) {
        setFeaturedByCategory(featuredRes.value.items);
        defaultSpotlight = featuredRes.value.items[0] || null;
      }

      if (catalogRes.status === 'fulfilled' && Array.isArray(catalogRes.value?.data)) {
        setTrendingItems(catalogRes.value.data.slice(0, 6));
        if (!defaultSpotlight) {
          defaultSpotlight = catalogRes.value.data[0] || null;
        }
      }

      if (calRes.status === 'fulfilled' && calRes.value && Array.isArray(calRes.value.events)) {
        setUpcomingEvents(calRes.value.events);
      }

      if (isAuthenticated && libRes.status === 'fulfilled' && libRes.value) {
        const items = libRes.value.data || libRes.value.items || [];
        setLibraryItems(items);
        const activeItem = items.find((i) => i.status === 'ASSISTINDO' || i.status === 'LENDO');
        if (activeItem?.mediaItem && !defaultSpotlight) {
          defaultSpotlight = activeItem.mediaItem;
        }
      } else if (!isAuthenticated) {
        setLibraryItems([]);
      }

      if (isAuthenticated && diaryRes.status === 'fulfilled' && Array.isArray(diaryRes.value)) {
        setHistoryEvents(diaryRes.value);
      } else if (!isAuthenticated) {
        setHistoryEvents([]);
      }

      if (defaultSpotlight) {
        setFeaturedMedia(defaultSpotlight);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const handleQuickIncrement = async (mediaItemId: string, nextProgress: number) => {
    const prev = libraryItems;
    setLibraryItems((current) =>
      current.map((item) =>
        item.mediaItemId === mediaItemId ? { ...item, progress: nextProgress } : item
      )
    );
    try {
      const updated = await libraryApi.updateItem(mediaItemId, { progress: nextProgress });
      if (updated) {
        setLibraryItems((current) =>
          current.map((item) => (item.mediaItemId === mediaItemId ? updated : item))
        );
      }
    } catch {
      setLibraryItems(prev);
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
            featuredByCategory={featuredByCategory}
            media={featuredMedia}
            libraryItem={featuredLibraryItem}
            libraryItems={libraryItems}
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

