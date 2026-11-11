'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import { provisionalApiClient } from '../../../services/provisional-api.client';
import type {
  Category,
  CreateInclusionRequestDto,
  InclusionRequest,
  SimilarItemResult,
} from '@yuukilist/shared';

const CATEGORIES: Category[] = [
  'DORAMA',
  'FILME',
  'ANIME',
  'MANGA',
  'MANHWA',
  'MANHUA',
];

const COUNTRIES = [
  { code: 'KR', name: 'Coreia do Sul' },
  { code: 'JP', name: 'Japão' },
  { code: 'CN', name: 'China' },
  { code: 'TH', name: 'Tailândia' },
  { code: 'TW', name: 'Taiwan' },
];

export default function RequestInclusionPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [category, setCategory] = useState<Category>('DORAMA');
  const [format, setFormat] = useState('SERIE');
  const [country, setCountry] = useState('KR');
  const [releaseYear, setReleaseYear] = useState<number | undefined>(undefined);
  const [synopsis, setSynopsis] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const [similarItems, setSimilarItems] = useState<SimilarItemResult[]>([]);
  const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false);
  const [confirmedDifferent, setConfirmedDifferent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRequest, setSuccessRequest] = useState<InclusionRequest | null>(null);

  const [myRequests, setMyRequests] = useState<InclusionRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Debounced Trigram Similarity Check
  useEffect(() => {
    if (!title.trim() || title.trim().length < 3) {
      setSimilarItems([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsCheckingSimilarity(true);
        const res = await provisionalApiClient.checkSimilarity(title.trim());
        setSimilarItems(res.candidates || []);
      } catch {
        setSimilarItems([]);
      } finally {
        setIsCheckingSimilarity(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title]);

  // Carrega histórico de solicitações do usuário
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingRequests(true);
      provisionalApiClient
        .getMyRequests()
        .then((data) => setMyRequests(data))
        .catch(() => {})
        .finally(() => setIsLoadingRequests(false));
    }
  }, [isAuthenticated, successRequest]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Solicitar Inclusão de Obra</h1>
        <p className="mt-4 text-gray-400">
          Você precisa estar conectado à sua conta para solicitar a inclusão de uma obra provisória e acompanhá-la em sua biblioteca.
        </p>
        <Link
          href="/login?redirect=/items/request"
          className="mt-6 inline-block rounded-lg bg-cyan-500 px-6 py-2.5 font-medium text-black transition hover:bg-cyan-400"
        >
          Entrar na Conta
        </Link>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('O título da obra é obrigatório.');
      return;
    }

    try {
      setIsSubmitting(true);
      const dto: CreateInclusionRequestDto = {
        title: title.trim(),
        originalTitle: originalTitle.trim() || undefined,
        category,
        format,
        country,
        releaseYear: releaseYear ? Number(releaseYear) : undefined,
        synopsis: synopsis.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      };

      const created = await provisionalApiClient.createRequest(dto);
      setSuccessRequest(created);
      setTitle('');
      setOriginalTitle('');
      setSynopsis('');
      setSourceUrl('');
      setSimilarItems([]);
      setConfirmedDifferent(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Solicitação de Inclusão de Obra</h1>
        <p className="mt-2 text-sm text-gray-400">
          Não encontrou o que está assistindo ou lendo? Cadastre uma obra provisória. Ela será adicionada imediatamente à sua biblioteca pessoal com o badge <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-400">Provisório</span> enquanto nossa moderação avalia a inclusão oficial.
        </p>
      </div>

      {successRequest && (
        <div className="mb-8 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-emerald-300">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-lg text-emerald-400">✓</span>
            <div>
              <h2 className="text-lg font-semibold text-white">Obra Provisória Adicionada com Sucesso!</h2>
              <p className="text-sm text-emerald-400/90">
                <strong>{successRequest.title}</strong> já está disponível em sua biblioteca pessoal. Você já pode registrar progresso e anotações.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <Link
              href="/library"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-black transition hover:bg-emerald-400"
            >
              Ir para Minha Biblioteca
            </Link>
            <button
              onClick={() => setSuccessRequest(null)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Cadastrar Outra Obra
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-white/10 bg-[#0f111a] p-6 shadow-xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Título Principal */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Título da Obra (Principal) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setConfirmedDifferent(false);
              }}
              required
              placeholder="Ex: Alquimia das Almas, Solo Leveling, etc."
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {isCheckingSimilarity && (
              <span className="mt-1 inline-block text-xs text-cyan-400 animate-pulse">
                Verificando se já existe no catálogo...
              </span>
            )}
          </div>

          {/* Alerta de Similaridade Trigram (pg_trgm) */}
          {similarItems.length > 0 && !confirmedDifferent && (
            <div className="md:col-span-2 rounded-lg border border-amber-500/30 bg-amber-950/20 p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-300">
                    Obras semelhantes encontradas no catálogo:
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Encontramos títulos parecidos. Verifique se a sua obra não é uma das listadas abaixo antes de enviar:
                  </p>
                  <ul className="mt-3 space-y-2">
                    {similarItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between rounded border border-white/5 bg-black/40 px-3 py-2 text-xs"
                      >
                        <div>
                          <span className="font-medium text-white">{item.title}</span>
                          <span className="ml-2 text-gray-500">
                            ({item.category}{item.releaseYear ? `, ${item.releaseYear}` : ''})
                          </span>
                        </div>
                        <span className="rounded bg-cyan-950 px-2 py-0.5 text-[11px] font-mono text-cyan-400">
                          {Math.round(item.similarity * 100)}% similar
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setConfirmedDifferent(true)}
                    className="mt-3 rounded border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
                  >
                    Confirmar: Minha obra é diferente (remake, sequência ou homônimo)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Título Original */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Título Original (Opcional)
            </label>
            <input
              type="text"
              value={originalTitle}
              onChange={(e) => setOriginalTitle(e.target.value)}
              placeholder="Ex: 환혼, 나 혼자만 레벨업"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Categoria *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* País de Origem */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              País de Origem *
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
            >
              {COUNTRIES.map((ctry) => (
                <option key={ctry.code} value={ctry.code}>
                  {ctry.name} ({ctry.code})
                </option>
              ))}
            </select>
          </div>

          {/* Ano de Lançamento */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Ano de Lançamento (Estimado)
            </label>
            <input
              type="number"
              min={1950}
              max={2030}
              value={releaseYear || ''}
              onChange={(e) => setReleaseYear(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Ex: 2024"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Sinopse */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Sinopse / Descrição Curta
            </label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Descreva brevemente a premissa da obra..."
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* URL de Referência / Fonte */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Link de Referência / Fonte (Opcional)
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-cyan-500 px-6 py-2.5 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Obra Provisória'}
          </button>
        </div>
      </form>

      {/* Seção Minhas Solicitações */}
      <section className="mt-14">
        <h2 className="text-xl font-bold text-white">Minhas Solicitações de Inclusão</h2>
        <p className="mt-1 text-xs text-gray-400">
          Acompanhe o estado de moderação das obras que você cadastrou.
        </p>

        {isLoadingRequests ? (
          <div className="mt-4 text-xs text-gray-500">Carregando solicitações...</div>
        ) : myRequests.length === 0 ? (
          <div className="mt-4 rounded-lg border border-white/5 bg-[#0f111a] p-6 text-center text-xs text-gray-500">
            Você ainda não possui solicitações registradas.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#0f111a]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-black/30 text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Obra</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Observações / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {myRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-4 py-3 font-medium text-white">{req.title}</td>
                    <td className="px-4 py-3 text-gray-400">{req.category}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                    </td>
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
                    <td className="px-4 py-3 text-gray-400">
                      {req.rejectionReason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
