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
  selectedGenre?: string;
  selectedTheme?: string;
  sortBy?: CatalogSortBy;
  onSelectCategory: (category?: Category) => void;
  onSelectStatus: (status?: PublicationStatus) => void;
  onSelectCountry?: (country?: string) => void;
  onSelectGenre?: (genre?: string) => void;
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

export const GENRES = [
  'Ação',
  'Aventura',
  'Comédia',
  'Cotidiano',
  'Crime',
  'Drama',
  'Esporte',
  'Fantasia',
  'Ficção Científica',
  'Mistério',
  'Psicológico',
  'Romance',
  'Sobrenatural',
  'Suspense',
  'Terror',
];

export function FilterBar({
  selectedCategory,
  selectedStatus,
  selectedCountry,
  selectedGenre,
  selectedTheme,
  sortBy = 'relevance',
  onSelectCategory,
  onSelectStatus,
  onSelectCountry,
  onSelectGenre,
  onSelectTheme,
  onSelectSortBy,
  onClearFilters,
  totalResults,
}: FilterBarProps) {
  const currentGenre = selectedGenre || selectedTheme;
  // Estado do Drawer / Sanfona de Filtros Avançados
  const hasSecondaryFilters = Boolean(
    selectedStatus || selectedCountry || currentGenre || (sortBy && sortBy !== 'relevance')
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(hasSecondaryFilters);

  const activeSecondaryCount = [
    Boolean(selectedStatus),
    Boolean(selectedCountry),
    Boolean(currentGenre),
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
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-accent outline-none ${
              !selectedCategory
                ? 'bg-accent text-white shadow-sm font-semibold'
                : 'bg-surface-raised text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-surface-overlay border border-stroke-subtle'
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
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-accent outline-none ${
                  isSelected
                    ? 'bg-accent text-white shadow-sm font-semibold'
                    : 'bg-surface-raised text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-surface-overlay border border-stroke-subtle'
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
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all focus-visible:ring-2 focus-visible:ring-accent outline-none ${
              isDrawerOpen || activeSecondaryCount > 0
                ? 'bg-surface-overlay text-[var(--color-text-primary)] border-stroke-accent shadow-sm'
                : 'bg-surface-raised text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-surface-overlay border-stroke-subtle'
            }`}
          >
            <svg
              className="w-4 h-4 text-accent"
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
              <span className="w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                {activeSecondaryCount}
              </span>
            )}
            <svg
              className={`w-3.5 h-3.5 text-[var(--color-text-secondary)] transition-transform duration-200 ${
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
          className="p-4 bg-surface-raised border border-stroke-subtle rounded-xl shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Seletor de País de Origem */}
            <div className="space-y-1">
              <label htmlFor="filter-country" className="block text-xs font-medium text-[var(--color-text-secondary)]">
                País de Origem
              </label>
              <select
                id="filter-country"
                value={selectedCountry || ''}
                onChange={(e) => onSelectCountry && onSelectCountry(e.target.value || undefined)}
                className="w-full px-3 py-1.5 bg-surface-sunken border border-stroke-subtle rounded-lg text-xs sm:text-sm text-[var(--color-text-primary)] focus:border-stroke-accent focus-visible:ring-2 focus-visible:ring-accent outline-none transition-colors"
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
              <label htmlFor="filter-status" className="block text-xs font-medium text-[var(--color-text-secondary)]">
                Status da Obra
              </label>
              <select
                id="filter-status"
                value={selectedStatus || ''}
                onChange={(e) =>
                  onSelectStatus(e.target.value ? (e.target.value as PublicationStatus) : undefined)
                }
                className="w-full px-3 py-1.5 bg-surface-sunken border border-stroke-subtle rounded-lg text-xs sm:text-sm text-[var(--color-text-primary)] focus:border-stroke-accent focus-visible:ring-2 focus-visible:ring-accent outline-none transition-colors"
              >
                <option value="">Todos os Status</option>
                {PUBLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_DISPLAY_NAMES[status]}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Gênero */}
            <div className="space-y-1">
              <label htmlFor="filter-genre" className="block text-xs font-medium text-[var(--color-text-secondary)]">
                Gênero
              </label>
              <select
                id="filter-genre"
                value={currentGenre || ''}
                onChange={(e) => {
                  const val = e.target.value || undefined;
                  if (onSelectGenre) onSelectGenre(val);
                  if (onSelectTheme) onSelectTheme(val);
                }}
                className="w-full px-3 py-1.5 bg-surface-sunken border border-stroke-subtle rounded-lg text-xs sm:text-sm text-[var(--color-text-primary)] focus:border-stroke-accent focus-visible:ring-2 focus-visible:ring-accent outline-none transition-colors"
              >
                <option value="">Todos os Gêneros</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Ordenação */}
            <div className="space-y-1">
              <label htmlFor="filter-sort" className="block text-xs font-medium text-[var(--color-text-secondary)]">
                Ordenação
              </label>
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => onSelectSortBy(e.target.value as CatalogSortBy)}
                className="w-full px-3 py-1.5 bg-surface-sunken border border-stroke-subtle rounded-lg text-xs sm:text-sm text-[var(--color-text-primary)] focus:border-stroke-accent focus-visible:ring-2 focus-visible:ring-accent outline-none transition-colors"
              >
                <option value="relevance">Mais Relevantes</option>
                <option value="title">Título (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Rodapé do Drawer: Totalizador e Ações */}
          <div className="flex items-center justify-between pt-2 border-t border-stroke-subtle text-xs">
            <div>
              {typeof totalResults === 'number' && (
                <span className="text-[var(--color-text-secondary)]">
                  {totalResults === 1 ? '1 obra encontrada' : `${totalResults} obras encontradas`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent rounded outline-none font-medium"
                >
                  Limpar filtros
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors focus-visible:ring-2 focus-visible:ring-accent rounded outline-none"
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
