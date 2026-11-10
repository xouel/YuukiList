'use client';

/**
 * YuukiList — Componente de Proteção Visual Anti-Spoiler com Revelação sob Demanda
 * Conforme Requisito: Spoiler Warning Mask and One-Click Reveal
 */

import React, { useState } from 'react';

export interface SpoilerMaskProps {
  children: React.ReactNode;
  isMaskedDefault?: boolean;
  label?: string;
  onReveal?: () => void;
}

export function SpoilerMask({
  children,
  isMaskedDefault = true,
  label = 'Contém Spoiler',
  onReveal,
}: SpoilerMaskProps) {
  const [isRevealed, setIsRevealed] = useState<boolean>(!isMaskedDefault);

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevealed(true);
    if (onReveal) {
      onReveal();
    }
  };

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevealed(false);
  };

  if (isRevealed) {
    return (
      <div className="relative group/spoiler">
        <div className="transition-all duration-300">
          {children}
        </div>
        {isMaskedDefault && (
          <div className="mt-1 flex items-center justify-end">
            <button
              type="button"
              onClick={handleHide}
              className="text-[10px] text-[#94A3B8] hover:text-[#F3F4F6] underline decoration-dotted"
            >
              Ocultar spoiler
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden border border-amber-500/30 bg-amber-950/20 p-3 select-none"
      role="region"
      aria-label="Conteúdo protegido contra spoilers"
    >
      {/* Texto com Borrão Seguro */}
      <div
        className="filter blur-[7px] pointer-events-none opacity-40 transition-all select-none"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Camada Sobreposta de Bloqueio e Revelação */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-black/60 backdrop-blur-[2px] text-center z-10">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-2">
          <span>⚠️</span>
          <span>{label}</span>
        </div>
        <button
          type="button"
          onClick={handleReveal}
          aria-label="Revelar conteúdo com spoiler"
          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 active:scale-95 transition-all shadow-md focus-visible:ring-2 focus-visible:ring-amber-400 outline-none"
        >
          Revelar spoiler
        </button>
      </div>
    </div>
  );
}

