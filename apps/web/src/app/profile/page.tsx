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
      <main className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-zinc-400 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <p className="text-sm font-medium">Carregando perfil e estatísticas...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-4xl block text-zinc-600">🔒</span>
        <h1 className="text-xl font-bold text-zinc-200">Acesso Restrito</h1>
        <p className="text-xs text-zinc-400">
          Você precisa estar conectado à sua conta para visualizar seu perfil, estatísticas e opções de compartilhamento.
        </p>
        <a
          href="/login?redirect=/profile"
          className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-colors"
        >
          Entrar no YuukiList
        </a>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-10 animate-fadeIn">
      {/* 1. Cabeçalho do Perfil */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-violet-500 flex items-center justify-center text-2xl sm:text-3xl font-black text-zinc-950 shadow-lg">
            {stats?.username ? stats.username.charAt(0).toUpperCase() : 'Y'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
              {stats?.username || user?.username}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Membro desde{' '}
              {stats?.joinedAt
                ? new Date(stats.joinedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                : '2026'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                Colecionador
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                Privacidade Ativa
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>🔗</span> Compartilhar Perfil
          </button>
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </section>

      {/* 2. Estatísticas Analíticas */}
      {stats && <ProfileStats stats={stats} />}

      {/* 3. Vitrine de Favoritos */}
      {stats && <FavoritesShowcase favorites={stats.favorites} />}

      {/* 4. Soberania de Dados e LGPD */}
      <section className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-6">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span>🛡️</span> Soberania de Dados & LGPD
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Seus dados pertencem exclusivamente a você. Exporte seus registros em formatos abertos ou exerça seu direito de exclusão definitiva.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-850/40 border border-zinc-800/80 space-y-2.5">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Portabilidade de Dados
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Faça o download de todos os seus registros de biblioteca, notas do diário e preferências da conta.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportJson}
                disabled={!!exporting}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 transition-colors disabled:opacity-50"
              >
                {exporting === 'JSON' ? 'Baixando...' : 'Exportar JSON'}
              </button>
              <button
                onClick={handleExportCsv}
                disabled={!!exporting}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 transition-colors disabled:opacity-50"
              >
                {exporting === 'CSV' ? 'Baixando...' : 'Exportar CSV'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 space-y-2.5">
            <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
              Exclusão Definitiva
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Elimine permanentemente sua conta, biblioteca, anotações de diário e links compartilhados.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-colors"
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
