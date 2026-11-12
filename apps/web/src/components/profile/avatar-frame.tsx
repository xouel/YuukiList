'use client';

import React from 'react';
import type { AvatarFrameType } from '../../../../../packages/shared/src/index.ts';

interface AvatarFrameProps {
  frame?: AvatarFrameType | string | null;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24 sm:w-28 sm:h-28',
};

export const AVATAR_FRAMES: Array<{
  id: AvatarFrameType;
  name: string;
  description: string;
}> = [
  { id: 'none', name: 'Nenhuma', description: 'Sem moldura decorativa' },
  { id: 'nanquim', name: 'Nanquim Puro', description: 'Bordas de tinta nanquim com cantos geométricos' },
  { id: 'carmim', name: 'Carmim Imperial', description: 'Laqueado carmim vibrante com brilho sutil' },
  { id: 'ouro', name: 'Ouro Antigo', description: 'Acabamento metálico dourado com pátina editorial' },
  { id: 'sakura', name: 'Sakura Suave', description: 'Filete delicado em tom pétala com aura suave' },
];

export function AvatarFrame({
  frame = 'none',
  children,
  size = 'lg',
  className = '',
}: AvatarFrameProps) {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.lg;
  const currentFrame = frame || 'none';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClass} ${className}`}>
      {/* Moldura Nanquim Puro */}
      {currentFrame === 'nanquim' && (
        <svg
          className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none text-zinc-400 z-10"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3" />
          <circle cx="50" cy="50" r="49" stroke="#121115" strokeWidth="1.5" />
          {/* 4 marcas geométricas nos cantos */}
          <path d="M48 2h4M48 98h4M2 48v4M98 48v4" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      )}

      {/* Moldura Carmim Imperial */}
      {currentFrame === 'carmim' && (
        <div className="absolute -inset-1 rounded-full border-2 border-[#E05347] shadow-[0_0_12px_rgba(224,83,71,0.4)] pointer-events-none z-10 animate-pulse" />
      )}

      {/* Moldura Ouro Antigo */}
      {currentFrame === 'ouro' && (
        <svg
          className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none z-10 text-amber-400"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="43" stroke="#D97706" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      )}

      {/* Moldura Sakura Suave */}
      {currentFrame === 'sakura' && (
        <div className="absolute -inset-1 rounded-full border-2 border-rose-300/90 shadow-[0_0_12px_rgba(244,114,182,0.35)] pointer-events-none z-10" />
      )}

      {/* Conteúdo interno (Avatar com clipping circular) */}
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-surface-raised border border-stroke-subtle">
        {children}
      </div>
    </div>
  );
}

