'use client';

import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = 'Catálogo Vazio',
  message = 'Ainda não há obras cadastradas nesta seção.',
}: EmptyStateProps) {
  return (
    <div className="py-16 px-4 text-center border border-dashed border-[#262C3F] rounded-2xl bg-[#121520]/40 max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-[#181C2B] border border-[#262C3F] flex items-center justify-center mx-auto mb-4 text-[#9CA3AF]">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#F3F4F6]">{title}</h3>
      <p className="text-sm text-[#9CA3AF] mt-1 max-w-sm mx-auto">{message}</p>
    </div>
  );
}

interface NoResultsStateProps {
  searchTerm?: string;
  onClearFilters: () => void;
}

export function NoResultsState({ searchTerm, onClearFilters }: NoResultsStateProps) {
  return (
    <div className="py-16 px-4 text-center border border-dashed border-[#262C3F] rounded-2xl bg-[#121520]/50 max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-[#181C2B] border border-[#262C3F] flex items-center justify-center mx-auto mb-4 text-[#06B6D4]">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#F3F4F6]">Nenhuma obra encontrada</h3>
      <p className="text-sm text-[#9CA3AF] mt-1.5 max-w-sm mx-auto">
        {searchTerm
          ? `Não encontramos resultados para "${searchTerm}". Tente verificar a ortografia ou limpar os filtros ativos.`
          : 'Nenhuma obra corresponde aos filtros combinados selecionados.'}
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0B0D13] bg-[#06B6D4] hover:bg-[#06B6D4]/90 active:bg-[#06B6D4]/80 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#06B6D4] focus-visible:outline-none"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = 'Ocorreu uma falha ao conectar com a API de catálogo.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="py-12 px-4 text-center border border-rose-900/40 rounded-2xl bg-rose-950/20 max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-rose-950/50 border border-rose-800 flex items-center justify-center mx-auto mb-4 text-rose-400">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#F3F4F6]">Falha no carregamento</h3>
      <p className="text-sm text-[#9CA3AF] mt-1.5 max-w-sm mx-auto">{message}</p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#F3F4F6] bg-[#262C3F] hover:bg-[#323950] active:bg-[#1F2438] border border-[#3A4259] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] focus-visible:outline-none"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
