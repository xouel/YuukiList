'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/auth-context';
import { adminApiClient } from '../../services/admin-api.client';
import type { InclusionRequest, RequestStatus } from '@yuukilist/shared';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<RequestStatus | 'TODAS'>('PENDENTE');
  const [requests, setRequests] = useState<InclusionRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal de Aprovação / Edição de Metadados
  const [selectedReq, setSelectedReq] = useState<InclusionRequest | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSynopsis, setEditSynopsis] = useState('');
  const [editYear, setEditYear] = useState<number | undefined>(undefined);
  const [lockedFields, setLockedFields] = useState<string[]>(['title', 'synopsis', 'releaseYear']);
  const [isModerating, setIsModerating] = useState(false);

  // Estado para Recusa
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isAdminOrMod = user?.role === 'MODERATOR' || user?.role === 'ADMIN';

  const loadRequests = async (statusTab: RequestStatus | 'TODAS') => {
    try {
      setIsLoadingRequests(true);
      setActionError(null);
      const queryStatus = statusTab === 'TODAS' ? undefined : statusTab;
      const data = await adminApiClient.listRequests(queryStatus);
      setRequests(data);
    } catch (err: any) {
      setActionError(err.message || 'Erro ao carregar solicitações administrativas.');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdminOrMod) {
      loadRequests(activeTab);
    }
  }, [isAuthenticated, isAdminOrMod, activeTab]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdminOrMod) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-400">
          🔒
        </div>
        <h1 className="text-2xl font-bold text-white">Acesso Restrito</h1>
        <p className="mt-3 text-sm text-gray-400">
          O Painel Administrativo de Moderação de Catálogo é exclusivo para usuários com privilégios de <strong>Moderador</strong> ou <strong>Administrador</strong>.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="rounded-lg bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Voltar para o Início
          </Link>
        </div>
      </main>
    );
  }

  const handleOpenApproveModal = (req: InclusionRequest) => {
    setSelectedReq(req);
    setEditTitle(req.title);
    setEditSynopsis(req.synopsis || '');
    setEditYear(req.releaseYear);
    setLockedFields(['title', 'synopsis', 'releaseYear']);
  };

  const handleApprove = async () => {
    if (!selectedReq) return;
    try {
      setIsModerating(true);
      await adminApiClient.moderateRequest(selectedReq.id, {
        status: 'APROVADA',
        title: editTitle.trim(),
        synopsis: editSynopsis.trim(),
        releaseYear: editYear ? Number(editYear) : undefined,
        lockedFields,
      });
      setSelectedReq(null);
      loadRequests(activeTab);
    } catch (err: any) {
      setActionError(err.message || 'Erro ao aprovar solicitação.');
    } finally {
      setIsModerating(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      setActionError('Informe o motivo da recusa.');
      return;
    }
    try {
      setIsModerating(true);
      await adminApiClient.moderateRequest(id, {
        status: 'RECUSADA',
        rejectionReason: rejectionReason.trim(),
      });
      setRejectingId(null);
      setRejectionReason('');
      loadRequests(activeTab);
    } catch (err: any) {
      setActionError(err.message || 'Erro ao recusar solicitação.');
    } finally {
      setIsModerating(false);
    }
  };

  const toggleFieldLock = (field: string) => {
    setLockedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Painel de Moderação</h1>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
              {user?.role}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Triagem de solicitações de inclusão, promoção de obras ao catálogo oficial e proteção de edições manuais.
          </p>
        </div>
      </div>

      {actionError && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">
          {actionError}
        </div>
      )}

      {/* Abas de Status */}
      <div className="mt-8 flex gap-2 border-b border-white/10 pb-2">
        {(['PENDENTE', 'EM_ANALISE', 'APROVADA', 'RECUSADA', 'TODAS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === tab
                ? 'bg-cyan-500 text-black'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab === 'TODAS' ? 'Todas as Solicitações' : tab}
          </button>
        ))}
      </div>

      {/* Lista de Solicitações */}
      <section className="mt-6">
        {isLoadingRequests ? (
          <div className="py-12 text-center text-sm text-gray-400">Carregando fila de moderação...</div>
        ) : requests.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-[#0f111a] p-12 text-center text-sm text-gray-400">
            Nenhuma solicitação encontrada para o filtro selecionado.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f111a]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-black/40 text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Título</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">País / Ano</th>
                  <th className="px-4 py-3 font-semibold">Solicitante</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{req.title}</div>
                      {req.originalTitle && (
                        <div className="text-[11px] text-gray-500">{req.originalTitle}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{req.category}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {req.country} {req.releaseYear ? `(${req.releaseYear})` : ''}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-400">{req.username}</td>
                    <td className="px-4 py-3">
                      {req.status === 'PENDENTE' && (
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 font-medium text-amber-400">
                          Pendente
                        </span>
                      )}
                      {req.status === 'EM_ANALISE' && (
                        <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-medium text-cyan-400">
                          Em Análise
                        </span>
                      )}
                      {req.status === 'APROVADA' && (
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-medium text-emerald-400">
                          Aprovada
                        </span>
                      )}
                      {req.status === 'RECUSADA' && (
                        <span className="rounded bg-red-500/20 px-2 py-0.5 font-medium text-red-400">
                          Recusada
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'PENDENTE' || req.status === 'EM_ANALISE' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenApproveModal(req)}
                            className="rounded bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/30"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(req.id);
                              setRejectionReason('');
                            }}
                            className="rounded bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/30"
                          >
                            Recusar
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Aprovação com Travamento de Campos */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-white/10 bg-[#12141f] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Aprovar e Promover Obra ao Catálogo Oficial</h2>
            <p className="mt-1 text-xs text-gray-400">
              Revise os metadados antes da promoção. Campos travados não serão sobrescritos por fontes externas.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300">Título Canônico</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Ano de Lançamento</label>
                <input
                  type="number"
                  value={editYear || ''}
                  onChange={(e) => setEditYear(e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Sinopse</label>
                <textarea
                  rows={3}
                  value={editSynopsis}
                  onChange={(e) => setEditSynopsis(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Seletor de Campos Protegidos / Travados */}
              <div>
                <label className="text-xs font-semibold text-cyan-400">
                  Proteção de Campos Manuais (Evitar Sobrescrita Externa)
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['title', 'synopsis', 'releaseYear'].map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleFieldLock(field)}
                      className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                        lockedFields.includes(field)
                          ? 'border border-cyan-500 bg-cyan-500/20 text-cyan-300'
                          : 'border border-white/10 bg-white/5 text-gray-400'
                      }`}
                    >
                      {lockedFields.includes(field) ? '🔒' : '🔓'} {field}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="rounded-lg px-4 py-2 text-xs text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isModerating}
                onClick={handleApprove}
                className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {isModerating ? 'Aprovando...' : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recusa */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#12141f] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Recusar Solicitação</h2>
            <p className="mt-1 text-xs text-gray-400">
              Forneça uma justificativa clara para o solicitante.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Título já cadastrado no catálogo com nome oficial alternativo."
              className="mt-4 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
            />

            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="rounded-lg px-4 py-2 text-xs text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isModerating}
                onClick={() => handleReject(rejectingId)}
                className="rounded-lg bg-red-500 px-5 py-2 text-xs font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
              >
                {isModerating ? 'Recusando...' : 'Confirmar Recusa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
