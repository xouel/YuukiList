'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { NotificationItem } from '@yuukilist/shared';
import { calendarApiClient } from '@/services/calendar-api.client';
import { QuietHoursDialog } from './quiet-hours-dialog';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isQuietDialogOpen, setIsQuietDialogOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await calendarApiClient.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // Ignora silenciosamente se o usuário não estiver logado
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 min poll
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Fecha o popover ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await calendarApiClient.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await calendarApiClient.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Botão do Sino */}
      <button
        type="button"
        data-testid="notification-bell-btn"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) fetchNotifications();
        }}
        aria-label={`Notificações: ${unreadCount} não lidas`}
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl text-zinc-300 hover:text-cyan-400 hover:bg-zinc-850/80 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span
            data-testid="notification-unread-badge"
            className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-zinc-950 bg-cyan-400 rounded-full border-2 border-zinc-950 animate-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover de Notificações */}
      {isOpen && (
        <div
          data-testid="notification-popover"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl z-50 overflow-hidden animate-fadeIn"
        >
          <div className="flex items-center justify-between p-3.5 bg-zinc-850/80 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-100">Notificações</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {unreadCount} novas
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
                >
                  Marcar lidas
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsQuietDialogOpen(true)}
                title="Configurar Horário Silencioso"
                className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                ⚙
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60 scrollbar-thin">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Carregando notificações...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center px-4 space-y-2">
                <span className="text-2xl block text-zinc-600">🔔</span>
                <p className="text-xs text-zinc-400 font-medium">
                  Nenhuma notificação por enquanto
                </p>
                <p className="text-[11px] text-zinc-500">
                  Você receberá alertas quando novos episódios ou capítulos das suas obras acompanhadas forem lançados.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  className={`p-3 transition-colors flex items-start gap-3 cursor-pointer ${
                    notif.isRead
                      ? 'bg-zinc-900/40 hover:bg-zinc-850/50 opacity-80'
                      : 'bg-zinc-850/70 hover:bg-zinc-850'
                  }`}
                >
                  <div className="w-10 h-14 flex-shrink-0 rounded bg-zinc-800 overflow-hidden border border-zinc-700 flex items-center justify-center text-[9px] text-zinc-500 font-bold">
                    {notif.coverImage ? (
                      <img
                        src={notif.coverImage}
                        alt={notif.mediaTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>YUUKI</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <Link
                        href={`/items/${notif.mediaSlug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-semibold text-zinc-100 hover:text-cyan-400 truncate"
                      >
                        {notif.mediaTitle}
                      </Link>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 font-medium line-clamp-1">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-1 block font-mono">
                      {new Date(notif.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {notif.isQuiet && ' • 🌙 Silenciosa'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal de Horário Silencioso */}
      <QuietHoursDialog
        isOpen={isQuietDialogOpen}
        onClose={() => setIsQuietDialogOpen(false)}
      />
    </div>
  );
}

