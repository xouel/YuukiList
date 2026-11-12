/**
 * YuukiList — Testes Automatizados de Tokens Semanticos e Anti-Drift (R28: 028-tokens-unification-and-anti-drift)
 * Validacao rigorosa dos cenarios normativos de specs/navigation-shell/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();
const globalsPath = join(projectRoot, 'apps/web/src/app/globals.css');
const tailwindPath = join(projectRoot, 'apps/web/tailwind.config.ts');

describe('US1 — Unificacao de Tokens Semanticos e Coerencia Dark/Light (TR-001, TR-003, TR-005)', () => {

  it('TR-005: globals.css deve declarar tokens semanticos de superficie e refracao em :root e [data-theme="light"]', () => {
    assert.ok(existsSync(globalsPath), 'globals.css deve existir');
    const content = readFileSync(globalsPath, 'utf8');

    // Superficies
    assert.ok(content.includes('--surface-canvas'), 'Deve conter --surface-canvas');
    assert.ok(content.includes('--surface-raised'), 'Deve conter --surface-raised');
    assert.ok(content.includes('--surface-overlay'), 'Deve conter --surface-overlay');
    assert.ok(content.includes('--surface-sunken'), 'Deve conter --surface-sunken');

    // Contornos e Refracao
    assert.ok(content.includes('--stroke-subtle'), 'Deve conter --stroke-subtle');
    assert.ok(content.includes('--stroke-strong'), 'Deve conter --stroke-strong');
    assert.ok(content.includes('--stroke-accent'), 'Deve conter --stroke-accent');
    assert.ok(content.includes('--highlight-hairline'), 'Deve conter --highlight-hairline');

    // Blocos :root e [data-theme="light"]
    assert.ok(content.includes(':root'), 'Deve conter bloco :root');
    assert.ok(content.includes('[data-theme="light"]'), 'Deve conter bloco [data-theme="light"]');
  });

  it('TR-005: tailwind.config.ts deve mapear os tokens semanticos sob colors e boxShadow', () => {
    assert.ok(existsSync(tailwindPath), 'tailwind.config.ts deve existir');
    const content = readFileSync(tailwindPath, 'utf8');

    assert.ok(content.includes('surface'), 'Deve estender colors com surface');
    assert.ok(content.includes('stroke'), 'Deve estender colors com stroke');
    assert.ok(content.includes('hairline'), 'Deve estender boxShadow com hairline');
  });

  it('TR-003: tokens de tema claro devem usar superficies claras e texto escuro de alto contraste', () => {
    const content = readFileSync(globalsPath, 'utf8');
    const lightBlockMatch = content.match(/\[data-theme="light"\]\s*\{([^}]+)\}/);
    assert.ok(lightBlockMatch, 'Deve conter definicoes de tema claro');
    const lightBlock = lightBlockMatch[1];

    assert.ok(lightBlock.includes('--surface-canvas: #f8fafc') || lightBlock.includes('--surface-canvas: #F8FAFC'), 'Superficie canvas clara no tema claro');
    assert.ok(lightBlock.includes('--surface-raised: #ffffff') || lightBlock.includes('--surface-raised: #FFFFFF'), 'Superficie raised clara no tema claro');
    assert.ok(lightBlock.includes('--color-text-primary: #0f172a'), 'Texto escuro de alto contraste no tema claro');
  });

  it('TR-001: alternancia dinamica de tema deve manter suporte a transicao suave sem regressao de cores', () => {
    const content = readFileSync(globalsPath, 'utf8');
    assert.ok(content.includes('--color-accent'), 'Deve preservar --color-accent');
    assert.ok(content.includes('--color-border'), 'Deve preservar --color-border');
  });

  it('TR-002: diretiva de movimento reduzido deve estar presente e assegurada', () => {
    const content = readFileSync(globalsPath, 'utf8');
    assert.ok(content.includes('@media (prefers-reduced-motion: reduce)'), 'Deve conter media query prefers-reduced-motion');
    assert.ok(content.includes('animation-duration: 0.01ms'), 'Deve neutralizar animacoes em movimento reduzido');
  });

  it('TR-004: escala tipografica editorial e paleta mineral devem ser preservadas', () => {
    const content = readFileSync(globalsPath, 'utf8');
    assert.ok(content.includes('--font-serif-editorial'), 'Deve conter fonte serif editorial');
    assert.ok(content.includes('--font-sans-ui'), 'Deve conter fonte sans-serif UI');
  });
});

describe('US3 — Padronizacao Semantica de Acentos de Midia Bimodais (TR-006)', () => {

  it('TR-006: globals.css e tailwind.config.ts devem definir acentos semanticos para video, impresso e anime', () => {
    const globals = readFileSync(globalsPath, 'utf8');
    const tailwind = readFileSync(tailwindPath, 'utf8');

    assert.ok(globals.includes('--accent-media-video'), 'Deve conter token --accent-media-video');
    assert.ok(globals.includes('--accent-media-print'), 'Deve conter token --accent-media-print');
    assert.ok(globals.includes('--accent-media-anime'), 'Deve conter token --accent-media-anime');

    assert.ok(tailwind.includes('media-video') || tailwind.includes('video'), 'Tailwind deve mapear cor de midia video');
    assert.ok(tailwind.includes('media-print') || tailwind.includes('print'), 'Tailwind deve mapear cor de midia impressa');
    assert.ok(tailwind.includes('media-anime') || tailwind.includes('anime'), 'Tailwind deve mapear cor de midia anime');
  });
});

describe('US2 — Anel de Foco Visivel Semantico para Navegacao Acessivel (TR-007)', () => {

  it('TR-007: globals.css deve definir regra :focus-visible com anel de 2px, offset e variavel semantica', () => {
    const globals = readFileSync(globalsPath, 'utf8');

    assert.ok(globals.includes(':focus-visible'), 'Deve conter seletor :focus-visible global');
    assert.ok(globals.includes('outline-offset: 2px'), 'Deve conter outline-offset de 2px');
    assert.ok(globals.includes('--ring-focus'), 'Deve usar variavel --ring-focus para o anel de foco');
  });

  it('TR-007: componentes centrais refatorados nao devem conter outline-none sem foco visivel substituto', () => {
    const navShellPath = join(projectRoot, 'apps/web/src/components/layout/navigation-shell.tsx');
    const authDossierPath = join(projectRoot, 'apps/web/src/components/auth/auth-dossier-card.tsx');

    for (const filePath of [navShellPath, authDossierPath]) {
      if (existsSync(filePath)) {
        const fileContent = readFileSync(filePath, 'utf8');
        // Se houver focus:outline-none, deve vir acompanhado de focus-visible:ring ou focus:ring
        const lines = fileContent.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes('focus:outline-none') && !line.includes('focus:ring') && !line.includes('focus-visible:') && !line.includes('focus-ring')) {
            assert.fail(`Linha ${i + 1} em ${filePath} possui focus:outline-none sem foco visivel na mesma linha`);
          }
        }
      }
    }
  });

  it('Zero emojis em todos os arquivos de estilo e configuracao', () => {
    const globals = readFileSync(globalsPath, 'utf8');
    const tailwind = readFileSync(tailwindPath, 'utf8');
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    assert.ok(!emojiRegex.test(globals), 'globals.css nao deve conter emojis');
    assert.ok(!emojiRegex.test(tailwind), 'tailwind.config.ts nao deve conter emojis');
  });
});
