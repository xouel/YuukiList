'use client';

/**
 * YuukiList — Perfil do Usuário (Fase 1 do Módulo de Perfil)
 * Conforme Seção 8 do Documento Mestre de Contexto (P-037, P-038)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth-context.tsx';
import { LibraryApiClient } from '../../services/library-api.client.ts';
import type { LibraryItemDto } from '../../../../../packages/shared/src/index.ts';

const libraryApi = new LibraryApiClient();

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const [libraryItems, setLibraryItems] = useState<LibraryItemDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await libraryApi.list({ limit: 100 });
        setLibraryItems(res.data);
      } catch {
        setLibraryItems([]);
      } finally {
        setIsLoading(false);
      }
    }
    if (!isAuthLoading) {
      loadStats();
    }
  }, [isAuthenticated, isAuthLoading]);

  // Contadores por status
  const totalItems = libraryItems.length;
  const completedCount = libraryItems.filter((i) => i.status === 'COMPLETO').length;
  const inProgressCount = libraryItems.filter(
    (i) => i.status === 'ASSISTINDO' || i.status === 'LENDO'
  ).length;
  const plannedCount = libraryItems.filter(
    (i) => i.status === 'QUERO_ASSISTIR' || i.status === 'QUERO_LER'
  ).length;

  if (isAuthLoading) {
    return (
      <div className="p-8 text-center text-[#94A3B8] animate-pulse">
        Carregando informações do perfil...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-2xl bg-[#101422] border border-[#1E2337] text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-[#181C2B] text-[#06B6D4] flex items-center justify-center mx-auto text-2xl font-bold">
          ?
        </div>
        <h1 className="text-xl font-bold text-white">Perfil não autenticado</h1>
        <p className="text-xs text-[#94A3B8]">
          Entre na sua conta YuukiList para acessar suas estatísticas, biblioteca e preferências.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <a
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-[#06B6D4] text-black font-semibold text-xs hover:bg-[#22D3EE] transition-colors"
          >
            Fazer Login
          </a>
          <a
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-[#181C2B] text-white font-semibold text-xs hover:bg-[#262C3F] transition-colors border border-[#1E2337]"
          >
            Criar Conta
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Cabeçalho do Perfil */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#101422] border border-[#1E2337] flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] text-black flex items-center justify-center font-black text-3xl shadow-lg">
            {user.username.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user.username}</h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">{user.email}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181C2B] border border-[#1E2337] text-[11px] text-[#06B6D4] mt-3 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Membro Ativo YuukiList
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0">
          <a
            href="/library"
            className="px-4 py-2 rounded-xl bg-[#181C2B] hover:bg-[#262C3F] text-xs font-semibold text-white border border-[#1E2337] transition-colors text-center"
          >
            Minha Biblioteca
          </a>
          <button
            onClick={() => logout()}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 border border-red-500/20 transition-colors"
          >
            Sair da Conta
          </button>
        </div>
      </div>

      {/* Resumo da Biblioteca */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          Estatísticas da Minha Coleção
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#101422] border border-[#1E2337] text-center">
            <span className="text-2xl font-black text-white">{isLoading ? '—' : totalItems}</span>
            <p className="text-xs text-[#94A3B8] mt-1 font-medium">Total de Obras</p>
          </div>
          <div className="p-4 rounded-xl bg-[#101422] border border-[#1E2337] text-center">
            <span className="text-2xl font-black text-emerald-400">{isLoading ? '—' : completedCount}</span>
            <p className="text-xs text-[#94A3B8] mt-1 font-medium">Completas</p>
          </div>
          <div className="p-4 rounded-xl bg-[#101422] border border-[#1E2337] text-center">
            <span className="text-2xl font-black text-[#06B6D4]">{isLoading ? '—' : inProgressCount}</span>
            <p className="text-xs text-[#94A3B8] mt-1 font-medium">Em Andamento</p>
          </div>
          <div className="p-4 rounded-xl bg-[#101422] border border-[#1E2337] text-center">
            <span className="text-2xl font-black text-amber-400">{isLoading ? '—' : plannedCount}</span>
            <p className="text-xs text-[#94A3B8] mt-1 font-medium">Planejadas</p>
          </div>
        </div>
      </div>

      {/* Preferências e Privacidade */}
      <div className="p-6 rounded-2xl bg-[#101422] border border-[#1E2337] space-y-4">
        <h3 className="text-sm font-bold text-white">Privacidade &amp; Preferências (LGPD)</h3>
        <p className="text-xs text-[#94A3B8]">
          Seus dados e notas pessoais pertencem exclusivamente a você. A exportação completa e opções de perfil público/privado serão expandidas na fatia R15.
        </p>
      </div>
    </div>
  );
}
