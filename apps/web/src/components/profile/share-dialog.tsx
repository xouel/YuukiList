'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ShareLinkDto } from '@yuukilist/shared';
import { ShareScope } from '@yuukilist/shared';
import { profileApiClient } from '@/services/profile-api.client';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ isOpen, onClose }: ShareDialogProps) {
  const [links, setLinks] = useState<ShareLinkDto[]>([]);
  const [expirationDays, setExpirationDays] = useState<number>(30);
  const [shareScope, setShareScope] = useState<string>(ShareScope.FULL_LIBRARY);
  const [creating, setCreating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      const active = await profileApiClient.getActiveShareLinks();
      setLinks(active || []);
    } catch {
      setLinks([]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchLinks();
    }
  }, [isOpen, fetchLinks]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const newLink = await profileApiClient.createShareLink(
        expirationDays,
        shareScope as any
      );
      setLinks((prev) => [newLink, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar link');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await profileApiClient.revokeShareLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch {}
  };

  const handleCopy = (link: ShareLinkDto) => {
    const fullUrl = `${window.location.origin}${link.publicUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔗</span>
            <h2 id="share-dialog-title" className="text-lg font-bold text-zinc-100">
              Compartilhar Biblioteca e Perfil
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Gere links temporários e somente leitura para compartilhar seu progresso e perfil com amigos. Suas anotações privadas e spoilers nunca são compartilhados.
        </p>

        {/* Formulário de Criação */}
        <div className="p-4 rounded-xl bg-zinc-850/60 border border-zinc-800 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Validade do Link
              </label>
              <select
                value={expirationDays}
                onChange={(e) => setExpirationDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value={7}>7 dias</option>
                <option value={30}>30 dias (Recomendado)</option>
                <option value={90}>90 dias</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Escopo de Compartilhamento
              </label>
              <select
                value={shareScope}
                onChange={(e) => setShareScope(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value={ShareScope.FULL_LIBRARY}>Biblioteca Completa</option>
                <option value={ShareScope.FAVORITES_ONLY}>Apenas Favoritos</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-colors disabled:opacity-50"
          >
            {creating ? 'Gerando Link...' : 'Gerar Novo Link de Compartilhamento'}
          </button>
        </div>

        {/* Lista de Links Ativos */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Links Ativos ({links.length})
          </h3>

          {links.length === 0 ? (
            <p className="text-xs text-zinc-500 py-3 text-center bg-zinc-900/40 rounded-xl border border-zinc-850">
              Nenhum link ativo no momento.
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2.5 scrollbar-thin">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="p-3 rounded-xl bg-zinc-850/40 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {link.shareScope === ShareScope.FAVORITES_ONLY ? 'Apenas Favoritos' : 'Completa'}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Expira em {new Date(link.expiresAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-xs text-cyan-400 font-mono truncate">
                      {typeof window !== 'undefined' ? `${window.location.origin}${link.publicUrl}` : link.publicUrl}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(link)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 transition-colors"
                    >
                      {copiedId === link.id ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button
                      onClick={() => handleRevoke(link.id)}
                      title="Revogar link imediatamente"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-colors"
                    >
                      Revogar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

