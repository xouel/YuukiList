'use client';

import React, { useState } from 'react';
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

// Taxonomia Desambiguada do Status da Obra
const STATUS_DISPLAY_NAMES: Record<PublicationStatus, string> = {
  EM_ANDAMENTO: 'Em Lançamento',
  FINALIZADA: 'Concluída',
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
  { code: 'BL', name: "Boys' Love (BL)" },
  { code: 'GL', name: "Girls' Love (GL)" },
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
  // Estado do Drawer / Sanfona de Filtros Avançados
  const hasSecondaryFilters = Boolean(
    selectedStatus || selectedCountry || selectedTheme || (sortBy && sortBy !== 'relevance')
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(hasSecondaryFilters);

  const activeSecondaryCount = [
    Boolean(selectedStatus),
    Boolean(selectedCountry),
    Boolean(selectedTheme),
    Boolean(sortBy && sortBy !== 'relevance'),
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(selectedCategory || hasSecondaryFilters);

  return (
    <div className="w-full space-y-3">
      {/* Faixa Primária: Categorias Principais + Botão "Mais Filtros" */}
      <div className="flex items-center justify-between gap-3 pb-1">
        {/* Abas de Categoria com Rolagem Horizontal Suave */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
          role="tablist"
          aria-label="Filtrar por Categoria"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!selectedCategory}
            onClick={() => onSelectCategory(undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-[#E05347] outline-none ${
              !selectedCategory
                ? 'bg-[#E05347] text-white shadow-sm font-semibold'
                : 'bg-[#1A1820] text-[#9C96A2] hover:text-[#F4EFEA] hover:bg-[#25222E] border border-[#2B2735]'
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
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-[#E05347] outline-none ${
                  isSelected
                    ? 'bg-[#E05347] text-white shadow-sm font-semibold'
                    : 'bg-[#1A1820] text-[#9C96A2] hover:text-[#F4EFEA] hover:bg-[#25222E] border border-[#2B2735]'
                }`}
              >
                {CATEGORY_DISPLAY_NAMES[cat]}
              </button>
            );
          })}
        </div>

        {/* Botão de Acionamento do Drawer "Mais Filtros" */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            aria-expanded={isDrawerOpen}
            aria-controls="catalog-advanced-filters"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all focus-visible:ring-2 focus-visible:ring-[#E05347] outline-none ${
              isDrawerOpen || activeSecondaryCount > 0
                ? 'bg-[#25222E] text-[#F4EFEA] border-[#E05347]/50 shadow-sm'
                : 'bg-[#1A1820] text-[#9C96A2] hover:text-[#F4EFEA] hover:bg-[#25222E] border-[#2B2735]'
            }`}
          >
            <svg
              className="w-4 h-4 text-[#E05347]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span>Mais Filtros</span>
            {activeSecondaryCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#E05347] text-white text-[10px] font-bold flex items-center justify-center">
                {activeSecondaryCount}
              </span>
            )}
            <svg
              className={`w-3.5 h-3.5 text-[#9C96A2] transition-transform duration-200 ${
                isDrawerOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Drawer / Painel Deslizante de Filtros Avançados */}
      {isDrawerOpen && (
        <div
          id="catalog-advanced-filters"
          className="p-4 bg-[#16151B] border border-[#2B2735] rounded-xl shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Seletor de País de Origem */}
            <div className="space-y-1">
              <label htmlFor="filter-country" className="block text-xs font-medium text-[#9C96A2]">
                País de Origem
              </label>
              <select
                id="filter-country"
                value={selectedCountry || ''}
                onChange={(e) => onSelectCountry && onSelectCountry(e.target.value || undefined)}
                className="w-full px-3 py-1.5 bg-[#121115] border border-[#2B2735] rounded-lg text-xs sm:text-sm text-[#F4EFEA] focus:border-[#E05347] focus-visible:ring-2 focus-visible:ring-[#E05347] outline-none transition-colors"
              >
                <option value="">Todos os Países</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Status da Obra */}
            <div className="space-y-1">
              <label htmlFor="filter-status" className="block text-xs font-medium text-[#9C96A2]">
                Status da Obra
              </label>
              <select
                id="filter-status"
                value={selectedStatus || ''}
                onChange={(e) =>
                  onSelectStatus(e.target.value ? (e.target.value as PublicationStatus) : undefined)
                }
                className="w-full px-3 py-1.5 bg-[#121115] border border-[#2B2735] rounded-lg text-xs sm:text-sm text-[#F4EFEA] focus:border-[#E05347] focus-visible:ring-2 focus-visible:ring-[#E05347] outline-none transition-colors"
              >
                <option value="">Todos os Status</option>
                {PUBLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_DISPLAY_NAMES[status]}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Temas Transversais (BL/GL) */}
            <div className="space-y-1">
              <label htmlFor="filter-theme" className="block text-xs font-medium text-[#9C96A2]">
                Temas Transversais
              </label>
              <select
                id="filter-theme"
                value={selectedTheme || ''}
                onChange={(e) => onSelectTheme && onSelectTheme(e.target.value || undefined)}
                className="w-full px-3 py-1.5 bg-[#121115] border border-[#2B2735] rounded-lg text-xs sm:text-sm text-[#F4EFEA] focus:border-[#E05347] focus-visible:ring-2 focus-visible:ring-[#E05347] outline-none transition-colors"
              >
                <option value="">Todos os Temas</option>
                {THEMES.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Ordenação */}
            <div className="space-y-1">
              <label htmlFor="filter-sort" className="block text-xs font-medium text-[#9C96A2]">
                Ordenação
              </label>
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => onSelectSortBy(e.target.value as CatalogSortBy)}
                className="w-full px-3 py-1.5 bg-[#121115] border border-[#2B2735] rounded-lg text-xs sm:text-sm text-[#F4EFEA] focus:border-[#E05347] focus-visible:ring-2 focus-visible:ring-[#E05347] outline-none transition-colors"
              >
                <option value="relevance">Mais Relevantes</option>
                <option value="title">Título (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Rodapé do Drawer: Totalizador e Ações */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2B2735] text-xs">
            <div>
              {typeof totalResults === 'number' && (
                <span className="text-[#9C96A2]">
                  {totalResults === 1 ? '1 obra encontrada' : `${totalResults} obras encontradas`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="text-[#E05347] hover:underline focus-visible:ring-2 focus-visible:ring-[#E05347] rounded outline-none font-medium"
                >
                  Limpar filtros
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="text-[#9C96A2] hover:text-[#F4EFEA] transition-colors"
              >
                Recolher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
