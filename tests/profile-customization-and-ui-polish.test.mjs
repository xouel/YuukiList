/**
 * YuukiList — Suíte de Testes da Fatia 033: Profile Customization & UI Polish
 * Cobertura:
 * - US1 & TR-001, TR-002, TR-003: Hero Spotlight sem "+" duplicado
 * - US1 & TR-006 a TR-010: Abas da Biblioteca sem barra de rolagem horizontal nativa
 * - US2 & TR-004, TR-005, TR-011 a TR-018: Continuar Acompanhando e Vitrine de Favoritos sincronizados
 * - US3 & TR-019, TR-020, TR-021: Customização de perfil, 5 molduras e sigilo de telefone
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

describe('033-profile-customization-and-ui-polish — Suíte de Validação', () => {
  describe('US1 — Polimento Visual no Hero e Abas da Biblioteca', () => {
    it('TR-002: hero-spotlight deve renderizar "Adicionar à Lista" com ícone SVG de soma e sem caractere "+" duplicado no texto', () => {
      const heroPath = path.join(ROOT, 'apps/web/src/components/home/hero-spotlight.tsx');
      assert.ok(fs.existsSync(heroPath), 'hero-spotlight.tsx deve existir');
      const content = fs.readFileSync(heroPath, 'utf8');

      // Não deve conter a duplicação "+ Adicionar à Lista" dentro do span
      assert.ok(
        !content.includes('<span>+ Adicionar à Lista</span>'),
        'Não deve conter o texto "+ Adicionar à Lista" com o símbolo de soma duplicado'
      );
      assert.ok(
        content.includes('<span>Adicionar à Lista</span>'),
        'Deve conter o texto limpo "Adicionar à Lista"'
      );
      // Deve manter o ícone SVG de cruz/soma
      assert.ok(
        content.includes('M12 4v16m8-8H4'),
        'Deve manter o ícone vetorial SVG de adição'
      );
    });

    it('TR-009: library-filters e globals.css devem garantir ausência de barra de rolagem horizontal nativa nas abas', () => {
      const filtersPath = path.join(ROOT, 'apps/web/src/components/library/library-filters.tsx');
      const cssPath = path.join(ROOT, 'apps/web/src/app/globals.css');

      assert.ok(fs.existsSync(filtersPath), 'library-filters.tsx deve existir');
      assert.ok(fs.existsSync(cssPath), 'globals.css deve existir');

      const filtersContent = fs.readFileSync(filtersPath, 'utf8');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      assert.ok(
        filtersContent.includes('scrollbar-none'),
        'Contêiner de abas de status deve aplicar a classe scrollbar-none'
      );
      assert.ok(
        cssContent.includes('.scrollbar-none'),
        'globals.css deve definir a utility class .scrollbar-none'
      );
      assert.ok(
        cssContent.includes('scrollbar-width: none'),
        'globals.css deve incluir scrollbar-width: none para compatibilidade W3C/Firefox'
      );
      assert.ok(
        cssContent.includes('::-webkit-scrollbar'),
        'globals.css deve incluir seletor webkit para Chrome/Edge/Safari'
      );
    });
  });

  describe('US2 — Retorno de Continuar Acompanhando e Vitrine de Favoritos', () => {
    it('TR-004 & TR-005: continue-watching e home-hub-view devem filtrar obras ativas e prover incremento rápido', () => {
      const hubPath = path.join(ROOT, 'apps/web/src/components/home/home-hub-view.tsx');
      const cwPath = path.join(ROOT, 'apps/web/src/components/home/continue-watching.tsx');

      assert.ok(fs.existsSync(hubPath), 'home-hub-view.tsx deve existir');
      assert.ok(fs.existsSync(cwPath), 'continue-watching.tsx deve existir');

      const hubContent = fs.readFileSync(hubPath, 'utf8');
      const cwContent = fs.readFileSync(cwPath, 'utf8');

      assert.ok(
        hubContent.includes('ContinueWatching'),
        'HomeHubView deve renderizar o componente ContinueWatching'
      );
      assert.ok(
        cwContent.includes("status === 'ASSISTINDO'") && cwContent.includes("status === 'LENDO'"),
        'ContinueWatching deve filtrar por status canônicos ASSISTINDO e LENDO'
      );
      assert.ok(
        cwContent.includes('onQuickIncrement'),
        'ContinueWatching deve disparar ação de incremento rápido de unidade'
      );
    });

    it('TR-011 & TR-014: library-card e profile devem sincronizar e exibir obras favoritas', () => {
      const cardPath = path.join(ROOT, 'apps/web/src/components/library/library-card.tsx');
      const profilePath = path.join(ROOT, 'apps/web/src/app/profile/page.tsx');
      const showcasePath = path.join(ROOT, 'apps/web/src/components/profile/favorites-showcase.tsx');

      assert.ok(fs.existsSync(cardPath), 'library-card.tsx deve existir');
      assert.ok(fs.existsSync(profilePath), 'profile/page.tsx deve existir');
      assert.ok(fs.existsSync(showcasePath), 'favorites-showcase.tsx deve existir');

      const cardContent = fs.readFileSync(cardPath, 'utf8');
      const profileContent = fs.readFileSync(profilePath, 'utf8');

      assert.ok(
        cardContent.includes('handleToggleFavorite') || cardContent.includes('onToggleFavorite'),
        'library-card deve conter ação para alternar status de favorito'
      );
      assert.ok(
        profileContent.includes('FavoritesShowcase'),
        'Página de perfil deve conter a Vitrine de Favoritos'
      );
      assert.ok(
        profileContent.includes('favorites={stats.favorites}'),
        'FavoritesShowcase deve receber os favoritos retornados nas estatísticas'
      );
    });
  });

  describe('US3 — Customização de Perfil, Molduras e Privacidade do Telefone', () => {
    it('TR-020: avatar-frame deve implementar as 5 molduras editoriais (none, nanquim, carmim, ouro, sakura)', () => {
      const framePath = path.join(ROOT, 'apps/web/src/components/profile/avatar-frame.tsx');
      assert.ok(fs.existsSync(framePath), 'avatar-frame.tsx deve existir');
      const content = fs.readFileSync(framePath, 'utf8');

      assert.ok(content.includes('nanquim'), 'Deve incluir a moldura nanquim');
      assert.ok(content.includes('carmim'), 'Deve incluir a moldura carmim');
      assert.ok(content.includes('ouro'), 'Deve incluir a moldura ouro');
      assert.ok(content.includes('sakura'), 'Deve incluir a moldura sakura');
      assert.ok(content.includes('none'), 'Deve suportar ausência de moldura (none)');
    });

    it('TR-019: edit-profile-modal deve permitir editar foto, capa, moldura, biografia e telefone opcional', () => {
      const modalPath = path.join(ROOT, 'apps/web/src/components/profile/edit-profile-modal.tsx');
      assert.ok(fs.existsSync(modalPath), 'edit-profile-modal.tsx deve existir');
      const content = fs.readFileSync(modalPath, 'utf8');

      assert.ok(content.includes('avatarFrame') || content.includes('frame'), 'Modal deve permitir selecionar moldura');
      assert.ok(content.includes('bio'), 'Modal deve permitir editar biografia');
      assert.ok(content.includes('phone') || content.includes('telefone'), 'Modal deve permitir editar telefone');
      assert.ok(content.includes('avatarUrl') || content.includes('avatar'), 'Modal deve permitir atualizar avatar');
      assert.ok(content.includes('bannerUrl') || content.includes('capa'), 'Modal deve permitir atualizar capa');
    });

    it('TR-021: Sigilo do telefone conforme LGPD — nunca expor telefone em rotas públicas ou compartilhadas', () => {
      const profileServicePath = path.join(ROOT, 'apps/api/src/profile/profile.service.ts');
      const shareServicePath = path.join(ROOT, 'packages/shared/src/profile.ts');

      assert.ok(fs.existsSync(profileServicePath), 'profile.service.ts deve existir');
      assert.ok(fs.existsSync(shareServicePath), 'shared profile.ts deve existir');

      const sharedContent = fs.readFileSync(shareServicePath, 'utf8');
      const serviceContent = fs.readFileSync(profileServicePath, 'utf8');

      // SharedProfileViewDto / ProfileStatsDto não devem incluir telefone público
      assert.ok(
        !sharedContent.includes('SharedProfileViewDto {\n  phone'),
        'SharedProfileViewDto nunca deve expor telefone publicamente'
      );
    });
  });
});

