'use client';

import React, { useState, useEffect } from 'react';
import type { NotificationPreferences } from '@yuukilist/shared';
import { calendarApiClient } from '@/services/calendar-api.client';

interface QuietHoursDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuietHoursDialog({ isOpen, onClose }: QuietHoursDialogProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    userId: '',
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    soundAlerts: false,
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    calendarApiClient
      .getPreferences()
      .then((data) => {
        if (data) setPrefs(data);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await calendarApiClient.updatePreferences(prefs);
      setMessage('Preferências salvas com sucesso!');
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1000);
    } catch {
      setMessage('Erro ao salvar preferências.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiet-hours-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <h2 id="quiet-hours-title" className="text-lg font-bold text-zinc-100">
              Horário Silencioso
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Durante o horário silencioso, os novos episódios e lançamentos são registrados silenciosamente sem emitir alertas sonoros ou banners intrusivos.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-850/60 border border-zinc-800 cursor-pointer">
            <span className="text-sm font-medium text-zinc-200">
              Ativar Horário Silencioso
            </span>
            <input
              type="checkbox"
              checked={prefs.quietHoursEnabled}
              onChange={(e) => setPrefs({ ...prefs, quietHoursEnabled: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
            />
          </label>

          {prefs.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-850/40 border border-zinc-800/80">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Início (Noite)
                </label>
                <input
                  type="time"
                  value={prefs.quietHoursStart}
                  onChange={(e) => setPrefs({ ...prefs, quietHoursStart: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-200 text-sm font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Término (Manhã)
                </label>
                <input
                  type="time"
                  value={prefs.quietHoursEnd}
                  onChange={(e) => setPrefs({ ...prefs, quietHoursEnd: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-750 text-zinc-200 text-sm font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {message && (
            <p className="text-xs text-center font-medium text-cyan-400 bg-cyan-950/40 p-2 rounded-lg border border-cyan-800/50">
              {message}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Preferências'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

