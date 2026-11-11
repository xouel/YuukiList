/**
 * YuukiList — Utilitários e Agregações para o Ledger Pessoal e Cadência de Consumo
 * Fatia: 024-ledger-library-and-cadence (R24)
 */

import type { LibraryItemDto, HistoryEventDto, Category } from '../../../../../packages/shared/src/index.ts';

export interface LedgerKpiMetrics {
  completedCount: number;
  inProgressCount: number;
  totalHours: number;
  syncTimestampText: string;
}

export interface ConsumptionCadenceData {
  totalEpisodes30Days: number;
  totalChapters30Days: number;
  dailyAverage: number;
  dailyPoints: number[];
}

/**
 * Remove acentos e converte para minúsculas para busca insensível
 */
export function normalizeSearchText(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Filtra itens da biblioteca em memória por título oficial ou original
 */
export function filterLibraryLocal(items: LibraryItemDto[], query: string): LibraryItemDto[] {
  if (!query || !query.trim()) {
    return items;
  }
  const normalizedQuery = normalizeSearchText(query);
  return items.filter((item) => {
    const title = normalizeSearchText(item.mediaItem?.title || '');
    const originalTitle = normalizeSearchText(item.mediaItem?.originalTitle || '');
    return title.includes(normalizedQuery) || originalTitle.includes(normalizedQuery);
  });
}

/**
 * Calcula os 3 KPIs analíticos do Ledger Pessoal: Concluídos, Em Andamento e Horas Totais
 */
export function calculateLedgerKpis(items: LibraryItemDto[]): LedgerKpiMetrics {
  let completedCount = 0;
  let inProgressCount = 0;
  let totalMinutes = 0;

  for (const item of items) {
    if (item.status === 'CONCLUIDO' || item.status === 'ASSISTIDO') {
      completedCount++;
    } else if (item.status === 'ASSISTINDO' || item.status === 'LENDO') {
      inProgressCount++;
    }

    const category = item.mediaItem?.category;
    const progress = Math.max(0, item.progress || 0);

    // Duração estimada: 24 min por episódio (Anime/Dorama/Filme), 10 min por capítulo (Mangá/Manhwa/Manhua)
    if (category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA') {
      totalMinutes += progress * 10;
    } else {
      totalMinutes += progress * 24;
    }
  }

  const totalHours = Math.round(totalMinutes / 60);

  return {
    completedCount,
    inProgressCount,
    totalHours,
    syncTimestampText: 'Sincronizado recentemente',
  };
}

/**
 * Calcula o consumo dos últimos 30 dias a partir do diário e progresso recente
 */
export function calculateCadenceMetrics(
  items: LibraryItemDto[],
  diaryEvents: HistoryEventDto[] = []
): ConsumptionCadenceData {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * DAY_MS;

  // Array de 30 dias inicializado com 0
  const dailyPoints: number[] = new Array(30).fill(0);
  let totalEpisodes30Days = 0;
  let totalChapters30Days = 0;

  // Filtra eventos de progresso dos últimos 30 dias
  for (const ev of diaryEvents) {
    const eventTime = new Date(ev.date || (ev as any).createdAt).getTime();
    if (eventTime >= thirtyDaysAgo && eventTime <= now) {
      const dayIndex = Math.min(29, Math.max(0, Math.floor((eventTime - thirtyDaysAgo) / DAY_MS)));
      const delta = Math.max(1, (ev as any).delta || 1);
      dailyPoints[dayIndex] += delta;

      const category = (ev as any).mediaItem?.category || (ev as any).category;
      if (category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA') {
        totalChapters30Days += delta;
      } else {
        totalEpisodes30Days += delta;
      }
    }
  }

  // Se não houver eventos de diário suficientes, estimar a partir dos itens em andamento
  const totalUnits = totalEpisodes30Days + totalChapters30Days;
  if (totalUnits === 0 && items.length > 0) {
    const activeUnits = items.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    const estimated30Days = Math.min(activeUnits, Math.max(1, Math.round(activeUnits * 0.25)));
    totalEpisodes30Days = estimated30Days;
    // Distribui valores simulados leves para a curva do sparkline
    for (let i = 0; i < 30; i++) {
      dailyPoints[i] = Math.max(0, Math.round(Math.sin((i / 30) * Math.PI) * (estimated30Days / 15)));
    }
  }

  const sumAll = dailyPoints.reduce((a, b) => a + b, 0);
  const dailyAverage = parseFloat((sumAll / 30).toFixed(1));

  return {
    totalEpisodes30Days,
    totalChapters30Days,
    dailyAverage,
    dailyPoints,
  };
}

/**
 * Gera string CSV formatada com BOM UTF-8 para exportação do acervo
 */
export function generateLibraryCsv(items: LibraryItemDto[]): string {
  const headers = [
    'ID',
    'Título',
    'Título Original',
    'Categoria',
    'Status',
    'Progresso',
    'Total de Unidades',
    'Nota',
    'Favorito',
    'Atualizado Em',
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = items.map((item) => {
    const media = item.mediaItem;
    const totalUnits =
      (media as any)?.totalEpisodes ||
      (media as any)?.totalChapters ||
      (media as any)?.totalUnits ||
      '';

    return [
      escapeCsv(item.id),
      escapeCsv(media?.title || ''),
      escapeCsv(media?.originalTitle || ''),
      escapeCsv(media?.category || ''),
      escapeCsv(item.status),
      escapeCsv(item.progress ?? 0),
      escapeCsv(totalUnits),
      escapeCsv(item.rating ?? ''),
      escapeCsv(item.isFavorite ? 'Sim' : 'Não'),
      escapeCsv(item.updatedAt || ''),
    ].join(',');
  });

  // Prefixo UTF-8 Byte Order Mark para compatibilidade com Microsoft Excel
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Dispara o download de um arquivo no navegador do usuário
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;'): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

