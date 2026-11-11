'use client';

/**
 * YuukiList — Filtros, Abas Inteligentes e Alternador de Layout da Biblioteca
 * Conforme Requisitos: Personal Library View and Layout Toggle & Library Filtering and Asynchronous States
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
  sortBy: LibrarySortBy;
  onSortByChange: (sort: LibrarySortBy) => void;
  isFavoriteOnly: boolean;
  onToggleFavoriteOnly: () => void;
}

const CATEGORIES: Array<{ key: Category | 'ALL'; label: string }> = [
  { key: 'ALL', label: 'Todas as categorias' },
  { key: 'DORAMA', label: 'Doramas' },
  { key: 'FILME', label: 'Filmes' },
  { key: 'ANIME', label: 'Animes' },
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
  sortBy,
  onSortByChange,
  isFavoriteOnly,
  onToggleFavoriteOnly,
}: LibraryFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Linha Superior: Abas Inteligentes de Status em Estilo Pílula */}
      <div className="flex items-center justify-between gap-4 border-b border-[#2B2735] pb-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedTab === tab.key;
            const count = countsByTab ? countsByTab[tab.key] : undefined;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#E05347] outline-none ${
                  isActive
                    ? 'bg-[#E05347] text-white shadow-sm font-semibold'
                    : 'bg-[#1A1820] text-[#9C96A2] hover:text-[#F4EFEA] hover:bg-[#25222E] border border-[#2B2735]'
                }`}
              >
                <span>{tab.label}</span>
                {typeof count === 'number' && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-black/30 text-white'
                        : 'bg-[#2B2735] text-[#9C96A2]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Alternador de Layout (Grade / Lista) */}
        <div className="flex items-center gap-1 shrink-0 p-1 rounded-xl bg-[#1A1820] border border-[#2B2735]">
          <button
            type="button"
            onClick={() => onLayoutChange('grid')}
            aria-label="Visualizar em modo grade"
            title="Modo Grade"
            className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#E05347] ${
              layout === 'grid'
                ? 'bg-[#E05347] text-white'
                : 'text-[#9C96A2] hover:text-[#F4EFEA]'
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
            className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#E05347] ${
              layout === 'list'
                ? 'bg-[#E05347] text-white'
                : 'text-[#9C96A2] hover:text-[#F4EFEA]'
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

      {/* Linha Secundária: Filtro por Categoria, Filtro de Favoritos e Ordenação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Chips de Categoria */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-[#9C96A2] mr-1 hidden sm:inline">Categorias:</span>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {CATEGORIES.map((cat) => {
              const isCatActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => onCategoryChange(cat.key)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors border focus-visible:ring-2 focus-visible:ring-[#E05347] ${
                    isCatActive
                      ? 'bg-[#E05347]/15 text-[#E05347] border-[#E05347]/40 font-semibold'
                      : 'bg-[#1A1820] text-[#9C96A2] border-[#2B2735] hover:text-[#F4EFEA] hover:bg-[#25222E]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controles de Favoritos e Ordenação */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
          {/* Filtro Rápido de Favoritos */}
          <button
            type="button"
            onClick={onToggleFavoriteOnly}
            aria-pressed={isFavoriteOnly}
            className={`text-xs px-2.5 py-1 rounded-lg transition-colors border flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#E05347] ${
              isFavoriteOnly
                ? 'bg-[#E05347]/20 text-[#E05347] border-[#E05347]/50 font-semibold shadow-sm'
                : 'bg-[#1A1820] text-[#9C96A2] border-[#2B2735] hover:text-[#F4EFEA] hover:bg-[#25222E]'
            }`}
          >
            <span className={isFavoriteOnly ? 'text-[#E05347]' : 'text-[#9C96A2]'}>♥</span>
            <span>Favoritos</span>
          </button>

          {/* Seletor Canônico de Ordenação */}
          <div className="flex items-center gap-1.5 text-xs text-[#9C96A2]">
            <label htmlFor="library-sort-select" className="sr-only sm:not-sr-only">
              Ordenar:
            </label>
            <select
              id="library-sort-select"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as LibrarySortBy)}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#16151B] border border-[#2B2735] text-[#F4EFEA] focus:border-[#E05347] focus:ring-1 focus:ring-[#E05347] outline-none cursor-pointer"
            >
              <option value="updatedAt">Atualização recente</option>
              <option value="createdAt">Data de adição</option>
              <option value="title">Título (A-Z)</option>
              <option value="progress">Progresso</option>
              <option value="rating">Avaliação (Maior)</option>
              <option value="releaseYear">Ano de lançamento</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
