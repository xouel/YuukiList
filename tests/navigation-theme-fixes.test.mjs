/**
 * YuukiList — Suíte de Testes da Mudança 017-ui-ux-navigation-and-theme-fixes
 * Validação de Navegação Unificada (4 áreas), Reatividade de Auth e Aplicação Efetiva de Tema
 * TDD: Cobrindo TR-001 a TR-006 conforme specs/navigation-shell/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('017-ui-ux-navigation-and-theme-fixes — Suíte de Validação', () => {
  const shellPath = resolve(__dirname, '../apps/web/src/components/layout/navigation-shell.tsx');
  const layoutPath = resolve(__dirname, '../apps/web/src/app/layout.tsx');
  const cssPath = resolve(__dirname, '../apps/web/src/app/globals.css');
  const tailwindPath = resolve(__dirname, '../apps/web/tailwind.config.ts');

  describe('US1 & TR-001 / TR-002: Navegação Unificada em 4 Áreas (Desktop e Mobile)', () => {
    it('TR-001: deve unificar a navegação em exatamente 4 áreas (Explorar, Biblioteca, Calendário, Perfil) sem link quebrado search=open', () => {
      const content = readFileSync(shellPath, 'utf8');

      // Verifica que 'Buscar' como item separado com query param foi removido da lista navItems
      assert.ok(!content.includes("href: '/?search=open'"), 'Não deve conter item com href: /?search=open');
      assert.ok(!content.includes('window.location.search.includes'), 'Não deve depender de window.location.search estático');

      // Verifica as 4 áreas canônicas
      assert.ok(content.includes("'Explorar'") || content.includes('"Explorar"'), 'Deve conter Explorar');
      assert.ok(content.includes("'Biblioteca'") || content.includes('"Biblioteca"'), 'Deve conter Biblioteca');
      assert.ok(content.includes("'Calendário'") || content.includes('"Calendário"'), 'Deve conter Calendário');
      assert.ok(content.includes("'Perfil'") || content.includes('"Perfil"'), 'Deve conter Perfil');

      // Deve usar Next Link para transições SPA
      assert.ok(content.includes("from 'next/link'") || content.includes('from "next/link"'), 'Deve importar Link do next/link');
      assert.ok(content.includes('<Link'), 'Deve utilizar o componente <Link> do Next.js');
    });

    it('TR-002: deve estruturar a Bottom Navigation móvel com as 4 áreas unificadas', () => {
      const content = readFileSync(shellPath, 'utf8');

      assert.ok(content.includes('aria-label="Navegação Móvel"'), 'Deve conter rótulo acessível para Bottom Nav');
      assert.ok(content.includes('lg:hidden'), 'Bottom Nav deve ser oculta em desktop');
      assert.ok(content.includes('fixed bottom-0'), 'Bottom Nav deve ser fixada na base da viewport');
    });
  });

  describe('US3 & TR-003: Destaque Reativo dos Botões de Autenticação Conforme Rota Ativa', () => {
    it('TR-003: deve destacar dinamicamente Entrar e Cadastrar dependendo de pathname (/login vs /register)', () => {
      const content = readFileSync(shellPath, 'utf8');

      // Verifica uso de pathname para controlar os botões de login/cadastro
      assert.ok(
        content.includes("pathname === '/login'") || content.includes("pathname.startsWith('/login')"),
        'Deve validar se a rota ativa é /login'
      );
      assert.ok(
        content.includes("pathname === '/register'") || content.includes("pathname.startsWith('/register')"),
        'Deve validar se a rota ativa é /register'
      );

      // Deve conter links acessíveis via Next.js Link para /login e /register
      assert.ok(content.includes('href="/login"'), 'Deve conter link para /login');
      assert.ok(content.includes('href="/register"'), 'Deve conter link para /register');
    });

    it('TR-003 (Mobile): cabeçalho móvel deve fornecer link alternativo dinâmico', () => {
      const content = readFileSync(shellPath, 'utf8');

      // No header mobile, se estiver em /login exibe Cadastrar, caso contrário exibe Entrar
      assert.ok(
        content.includes('/register') && content.includes('/login'),
        'Header mobile deve conter capacidade de direcionar para /register ou /login dinamicamente'
      );
    });
  });

  describe('US2 & TR-004, TR-005, TR-006: Aplicação Efetiva de Tema Claro / Escuro e WCAG 2.2 AA', () => {
    it('TR-006: layout raiz (layout.tsx) não deve travar o body com cores hexadecimais escuras fixas', () => {
      const layoutContent = readFileSync(layoutPath, 'utf8');

      assert.ok(
        !layoutContent.includes('bg-[#080A11]'),
        'layout.tsx não deve fixar bg-[#080A11] no body impedindo a alternância para Light Editorial'
      );
      assert.ok(
        layoutContent.includes('var(--color-bg-base)') || layoutContent.includes('bg-background') || !layoutContent.includes('bg-[#'),
        'layout.tsx deve utilizar variáveis semânticas de fundo ou permitir que o body herde globals.css'
      );
    });

    it('TR-004: navigation-shell deve utilizar classes semânticas de tema vinculadas a variáveis CSS', () => {
      const content = readFileSync(shellPath, 'utf8');

      // Verifica que a casca adota background semântico ou variáveis CSS para permitir que Light Editorial altere as cores
      assert.ok(
        content.includes('var(--color-bg-base)') || content.includes('var(--color-bg-surface)') || content.includes('bg-background'),
        'NavigationShell deve empregar variáveis CSS de tema (--color-bg-base / --color-bg-surface)'
      );
    });

    it('TR-005: globals.css deve conter definições completas de tema e respeito a prefers-reduced-motion', () => {
      const cssContent = readFileSync(cssPath, 'utf8');

      // Validação das variáveis Dark Editorial
      assert.ok(cssContent.includes(':root'), 'Deve conter variáveis padrão em :root');
      assert.ok(cssContent.includes('--color-bg-base:'), 'Deve definir --color-bg-base');
      assert.ok(cssContent.includes('--color-text-primary:'), 'Deve definir --color-text-primary');

      // Validação das variáveis Light Editorial
      assert.ok(cssContent.includes('[data-theme="light"]'), 'Deve conter variáveis para data-theme="light"');
      assert.ok(cssContent.includes('--color-bg-base: #f8fafc') || cssContent.includes('--color-bg-base: #F9F8F5'), 'Light theme deve definir fundo claro');
      assert.ok(cssContent.includes('--color-text-primary: #0f172a') || cssContent.includes('--color-text-primary: #16141A'), 'Light theme deve definir texto escuro');

      // Validação de acessibilidade WCAG 2.2 AA
      assert.ok(cssContent.includes('prefers-reduced-motion'), 'Deve conter suporte a prefers-reduced-motion');
      assert.ok(cssContent.includes(':focus-visible'), 'Deve conter indicador de foco visível para teclado');
    });

    it('TR-006: tailwind.config.ts deve estender as cores semânticas suportando variáveis CSS', () => {
      const twContent = readFileSync(tailwindPath, 'utf8');

      assert.ok(
        twContent.includes('colors') && (twContent.includes('background') || twContent.includes('surface')),
        'tailwind.config.ts deve declarar ou estender tokens de cores semânticas'
      );
    });
  });
});

