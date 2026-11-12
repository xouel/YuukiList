'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  Category,
  PublicationStatus,
  CatalogSortBy,
  CatalogQueryDto,
  MediaItemSummaryDto,
  PaginationMeta,
} from '../../../../../packages/shared/src/index.ts';
import { CatalogApiClient } from '../../services/catalog-api.client.ts';
import { LibraryApiClient } from '../../services/library-api.client.ts';
import { useAuth } from '../../context/auth-context.tsx';
import { SearchBar } from './search-bar.tsx';
import { FilterBar } from './filter-bar.tsx';
import { MediaCard } from './media-card.tsx';
import { MediaGridSkeleton } from './media-card-skeleton.tsx';
import { EmptyState, NoResultsState, ErrorState } from './async-feedback.tsx';

interface CatalogViewProps {
  initialQuery?: CatalogQueryDto;
  apiClient?: CatalogApiClient;
}

const STORAGE_KEY = 'yuuki:catalog:nav_state';

export function CatalogView({
  initialQuery = {},
  apiClient = new CatalogApiClient(),
}: CatalogViewProps) {
  const { isAuthenticated } = useAuth();
  const [libraryMediaIds, setLibraryMediaIds] = useState<Set<string>>(new Set());

  // Estado de Filtros e Busca
  const [query, setQuery] = useState<CatalogQueryDto>({
    q: initialQuery.q || '',
    category: initialQuery.category,
    status: initialQuery.status,
    country: initialQuery.country,
    theme: initialQuery.theme,
    sortBy: initialQuery.sortBy || 'relevance',
    page: 1,
    limit: 20,
  });

  // Estado da Lista e Paginação Cumulativa (Infinite Scroll)
  const [items, setItems] = useState<MediaItemSummaryDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Estados Assíncronos: loading | success | empty | no-results | error
  const [viewStatus, setViewStatus] = useState<'loading' | 'success' | 'empty' | 'no-results' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Sentinel de Rolagem Infinita
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const activeAbortController = useRef<AbortController | null>(null);

  // Carrega IDs das obras já presentes na biblioteca do usuário autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      setLibraryMediaIds(new Set());
      return;
    }
    const libClient = new LibraryApiClient();
    libClient
      .listItems()
      .then((res) => {
        const items = res?.items || res?.data || [];
        const ids = new Set(items.map((i) => i.mediaItemId));
        setLibraryMediaIds(ids);
      })
      .catch(() => {
        // Falha graciosa se API não responder
      });
  }, [isAuthenticated]);

  // Sincroniza query com a URL (browser history)
  const syncUrlWithQuery = useCallback(
    (q: CatalogQueryDto) => {
      if (typeof window === 'undefined') return;
      const qs = apiClient.buildQueryString(q);
      const newUrl = `${window.location.pathname}${qs}`;
      window.history.replaceState({ ...window.history.state, query: q }, '', newUrl);
    },
    [apiClient]
  );

  // Carrega a primeira página ou quando os filtros mudam
  const loadInitialItems = useCallback(
    async (currentQuery: CatalogQueryDto) => {
      if (activeAbortController.current) {
        activeAbortController.current.abort();
      }
      const controller = new AbortController();
      activeAbortController.current = controller;

      setViewStatus('loading');
      setErrorMessage('');

      try {
        const response = await apiClient.listItems({ ...currentQuery, page: 1 }, controller.signal);
        setItems(response.data);
        setMeta(response.meta);

        if (response.meta.total === 0) {
          if (currentQuery.q || currentQuery.category || currentQuery.status || currentQuery.country || currentQuery.theme) {
            setViewStatus('no-results');
          } else {
            setViewStatus('empty');
          }
        } else {
          setViewStatus('success');
        }

        syncUrlWithQuery(currentQuery);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
          return; // Requisição cancelada por nova digitação
        }
        setViewStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Falha ao conectar com o catálogo');
      }
    },
    [apiClient, syncUrlWithQuery]
  );

  // Carrega a próxima página cumulativa (Infinite Scroll)
  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || meta.page >= meta.totalPages || viewStatus !== 'success') {
      return;
    }

    setIsLoadingMore(true);
    const nextPage = meta.page + 1;

    try {
      const response = await apiClient.listItems({ ...query, page: nextPage });
      setItems((prev) => [...prev, ...response.data]);
      setMeta(response.meta);
    } catch {
      // Ignora erro suavemente para permitir nova tentativa pelo scroll
    } finally {
      setIsLoadingMore(false);
    }
  }, [apiClient, isLoadingMore, meta.page, meta.totalPages, query, viewStatus]);

  // Restaura filtros e posição de rolagem caso o usuário venha de volta dos detalhes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedStateStr = sessionStorage.getItem(STORAGE_KEY);
    if (savedStateStr) {
      try {
        const savedState = JSON.parse(savedStateStr);
        sessionStorage.removeItem(STORAGE_KEY);

        if (savedState.query) {
          setQuery(savedState.query);
          loadInitialItems(savedState.query).then(() => {
            if (savedState.scrollPosition) {
              window.scrollTo(0, savedState.scrollPosition);
            }
          });
          return;
        }
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    // Carregamento inicial padrão caso não haja estado restaurado
    loadInitialItems(query);
  }, []);

  // IntersectionObserver para rolagem infinita automática
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage]);

  // Handlers de interação
  const handleSearch = (searchTerm: string) => {
    const updated = { ...query, q: searchTerm, page: 1 };
    setQuery(updated);
    loadInitialItems(updated);
  };

  const handleSelectCategory = (category?: Category) => {
    const updated = { ...query, category, page: 1 };
    setQuery(updated);
    loadInitialItems(updated);
  };

  const handleSelectStatus = (status?: PublicationStatus) => {
    const updated = { ...query, status, page: 1 };
    setQuery(updated);
    loadInitialItems(updated);
  };

  const handleSelectCountry = (country?: string) => {
    const updated = { ...query, country, page: 1 };
    setQuery(updated);
    loadInitialItems(updated);
  };

  const handleSelectTheme = (theme?: string) => {
    const updated = { ...query, theme, page: 1 };
    setQuery(updated);
    loadInitialItems(updated);
  };

  const handleSelectSortBy = (sortBy?: CatalogSortBy) => {
    const updated = { ...query, sortBy, page: 1 };
    setQuery(updated);
    loadInitialItems(updated);
  };

  const handleClearFilters = () => {
    const reset: CatalogQueryDto = {
      q: '',
      category: undefined,
      status: undefined,
      country: undefined,
      theme: undefined,
      sortBy: 'relevance',
      page: 1,
      limit: 20,
    };
    setQuery(reset);
    loadInitialItems(reset);
  };

  const handleNavigateToDetail = (slug: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          scrollPosition: window.scrollY,
          query,
        })
      );
      window.location.href = `/items/${slug}`;
    }
  };

  const handleQuickAddSuccess = (item: MediaItemSummaryDto) => {
    setLibraryMediaIds((prev) => new Set([...prev, item.id]));
  };

  return (
    <div className="w-full space-y-6">
      {/* Seção Superior: Cabeçalho Editorial e Barra de Busca */}
      <section className="space-y-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[var(--color-text-primary)]">
            Explorar Catálogo
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-1 font-light">
            Doramas, filmes, animes, mangás, manhwas e manhuas em um só lugar.
          </p>
        </div>

        <SearchBar
          value={query.q || ''}
          onChange={handleSearch}
          placeholder="Buscar obras por título, alias ou sinopse..."
        />
      </section>

      {/* Seção de Filtros com Barra Primária e Drawer */}
      <section>
        <FilterBar
          selectedCategory={query.category}
          selectedStatus={query.status}
          selectedCountry={query.country}
          selectedTheme={query.theme}
          sortBy={query.sortBy}
          onSelectCategory={handleSelectCategory}
          onSelectStatus={handleSelectStatus}
          onSelectCountry={handleSelectCountry}
          onSelectTheme={handleSelectTheme}
          onSelectSortBy={handleSelectSortBy}
          onClearFilters={handleClearFilters}
          totalResults={viewStatus === 'success' ? meta.total : undefined}
        />
      </section>

      {/* Grade de Cards ou Feedback de Estados Assíncronos */}
      <section aria-label="Resultados do Catálogo">
        {viewStatus === 'loading' && <MediaGridSkeleton count={12} />}

        {viewStatus === 'empty' && <EmptyState />}

        {viewStatus === 'no-results' && (
          <NoResultsState searchTerm={query.q} onClearFilters={handleClearFilters} />
        )}

        {viewStatus === 'error' && (
          <ErrorState message={errorMessage} onRetry={() => loadInitialItems(query)} />
        )}

        {viewStatus === 'success' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {items.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  isInLibrary={libraryMediaIds.has(item.id)}
                  onNavigate={handleNavigateToDetail}
                  onQuickAdd={handleQuickAddSuccess}
                />
              ))}
            </div>

            {/* Sentinela de Rolagem Infinita */}
            <div ref={sentinelRef} className="py-6 text-center">
              {isLoadingMore && (
                <div className="inline-flex items-center gap-2 text-xs text-accent animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Carregando mais obras...</span>
                </div>
              )}
              {!isLoadingMore && meta.page >= meta.totalPages && meta.total > 0 && (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Você chegou ao fim do catálogo ({meta.total} obras exibidas).
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
