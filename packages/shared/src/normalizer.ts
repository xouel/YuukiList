/**
 * YuukiList — Normalizador Determinístico de Texto e Gerador de Slugs
 * Remove diacríticos e pontuação sem alterar o título original de exibição.
 */

export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos / acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ') // substitui pontuação e caracteres não alfanuméricos por espaço
    .replace(/\s+/g, ' ') // colapsa múltiplos espaços em um único
    .trim();
}

export function generateSlug(title: string): string {
  const normalized = normalizeSearchText(title);
  return normalized.replace(/\s+/g, '-');
}

