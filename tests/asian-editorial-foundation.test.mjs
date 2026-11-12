/**
 * YuukiList — Suíte de Testes da Mudança 018-asian-editorial-foundation
 * Validação do Design System Asian Editorial, Paleta Mineral, Tipografia 3 Níveis e Container Uniforme
 * TDD: Cobrindo TR-001 a TR-008 conforme specs/navigation-shell/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('018-asian-editorial-foundation — Suíte de Validação', () => {
  const shellPath = resolve(__dirname, '../apps/web/src/components/layout/navigation-shell.tsx');
  const footerPath = resolve(__dirname, '../apps/web/src/components/layout/legal-footer.tsx');
  const layoutPath = resolve(__dirname, '../apps/web/src/app/layout.tsx');
  const cssPath = resolve(__dirname, '../apps/web/src/app/globals.css');
  const tailwindPath = resolve(__dirname, '../apps/web/tailwind.config.ts');

  describe('US1 & TR-005, TR-007, TR-008: Paleta Mineral Nanquim/Papel/Carmim e Tipografia 3 Níveis', () => {
    it('TR-008: globals.css deve definir as variáveis da paleta mineral Asian Editorial', () => {
      const cssContent = readFileSync(cssPath, 'utf8');

      // Base Nanquim profundo
      assert.ok(cssContent.includes('--color-bg-base: #121115'), 'Deve definir --color-bg-base como #121115 (Nanquim)');
      // Superfície Estante
      assert.ok(cssContent.includes('--color-bg-surface: #1a1820') || cssContent.includes('--color-bg-surface: #1A1820'), 'Deve definir --color-bg-surface como #1A1820');
      // Bordas Fio
      assert.ok(cssContent.includes('--color-border: #2b2735') || cssContent.includes('--color-border: #2B2735'), 'Deve definir --color-border como #2B2735');
      // Texto Papel
      assert.ok(cssContent.includes('--color-text-primary: #f4efea') || cssContent.includes('--color-text-primary: #F4EFEA'), 'Deve definir --color-text-primary como #F4EFEA');
      // Metadados Grafite Neutro
      assert.ok(cssContent.includes('--color-text-secondary: #9c96a2') || cssContent.includes('--color-text-secondary: #9C96A2'), 'Deve definir --color-text-secondary como #9C96A2');
      // Acento Carmim
      assert.ok(cssContent.includes('--color-accent: #e05347') || cssContent.includes('--color-accent: #E05347'), 'Deve definir --color-accent como #E05347');
    });

    it('TR-008: globals.css e tailwind.config.ts devem declarar utilitários para a escala tipográfica em 3 níveis', () => {
      const cssContent = readFileSync(cssPath, 'utf8');
      const twContent = readFileSync(tailwindPath, 'utf8');

      // Escala tipográfica: Serifa Editorial nos títulos
      assert.ok(
        cssContent.includes('font-serif-editorial') || twContent.includes('serif-editorial') || cssContent.includes('Shippori Mincho') || cssContent.includes('Playfair Display'),
        'Deve configurar família tipográfica serifada editorial para títulos'
      );

      // Escala tipográfica: Sans Neutra para UI
      assert.ok(
        cssContent.includes('font-sans-ui') || twContent.includes('sans-ui') || cssContent.includes('Plus Jakarta Sans') || cssContent.includes('Inter'),
        'Deve configurar família tipográfica sans-serif neutra para corpo e UI'
      );

      // Estilização para títulos nativos asiáticos (CJK) com 70% de opacidade
      assert.ok(
        cssContent.includes('cjk') || cssContent.includes('cjk-title') || cssContent.includes('Noto Sans'),
        'Deve fornecer regras tipográficas dedicadas para títulos nativos asiáticos CJK'
      );
    });

    it('TR-007: globals.css deve manter suporte a Light Editorial com alto contraste', () => {
      const cssContent = readFileSync(cssPath, 'utf8');

      assert.ok(cssContent.includes('[data-theme="light"]'), 'Deve conter mapeamento para [data-theme="light"]');
      assert.ok(cssContent.includes('--color-bg-base: #f8fafc') || cssContent.includes('--color-bg-base: #F8FAFC') || cssContent.includes('--color-bg-base: #F9F8F5'), 'Light theme deve definir fundo claro');
      assert.ok(cssContent.includes('--color-text-primary: #1a1820') || cssContent.includes('--color-text-primary: #0f172a') || cssContent.includes('--color-text-primary: #16141A'), 'Light theme deve definir texto escuro de alto contraste');
    });

    it('TR-006: globals.css deve garantir anel de foco acessível e prefers-reduced-motion', () => {
      const cssContent = readFileSync(cssPath, 'utf8');

      assert.ok(cssContent.includes('prefers-reduced-motion'), 'Deve respeitar prefers-reduced-motion');
      assert.ok(cssContent.includes(':focus-visible'), 'Deve ter anel de foco acessível :focus-visible');
    });
  });

  describe('US2 & TR-004: Container Global Uniforme em max-w-7xl', () => {
    it('TR-004: navigation-shell.tsx e layout devem manter a largura máxima em max-w-7xl consistente', () => {
      const shellContent = readFileSync(shellPath, 'utf8');

      assert.ok(
        shellContent.includes('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'),
        'NavigationShell main deve utilizar exatamente max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      );
    });

    it('TR-004: legal-footer.tsx deve alinhar seu conteúdo ao container max-w-7xl', () => {
      const footerContent = readFileSync(footerPath, 'utf8');

      assert.ok(
        footerContent.includes('max-w-7xl'),
        'LegalFooter deve adotar container com max-w-7xl para alinhamento uniforme'
      );
    });
  });

  describe('US3 & TR-001, TR-002, TR-003: Wordmark Tipográfico e Rótulos Humanizados', () => {
    it('TR-001: sidebar deve remover gradiente tech ciano-roxo e adotar wordmark tipográfico refinado', () => {
      const shellContent = readFileSync(shellPath, 'utf8');

      // Verifica extinção do gradiente tech anterior
      assert.ok(!shellContent.includes('from-[#06B6D4] via-[#38BDF8] to-[#8B5CF6]'), 'Sidebar não deve mais conter o gradiente tech ciano-roxo no logo');
      assert.ok(!shellContent.includes('from-[#06B6D4] to-[#8B5CF6]'), 'Header mobile não deve conter gradiente ciano-roxo');

      // Verifica presença do wordmark limpo
      assert.ok(shellContent.includes('YUUKILIST'), 'Deve conter o nome da marca YUUKILIST');
    });

    it('TR-001: sidebar deve humanizar os rótulos de rodapé', () => {
      const shellContent = readFileSync(shellPath, 'utf8');

      assert.ok(
        shellContent.includes('Notificações & Aparência'),
        'Rodapé da sidebar deve conter rótulo humanizado "Notificações & Aparência"'
      );
    });

    it('TR-003: botões de autenticação na sidebar e header mobile devem usar acento carmim #E05347 ou variável semântica', () => {
      const shellContent = readFileSync(shellPath, 'utf8');

      assert.ok(
        shellContent.includes('#E05347') || shellContent.includes('#e05347') || shellContent.includes('var(--color-accent)'),
        'Botões de destaque devem empregar a cor de acento carmim (#E05347 ou var(--color-accent))'
      );
    });

    it('TR-002: header mobile e bottom navigation devem adotar as novas cores de tema mineral', () => {
      const shellContent = readFileSync(shellPath, 'utf8');

      assert.ok(shellContent.includes('var(--color-bg-surface)'), 'Header e nav móvel devem usar var(--color-bg-surface)');
      assert.ok(shellContent.includes('var(--color-border)'), 'Header e nav móvel devem usar var(--color-border)');
    });
  });
});
