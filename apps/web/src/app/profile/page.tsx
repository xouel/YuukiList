'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import type { ProfileStatsDto } from '@yuukilist/shared';
import { profileApiClient } from '@/services/profile-api.client';
import { ProfileStats } from '@/components/profile/profile-stats';
import { FavoritesShowcase } from '@/components/profile/favorites-showcase';
import { ShareDialog } from '@/components/profile/share-dialog';
import { DeleteAccountDialog } from '@/components/profile/delete-account-dialog';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const [stats, setStats] = useState<ProfileStatsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await profileApiClient.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar estatísticas do perfil');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated) {
        loadProfile();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, isAuthLoading, loadProfile]);

  const handleExportJson = async () => {
    setExporting('JSON');
    try {
      const blob = await profileApiClient.exportJson();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yuukilist-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao exportar dados em JSON');
    } finally {
      setExporting(null);
    }
  };

  const handleExportCsv = async () => {
    setExporting('CSV');
    try {
      const blob = await profileApiClient.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yuukilist-library-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao exportar biblioteca em CSV');
    } finally {
      setExporting(null);
    }
  };

  if (isAuthLoading || loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-zinc-400 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#E05347]/20 border-t-[#E05347] animate-spin" />
        <p className="text-sm font-medium">Carregando perfil e acervo...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-4xl block text-zinc-600">🔒</span>
        <h1 className="text-2xl font-serif font-bold text-[#F4EFEA]">Acesso Restrito</h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Você precisa estar conectado à sua conta para visualizar seu perfil, estatísticas e opções de compartilhamento.
        </p>
        <div className="pt-2">
          <a
            href="/login?redirect=/profile"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#E05347] hover:bg-[#E05347]/90 text-white transition-colors cursor-pointer shadow-sm"
          >
            Entrar no YuukiList
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* 1. Cabeçalho Editorial do Perfil */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-2xl bg-[#1A1820] border border-[#2B2735] shadow-lg">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar Monograma Editorial */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#24202C] border-2 border-[#E05347]/60 flex items-center justify-center text-2xl sm:text-3xl font-serif font-bold text-[#E05347] shadow-inner">
            {stats?.username ? stats.username.charAt(0).toUpperCase() : 'Y'}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#F4EFEA] tracking-tight">
              {stats?.username || user?.username}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Membro desde{' '}
              {stats?.joinedAt
                ? new Date(stats.joinedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                : '2026'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-[#24202C] hover:bg-[#2F2A3A] text-[#F4EFEA] border border-[#2B2735] hover:border-[#3B3647] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Compartilhar Perfil</span>
          </button>
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#24202C] hover:bg-[#2F2A3A] text-zinc-400 hover:text-zinc-200 border border-[#2B2735] transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      </section>

      {/* 2. Vitrine de Favoritos (Inversão Hierárquica: Topo) */}
      {stats && <FavoritesShowcase favorites={stats.favorites} />}

      {/* 3. Estatísticas & Métricas de Consumo (Painel Compacto) */}
      {stats && <ProfileStats stats={stats} />}

      {/* 4. Soberania de Dados e LGPD */}
      <section className="p-6 rounded-2xl bg-[#1A1820] border border-[#2B2735] space-y-6">
        <div>
          <h2 className="text-base font-serif font-bold text-[#F4EFEA] flex items-center gap-2">
            <span>🛡️</span> Soberania de Dados & LGPD
          </h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Seus dados pertencem exclusivamente a você. Exporte seus registros em formatos abertos ou exerça seu direito de exclusão definitiva.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#24202C] border border-[#2B2735] space-y-2.5">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Portabilidade de Dados
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Faça o download de todos os seus registros de biblioteca, notas do diário e preferências da conta.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportJson}
                disabled={!!exporting}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1A1820] hover:bg-[#221E2A] text-zinc-200 border border-[#2B2735] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {exporting === 'JSON' ? 'Baixando...' : 'Exportar JSON'}
              </button>
              <button
                onClick={handleExportCsv}
                disabled={!!exporting}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1A1820] hover:bg-[#221E2A] text-zinc-200 border border-[#2B2735] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {exporting === 'CSV' ? 'Baixando...' : 'Exportar CSV'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 space-y-2.5">
            <h3 className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              Exclusão Definitiva
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Elimine permanentemente sua conta, biblioteca, anotações de diário e links compartilhados.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer"
              >
                Excluir Conta...
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modais */}
      <ShareDialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      <DeleteAccountDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} />
    </main>
  );
}
