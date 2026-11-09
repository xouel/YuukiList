'use client';

import React from 'react';
import {
  CATEGORIES,
  PUBLICATION_STATUSES,
  type Category,
  type PublicationStatus,
  type CatalogSortBy,
} from '../../../../../packages/shared/src/index.ts';

export interface FilterBarProps {
  selectedCategory?: Category;
  selectedStatus?: PublicationStatus;
  selectedCountry?: string;
  selectedTheme?: string;
  sortBy?: CatalogSortBy;
  onSelectCategory: (category?: Category) => void;
  onSelectStatus: (status?: PublicationStatus) => void;
  onSelectCountry?: (country?: string) => void;
  onSelectTheme?: (theme?: string) => void;
  onSelectSortBy: (sortBy?: CatalogSortBy) => void;
  onClearFilters: () => void;
  totalResults?: number;
}

const CATEGORY_DISPLAY_NAMES: Record<Category, string> = {
  DORAMA: 'Doramas',
  FILME: 'Filmes',
  ANIME: 'Animes',
  MANGA: 'Mangás',
  MANHWA: 'Manhwas',
  MANHUA: 'Manhuas',
};

const STATUS_DISPLAY_NAMES: Record<PublicationStatus, string> = {
  EM_ANDAMENTO: 'Em Andamento',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
  HIATO: 'Hiato',
  DESCONHECIDA: 'Desconhecida',
};

const COUNTRIES = [
  { code: 'KR', name: 'Coreia do Sul (KR)' },
  { code: 'JP', name: 'Japão (JP)' },
  { code: 'CN', name: 'China (CN)' },
  { code: 'TH', name: 'Tailândia (TH)' },
  { code: 'TW', name: 'Taiwan (TW)' },
];

const THEMES = [
  { code: 'BL', name: 'Boys\' Love (BL)' },
  { code: 'GL', name: 'Girls\' Love (GL)' },
];

export function FilterBar({
  selectedCategory,
  selectedStatus,
  selectedCountry,
  selectedTheme,
  sortBy = 'relevance',
  onSelectCategory,
  onSelectStatus,
  onSelectCountry,
  onSelectTheme,
  onSelectSortBy,
  onClearFilters,
  totalResults,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(
    selectedCategory || selectedStatus || selectedCountry || selectedTheme || sortBy === 'title'
  );

  return (
    <div className="w-full space-y-4">
      {/* Linha 1: Abas/Pills de Categorias Canônicas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Filtrar por Categoria">
        <button
          type="button"
          role="tab"
          aria-selected={!selectedCategory}
          onClick={() => onSelectCategory(undefined)}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] outline-none ${
            !selectedCategory
              ? 'bg-[#06B6D4] text-[#0B0D13] font-semibold'
              : 'bg-[#181C2B] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1F2438] border border-[#262C3F]'
          }`}
        >
          Todas as Categorias
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectCategory(isSelected ? undefined : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] outline-none ${
                isSelected
                  ? 'bg-[#06B6D4] text-[#0B0D13] font-semibold'
                  : 'bg-[#181C2B] text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1F2438] border border-[#262C3F]'
              }`}
            >
              {CATEGORY_DISPLAY_NAMES[cat]}
            </button>
          );
        })}
      </div>

      {/* Linha 2: Dropdowns de Filtros (País, Tema, Status, Ordenação) + Totalizador */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#262C3F]/50">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de País de Origem */}
          <div className="relative">
            <label htmlFor="filter-country" className="sr-only">
              Filtrar por País de Origem
            </label>
            <select
              id="filter-country"
              value={selectedCountry || ''}
              onChange={(e) => onSelectCountry && onSelectCountry(e.target.value || undefined)}
              className="px-3 py-1.5 bg-[#121520] border border-[#262C3F] rounded-lg text-xs sm:text-sm text-[#F3F4F6] focus:border-[#06B6D4] focus-visible:ring-2 focus-visible:ring-[#06B6D4] outline-none transition-colors"
            >
              <option value="">Todos os Países</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Temas Transversais (BL/GL) */}
          <div className="relative">
            <label htmlFor="filter-theme" className="sr-only">
              Filtrar por Temas Transversais
            </label>
            <select
              id="filter-theme"
              value={selectedTheme || ''}
              onChange={(e) => onSelectTheme && onSelectTheme(e.target.value || undefined)}
              className="px-3 py-1.5 bg-[#121520] border border-[#262C3F] rounded-lg text-xs sm:text-sm text-[#F3F4F6] focus:border-[#06B6D4] focus-visible:ring-2 focus-visible:ring-[#06B6D4] outline-none transition-colors"
            >
              <option value="">Todos os Temas</option>
              {THEMES.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Status */}
          <div className="relative">
            <label htmlFor="filter-status" className="sr-only">
              Filtrar por Status de Publicação
            </label>
            <select
              id="filter-status"
              value={selectedStatus || ''}
              onChange={(e) => onSelectStatus(e.target.value ? (e.target.value as PublicationStatus) : undefined)}
              className="px-3 py-1.5 bg-[#121520] border border-[#262C3F] rounded-lg text-xs sm:text-sm text-[#F3F4F6] focus:border-[#06B6D4] focus-visible:ring-2 focus-visible:ring-[#06B6D4] outline-none transition-colors"
            >
              <option value="">Todos os Status</option>
              {PUBLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_DISPLAY_NAMES[status]}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Ordenação */}
          <div className="relative">
            <label htmlFor="filter-sort" className="sr-only">
              Ordenar Resultados
            </label>
            <select
              id="filter-sort"
              value={sortBy}
              onChange={(e) => onSelectSortBy(e.target.value as CatalogSortBy)}
              className="px-3 py-1.5 bg-[#121520] border border-[#262C3F] rounded-lg text-xs sm:text-sm text-[#F3F4F6] focus:border-[#06B6D4] focus-visible:ring-2 focus-visible:ring-[#06B6D4] outline-none transition-colors"
            >
              <option value="relevance">Mais Relevantes</option>
              <option value="title">Título (A-Z)</option>
            </select>
          </div>

          {/* Botão Limpar Filtros */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-2.5 py-1 text-xs text-[#06B6D4] hover:text-[#06B6D4]/80 hover:underline focus-visible:ring-2 focus-visible:ring-[#06B6D4] rounded outline-none"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Totalizador */}
        {typeof totalResults === 'number' && (
          <div className="text-xs text-[#9CA3AF]">
            {totalResults === 1 ? '1 obra encontrada' : `${totalResults} obras encontradas`}
          </div>
        )}
      </div>
    </div>
  );
}
