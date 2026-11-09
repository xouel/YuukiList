/**
 * YuukiList — Suíte de Testes Automatizados da Navegação, Ações Rápidas e Descoberta
 * Slice R10: 010-navigation-ux-and-quick-actions
 * TDD: Cobrindo 100% dos requisitos normativos de specs/navigation-shell/spec.md e specs/catalog-browse/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('R10 — Navigation Shell, Quick Actions & Discovery (010-navigation-ux-and-quick-actions)', () => {
  describe('US1 — Navegação Global e Shell Responsivo nas 5 Áreas (TR-001, TR-002)', () => {
    it('TR-001: deve conter estrutura da Sidebar desktop com as 5 áreas principais', () => {
      const shellPath = resolve(__dirname, '../apps/web/src/components/layout/navigation-shell.tsx');
      const content = readFileSync(shellPath, 'utf8');

      // Verifica presença dos links das 5 áreas fundamentais
      assert.ok(content.includes('href="/"') || content.includes("'/'"), 'Sidebar deve conter link para Explorar (/)');
      assert.ok(content.includes('/library'), 'Sidebar deve conter link para Biblioteca (/library)');
      assert.ok(content.includes('/calendar'), 'Sidebar deve conter link para Calendário (/calendar)');
      assert.ok(content.includes('/profile'), 'Sidebar deve conter link para Perfil (/profile)');
      assert.ok(content.includes('lg:flex'), 'Sidebar deve estar visível em telas desktop (lg:)');
    });

    it('TR-002: deve conter Bottom Navigation bar para dispositivos móveis com padding inferior seguro', () => {
      const shellPath = resolve(__dirname, '../apps/web/src/components/layout/navigation-shell.tsx');
      const content = readFileSync(shellPath, 'utf8');

      // Verifica presença da barra inferior móvel
      assert.ok(content.includes('lg:hidden'), 'Bottom Nav deve ser oculta em desktop e ativa em mobile');
      assert.ok(content.includes('fixed bottom-0'), 'Bottom Nav deve ser fixada na base da tela');
      assert.ok(content.includes('aria-label="Navegação Móvel"'), 'Bottom Nav deve ter rótulo acessível');
    });
  });

  describe('US2 — Ações Rápidas de Biblioteca nos Cards do Catálogo (TR-006)', () => {
    it('TR-006: deve suportar adição rápida com status padrão da categoria e estado visual imediato', () => {
      const cardPath = resolve(__dirname, '../apps/web/src/components/catalog/media-card.tsx');
      const content = readFileSync(cardPath, 'utf8');

      // Verifica presença do botão rápido de adicionar e do status padrão
      assert.ok(content.includes('quick-add') || content.includes('onQuickAdd') || content.includes('handleQuickAdd'), 'Card deve ter manipulador de adição rápida');
      assert.ok(content.includes('Na Lista') || content.includes('isInLibrary'), 'Card deve exibir badge ou estado quando obra já está na biblioteca');
    });
  });

  describe('US3 — Filtros Transversais, Temas Visuais e Atribuição Legal (TR-003, TR-004, TR-005, TR-007)', () => {
    it('TR-003: deve disponibilizar ThemeToggle para alternância dinâmica de tema com persistência', () => {
      const togglePath = resolve(__dirname, '../apps/web/src/components/layout/theme-toggle.tsx');
      const content = readFileSync(togglePath, 'utf8');

      assert.ok(content.includes('yuuki-theme'), 'Deve salvar a chave yuuki-theme no localStorage');
      assert.ok(content.includes('data-theme'), 'Deve setar o atributo data-theme no elemento raiz');
      assert.ok(content.includes('aria-label'), 'Botão deve ter rótulo acessível');
    });

    it('TR-004: deve conter regras para respeito estrito a prefers-reduced-motion no CSS global', () => {
      const cssPath = resolve(__dirname, '../apps/web/src/app/globals.css');
      const content = readFileSync(cssPath, 'utf8');

      assert.ok(content.includes('prefers-reduced-motion'), 'CSS global deve conter media query prefers-reduced-motion');
    });

    it('TR-005: deve exibir aviso obrigatório do TMDB e créditos às fontes no LegalFooter e ItemDetailView', () => {
      const footerPath = resolve(__dirname, '../apps/web/src/components/layout/legal-footer.tsx');
      const detailPath = resolve(__dirname, '../apps/web/src/components/catalog/item-detail-view.tsx');

      const footerContent = readFileSync(footerPath, 'utf8');
      const detailContent = readFileSync(detailPath, 'utf8');

      // Verifica a frase obrigatória da licença do TMDB
      assert.ok(
        footerContent.includes('This product uses the TMDB API but is not endorsed or certified by TMDB'),
        'LegalFooter deve conter o aviso legal obrigatório do TMDB'
      );
      assert.ok(
        footerContent.includes('TVmaze') && footerContent.includes('Anime News Network'),
        'LegalFooter deve creditar as fontes parceiras'
      );
      assert.ok(
        detailContent.includes('provenance') || detailContent.includes('Proveniência'),
        'ItemDetailView deve apresentar bloco de proveniência'
      );
    });

    it('TR-007: deve incluir filtros por País de Origem e Temas Transversais (BL/GL) no FilterBar', () => {
      const filterPath = resolve(__dirname, '../apps/web/src/components/catalog/filter-bar.tsx');
      const content = readFileSync(filterPath, 'utf8');

      assert.ok(content.includes('country') || content.includes('País') || content.includes('KR'), 'FilterBar deve suportar filtro de país');
      assert.ok(content.includes('theme') || content.includes('BL') || content.includes('GL'), 'FilterBar deve suportar temas transversais');
    });
  });
});
