'use client';

/**
 * YuukiList — Esqueletos de Carregamento da Biblioteca (Grade e Lista)
 * Conforme Requisito: Library Filtering and Asynchronous States
 */

import React from 'react';
import type { LibraryLayoutMode } from './library-helpers.ts';

export interface LibrarySkeletonProps {
  layout: LibraryLayoutMode;
  count?: number;
}

export function LibrarySkeleton({ layout, count = 8 }: LibrarySkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (layout === 'list') {
    return (
      <div className="space-y-3" role="status" aria-label="Carregando biblioteca">
        {items.map((key) => (
          <div
            key={key}
            className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#181C2B] border border-[#262C3F] animate-pulse"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {/* Miniatura */}
              <div className="w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-lg bg-[#262C3F]" />
              <div className="space-y-2 flex-1 max-w-sm">
                <div className="flex gap-2">
                  <div className="w-14 h-4 bg-[#262C3F] rounded" />
                  <div className="w-20 h-4 bg-[#262C3F] rounded" />
                </div>
                <div className="w-3/4 h-5 bg-[#262C3F] rounded" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-4 bg-[#262C3F] rounded" />
              <div className="w-8 h-8 bg-[#262C3F] rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
      role="status"
      aria-label="Carregando biblioteca"
    >
      {items.map((key) => (
        <div
          key={key}
          className="bg-[#181C2B] rounded-xl overflow-hidden border border-[#262C3F] animate-pulse flex flex-col h-full"
        >
          {/* Capa 2:3 */}
          <div className="aspect-[2/3] w-full bg-[#262C3F]" />
          <div className="p-3.5 space-y-2.5">
            <div className="w-3/4 h-4 bg-[#262C3F] rounded" />
            <div className="w-1/2 h-3 bg-[#262C3F] rounded" />
            <div className="pt-2 border-t border-[#262C3F]/60 flex justify-between items-center">
              <div className="w-14 h-3 bg-[#262C3F] rounded" />
              <div className="w-8 h-5 bg-[#262C3F] rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

