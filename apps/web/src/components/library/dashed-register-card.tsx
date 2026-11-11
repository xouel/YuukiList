'use client';

/**
 * YuukiList — Card Pontilhado: Registrar Nova Obra
 * Conforme Requisito: Personal Library View and Layout Toggle (R24)
 */

import React from 'react';
import Link from 'next/link';

export function DashedRegisterCard() {
  return (
    <div className="relative rounded-xl border-2 border-dashed border-[#2B2735] hover:border-[#9D8DF1]/60 bg-[#1A1820]/40 hover:bg-[#1A1820]/70 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 group min-h-[340px]">
      {/* Ícone Central */}
      <div className="w-12 h-12 rounded-xl bg-[#2B2735]/80 group-hover:bg-[#9D8DF1]/20 border border-[#2B2735] group-hover:border-[#9D8DF1]/40 flex items-center justify-center text-[#9C96A2] group-hover:text-[#9D8DF1] transition-all mb-4">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>

      <h3 className="font-serif text-lg font-medium text-[#F4EFEA] mb-1">
        Registrar Nova Obra
      </h3>
      <p className="text-xs text-[#9C96A2] font-light max-w-xs mb-5 leading-relaxed">
        Busque por títulos na API e importe diretamente para seu diário de consumo.
      </p>

      <Link
        href="/explore"
        className="min-h-[44px] px-4 py-2 rounded-xl bg-[#2B2735] hover:bg-[#9D8DF1] text-xs font-semibold text-[#F4EFEA] hover:text-black transition-all shadow-sm flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#9D8DF1]"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Pesquisa Global</span>
      </Link>
    </div>
  );
}

