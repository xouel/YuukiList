'use client';

/**
 * YuukiList — Filtros, Abas Inteligentes e Alternador de Layout da Biblioteca
 * Conforme Requisitos: Personal Library View and Layout Toggle & Library Filtering and Asynchronous States
 */

import React from 'react';
import type { Category } from '../../../../../packages/shared/src/index.ts';
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
}

const CATEGORIES: Array<{ key: Category | 'ALL'; label: string }> = [
  { key: 'ALL', label: 'Todas as categorias' },
  { key: 'DORAMA', label: 'Dorama' },
  { key: 'FILME', label: 'Filme' },
  { key: 'ANIME', label: 'Anime' },
  { key: 'MANGA', label: 'Mangá' },
  { key: 'MANHWA', label: 'Manhwa' },
  { key: 'MANHUA', label: 'Manhua' },
];

export function LibraryFilters({
  selectedTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
  layout,
  onLayoutChange,
  countsByTab,
}: LibraryFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Linha Superior: Abas Inteligentes de Status */}
      <div className="flex items-center justify-between gap-4 border-b border-[#262C3F] pb-1 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedTab === tab.key;
            const count = countsByTab ? countsByTab[tab.key] : undefined;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`relative px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#06B6D4] outline-none ${
                  isActive
                    ? 'text-[#06B6D4] font-semibold bg-[#181C2B]'
                    : 'text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#181C2B]/50'
                }`}
              >
                <span>{tab.label}</span>
                {typeof count === 'number' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-[#06B6D4]/20 text-[#06B6D4]'
                        : 'bg-[#262C3F] text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-[-5px] left-2 right-2 h-0.5 bg-[#06B6D4] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Alternador de Layout (Grade / Lista) */}
        <div className="flex items-center gap-1 shrink-0 p-1 rounded-lg bg-[#181C2B] border border-[#262C3F]">
          <button
            type="button"
            onClick={() => onLayoutChange('grid')}
            aria-label="Visualizar em modo grade"
            title="Modo Grade"
            className={`p-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] ${
              layout === 'grid'
                ? 'bg-[#06B6D4] text-[#0B0D13]'
                : 'text-[#94A3B8] hover:text-[#F3F4F6]'
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
            className={`p-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] ${
              layout === 'list'
                ? 'bg-[#06B6D4] text-[#0B0D13]'
                : 'text-[#94A3B8] hover:text-[#F3F4F6]'
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

      {/* Linha Secundária: Filtro por Categoria */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-[#94A3B8] mr-1 hidden sm:inline">Categoria:</span>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onCategoryChange(cat.key)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors border focus-visible:ring-2 focus-visible:ring-[#06B6D4] ${
                  isCatActive
                    ? 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/40 font-semibold'
                    : 'bg-[#181C2B] text-[#94A3B8] border-[#262C3F] hover:text-[#F3F4F6] hover:border-[#38415c]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

