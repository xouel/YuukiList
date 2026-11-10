'use client';

import React, { useState } from 'react';
import { profileApiClient } from '@/services/profile-api.client';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!confirmed) return;
    setLoading(true);
    setError(null);
    try {
      await profileApiClient.deleteAccount(true);
      window.location.href = '/login?deleted=true';
    } catch (err: any) {
      setError(err.message || 'Erro ao processar exclusão de conta');
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-rose-900/60 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <h2 id="delete-account-title" className="text-lg font-bold text-rose-400">
              Zona de Perigo • Excluir Conta
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

        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-200/90 leading-relaxed space-y-2">
          <p>
            <strong>Atenção:</strong> Esta ação é <strong>irreversível</strong>. Todos os seus registros de acompanhamento, biblioteca, avaliações, histórico de diário e links compartilhados serão permanentemente eliminados conforme a Lei Geral de Proteção de Dados (LGPD).
          </p>
        </div>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-850/60 border border-zinc-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-rose-500 focus:ring-rose-500"
          />
          <span className="text-xs font-medium text-zinc-300 leading-normal">
            Entendo que meus dados serão permanentemente apagados e não poderão ser recuperados.
          </span>
        </label>

        {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!confirmed || loading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-rose-950"
          >
            {loading ? 'Excluindo conta...' : 'Excluir Minha Conta Definitivamente'}
          </button>
        </div>
      </div>
    </div>
  );
}

