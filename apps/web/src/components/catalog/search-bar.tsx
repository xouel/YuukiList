'use client';

import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
}

export function SearchBar({
  value: externalValue,
  onChange,
  debounceMs = 300,
  placeholder = 'Buscar por título, alias ou sinopse (ex.: Parasita, Solo Leveling, Hwanhon)...',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(externalValue);

  // Sincroniza se o valor externo mudar (ex.: via URL ou limpar filtros)
  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  // Aplica o debounce de 300ms antes de emitir onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== externalValue) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, externalValue]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative w-full">
      <label htmlFor="catalog-search" className="sr-only">
        Buscar obras no catálogo
      </label>

      {/* Ícone de Busca */}
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-secondary)]">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <input
        id="catalog-search"
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 bg-surface-raised border border-stroke-subtle focus:border-stroke-accent rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] text-sm sm:text-base transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        autoComplete="off"
      />

      {/* Botão de Limpeza Rápida */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:ring-2 focus-visible:ring-accent rounded outline-none"
          aria-label="Limpar termo de busca"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
