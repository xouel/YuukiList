/**
 * YuukiList — Gerador Dinâmico de Capas Vetoriais SVG (Soberania de Dados)
 * Proporção 2:3 (300x450), Dark Editorial Theme, R$ 0 de custo externo.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Category, generateSlug } from '../../../../packages/shared/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_COVERS_DIR = path.resolve(__dirname, '../../assets/covers');

export interface GenerateCoverOptions {
  title: string;
  originalTitle?: string | null;
  category: Category | string;
  originCountry?: string | null;
  releaseYear?: number | null;
  genres?: string[];
  slug?: string;
}

export const CATEGORY_PALETTES: Record<
  string,
  { g1: string; g2: string; accent: string; badge: string }
> = {
  DORAMA: { g1: '#1a1026', g2: '#0b0814', accent: '#d946ef', badge: '#701a75' },
  FILME: { g1: '#131b2e', g2: '#080c14', accent: '#38bdf8', badge: '#0c4a6e' },
  ANIME: { g1: '#1e1438', g2: '#0b0618', accent: '#a855f7', badge: '#581c87' },
  MANGA: { g1: '#1f1e24', g2: '#0d0d10', accent: '#f59e0b', badge: '#78350f' },
  MANHWA: { g1: '#0e2424', g2: '#061212', accent: '#10b981', badge: '#064e3b' },
  MANHUA: { g1: '#261414', g2: '#120707', accent: '#f43f5e', badge: '#881337' },
};

export class SvgCoverService {
  private coversDir: string;

  constructor(coversDir = DEFAULT_COVERS_DIR) {
    this.coversDir = coversDir;
    try {
      fs.mkdirSync(this.coversDir, { recursive: true });
    } catch {
      // Criação silenciosa
    }
  }

  /**
   * Gera o conteúdo SVG vetorial estilizado para uma obra.
   */
  generateSvgCover(options: GenerateCoverOptions): string {
    const categoryKey = String(options.category || 'DORAMA').toUpperCase();
    const col = CATEGORY_PALETTES[categoryKey] || {
      g1: '#12141c',
      g2: '#090a0f',
      accent: '#00e5ff',
      badge: '#1e293b',
    };

    const slug = options.slug || generateSlug(options.title || 'untitled');
    const safeTitle = (options.title || 'Sem Título')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const safeOriginal = (options.originalTitle || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const country = options.originCountry || 'AS';
    const year = options.releaseYear || new Date().getFullYear();
    const genres = (options.genres || []).slice(0, 2).join(' • ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">
  <defs>
    <linearGradient id="bg-${slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${col.g1}"/>
      <stop offset="100%" stop-color="${col.g2}"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="url(#bg-${slug})"/>
  <rect x="12" y="12" width="276" height="426" rx="10" fill="none" stroke="${col.accent}" stroke-width="1.5" stroke-opacity="0.3"/>
  <text x="150" y="180" fill="${col.accent}" font-family="sans-serif" font-size="38" font-weight="bold" text-anchor="middle" opacity="0.14">${safeOriginal}</text>
  <rect x="24" y="28" width="86" height="22" rx="11" fill="${col.badge}"/>
  <text x="67" y="43" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="700" letter-spacing="1" text-anchor="middle">${categoryKey}</text>
  <text x="24" y="370" fill="${col.accent}" font-family="system-ui, sans-serif" font-size="11" font-weight="600" letter-spacing="2">${country} • ${year}</text>
  <text x="24" y="398" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="bold">${safeTitle}</text>
  <text x="24" y="418" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">${genres}</text>
</svg>`;
  }

  /**
   * Salva o SVG gerado em disco para persistência em cache.
   */
  saveCover(slug: string, svg: string): string {
    const filePath = path.join(this.coversDir, `${slug}.svg`);
    fs.writeFileSync(filePath, svg, 'utf8');
    return filePath;
  }

  /**
   * Garante a existência do arquivo SVG no disco para uma obra.
   */
  ensureCover(options: GenerateCoverOptions): string {
    const slug = options.slug || generateSlug(options.title);
    const filePath = path.join(this.coversDir, `${slug}.svg`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    const svg = this.generateSvgCover(options);
    return this.saveCover(slug, svg);
  }
}

