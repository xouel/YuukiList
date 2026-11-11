'use client';

/**
 * YuukiList — Popover de Avaliação Rápida Inline (1 a 10 Estrelas)
 * Conforme Requisito: Quick Progress Tracking and Detail Modal (R24)
 */

import React, { useState, useRef, useEffect } from 'react';

interface QuickRatingPopoverProps {
  currentRating?: number | null;
  onSelectRating: (rating: number) => void;
  disabled?: boolean;
}

export function QuickRatingPopover({
  currentRating,
  onSelectRating,
  disabled = false,
}: QuickRatingPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fecha o popover ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRatingClick = (rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectRating(rating);
    setIsOpen(false);
  };

  const formattedRating = currentRating && currentRating > 0 ? currentRating.toFixed(1) : '-';

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Botão Gatilho no Card */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={`Alterar nota. Nota atual: ${formattedRating}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="min-h-[36px] px-2.5 py-1 rounded-lg bg-[#2B2735]/60 hover:bg-[#2B2735] text-xs font-semibold text-[#F4EFEA] border border-[#2B2735] hover:border-[#9D8DF1]/50 transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#9D8DF1] disabled:opacity-50"
      >
        <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>{formattedRating}</span>
        <svg className="w-2.5 h-2.5 text-[#9C96A2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover Flutuante */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Selecionar avaliação de 1 a 10"
          className="absolute bottom-full left-0 mb-2 z-50 p-2.5 rounded-xl bg-[#1A1820] border border-[#2B2735] shadow-2xl shadow-black/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 w-56"
        >
          <div className="text-[11px] font-semibold text-[#9C96A2] uppercase tracking-wider mb-2 px-1">
            Sua Avaliação (1 a 10)
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
              const isSelected = currentRating === star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={(e) => handleRatingClick(star, e)}
                  className={`min-h-[36px] py-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-[#2B2735]/70 hover:bg-[#2B2735] text-[#F4EFEA] hover:text-amber-400'
                  }`}
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{star}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

