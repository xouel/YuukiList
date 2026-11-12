'use client';

/**
 * YuukiList — Filtros, Abas Inteligentes, Busca Local e Alternador de Layout
 * Conforme Requisitos: Personal Library View and Layout Toggle & Library Filtering and Asynchronous States (R32)
 */

import React from 'react';
import type { Category, LibrarySortBy } from '../../../../../packages/shared/src/index.ts';
import {
  type LibraryLayoutMode,
  type StatusTabKey,
  STATUS_TABS,
} from './library-helpers.ts';

export interface LibraryFiltersProps {
  selectedTab: StatusTabKey;
  onTabChange: (tab: StatusTabKey) => void;
  selectedCategory: Category | 'ALL';
  onCategoryChange: (category: Category | 'ALL') => void;
  layout: LibraryLayoutMode;
  onLayoutChange: (layout: LibraryLayoutMode) => void;
  countsByTab?: Record<StatusTabKey, number>;
  countsByCategory?: Record<Category | 'ALL', number>;
  sortBy: LibrarySortBy;
  onSortByChange: (sort: LibrarySortBy) => void;
  isFavoriteOnly: boolean;
  onToggleFavoriteOnly: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

const CATEGORIES: Array<{ key: Category | 'ALL'; label: string }> = [
  { key: 'ALL', label: 'Todas as Categorias' },
  { key: 'ANIME', label: 'Animes' },
  { key: 'DORAMA', label: 'Doramas' },
  { key: 'FILME', label: 'Filmes' },
  { key: 'MANGA', label: 'Mangás' },
  { key: 'MANHWA', label: 'Manhwas' },
  { key: 'MANHUA', label: 'Manhuas' },
];

export function LibraryFilters({
  selectedTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
  layout,
  onLayoutChange,
  countsByTab,
  countsByCategory,
  sortBy,
  onSortByChange,
  isFavoriteOnly,
  onToggleFavoriteOnly,
  searchQuery = '',
  onSearchQueryChange,
}: LibraryFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Linha 1: Abas Editoriais Limpas de Status */}
      <div className="flex items-center justify-between gap-4 border-b border-stroke-subtle pb-0 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6 shrink-0" role="tablist">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedTab === tab.key;
            const count = countsByTab ? countsByTab[tab.key] : undefined;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.key)}
                className={`pb-3 text-xs sm:text-sm transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent border-b-2 -mb-[1px] cursor-pointer ${
                  isActive
                    ? 'border-accent text-[var(--color-text-primary)] font-bold'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium'
                }`}
              >
                <span>{tab.label}</span>
                {typeof count === 'number' && (
                  <span
                    className={`text-[11px] tabular-nums font-normal ${
                      isActive ? 'text-accent' : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filtro Rápido de Favoritos */}
        <button
          type="button"
          onClick={onToggleFavoriteOnly}
          aria-pressed={isFavoriteOnly}
          className={`text-xs pb-3 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer border-b-2 -mb-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isFavoriteOnly
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <svg className={`w-3.5 h-3.5 ${isFavoriteOnly ? 'text-accent fill-accent' : 'text-[var(--color-text-secondary)]'}`} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>Favoritos</span>
        </button>
      </div>

      {/* Linha 2: Seletor Plano de Categorias */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isCatActive = selectedCategory === cat.key;
          const count = countsByCategory ? countsByCategory[cat.key] : undefined;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onCategoryChange(cat.key)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent ${
                isCatActive
                  ? 'bg-surface-overlay text-[var(--color-text-primary)] font-semibold border border-stroke-subtle'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-surface-raised'
              }`}
            >
              <span>{cat.label}</span>
              {typeof count === 'number' && count > 0 && (
                <span className="text-[10px] tabular-nums text-[var(--color-text-muted)]">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Linha 3: Barra de Busca Local, Ordenação e Alternador de Modo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Campo de Busca Local Textual */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-secondary)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange && onSearchQueryChange(e.target.value)}
            placeholder="Filtrar nesta lista..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-surface-raised border border-stroke-subtle text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/60 focus:outline-none focus:border-stroke-accent focus:ring-1 focus:ring-accent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange && onSearchQueryChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              aria-label="Limpar filtro de busca"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Controles de Ordenação e Layout */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {/* Seletor Canônico de Ordenação */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <label htmlFor="library-sort-select" className="text-[10px] uppercase font-bold tracking-wider">
              ORDENAR:
            </label>
            <select
              id="library-sort-select"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as LibrarySortBy)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-surface-raised border border-stroke-subtle text-[var(--color-text-primary)] focus:border-stroke-accent focus:ring-1 focus:ring-accent outline-none cursor-pointer"
            >
              <option value="updatedAt">Última atualização</option>
              <option value="createdAt">Data de adição</option>
              <option value="title">Título (A-Z)</option>
              <option value="progress">Progresso</option>
              <option value="rating">Avaliação (Maior)</option>
              <option value="releaseYear">Ano de lançamento</option>
            </select>
          </div>

          {/* Alternador de Layout (Grade / Lista) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-raised border border-stroke-subtle">
            <button
              type="button"
              onClick={() => onLayoutChange('grid')}
              aria-label="Visualizar em modo grade"
              title="Modo Grade"
              className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                layout === 'grid'
                  ? 'bg-accent text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange('list')}
              aria-label="Visualizar em modo lista"
              title="Modo Lista"
              className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                layout === 'list'
                  ? 'bg-accent text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
