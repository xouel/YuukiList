/**
 * YuukiList — Serviço de Armazenamento e Resolução de Capas SVG Locais
 * Conforme Requisito: Local SVG Cover Serving and Fallback
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CoverResult } from '../../../../packages/shared/src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_COVERS_DIR = path.resolve(__dirname, '../../assets/covers');

const SLUG_SAFE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CoverStorageService {
  private coversDir: string;
  private placeholderSvgCache: string | null = null;

  constructor(coversDir = DEFAULT_COVERS_DIR) {
    this.coversDir = coversDir;
  }

  /**
   * Retorna o SVG de placeholder seguro padrão.
   */
  getPlaceholderSvg(): string {
    if (this.placeholderSvgCache) {
      return this.placeholderSvgCache;
    }
    const placeholderPath = path.join(this.coversDir, '_placeholder.svg');
    if (fs.existsSync(placeholderPath)) {
      this.placeholderSvgCache = fs.readFileSync(placeholderPath, 'utf8');
      return this.placeholderSvgCache;
    }
    // Fallback em memória caso o arquivo não exista no disco
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">
  <rect width="300" height="450" fill="#12141c"/>
  <rect x="20" y="20" width="260" height="410" rx="8" fill="none" stroke="#2a2e3f" stroke-width="2"/>
  <text x="150" y="210" fill="#6b7280" font-family="sans-serif" font-size="14" text-anchor="middle">YUUKILIST</text>
  <text x="150" y="240" fill="#9ca3af" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Capa Indisponível</text>
</svg>`;
  }

  /**
   * Obtém a capa SVG pelo slug. Se não existir ou for inválido, retorna o fallback com isFallback: true.
   */
  getCoverBySlug(slug: string): CoverResult {
    const cleanSlug = typeof slug === 'string' ? slug.trim() : '';

    // Proteção contra Path Traversal e slugs malformados
    if (!cleanSlug || !SLUG_SAFE_RE.test(cleanSlug)) {
      return {
        slug: cleanSlug,
        contentType: 'image/svg+xml',
        svg: this.getPlaceholderSvg(),
        isFallback: true,
      };
    }

    const coverFile = `${cleanSlug}.svg`;
    const coverPath = path.join(this.coversDir, coverFile);

    // Confinamento de caminho
    if (!coverPath.startsWith(this.coversDir)) {
      return {
        slug: cleanSlug,
        contentType: 'image/svg+xml',
        svg: this.getPlaceholderSvg(),
        isFallback: true,
      };
    }

    if (fs.existsSync(coverPath) && fs.statSync(coverPath).isFile()) {
      try {
        const svgContent = fs.readFileSync(coverPath, 'utf8');
        return {
          slug: cleanSlug,
          contentType: 'image/svg+xml',
          svg: svgContent,
          isFallback: false,
        };
      } catch {
        // Fallback em caso de erro de leitura
      }
    }

    return {
      slug: cleanSlug,
      contentType: 'image/svg+xml',
      svg: this.getPlaceholderSvg(),
      isFallback: true,
    };
  }
}

