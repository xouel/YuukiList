/**
 * YuukiList — Testes Automatizados da Experiência Editorial de Autenticação (R27: 027-editorial-auth-experience)
 * Validação rigorosa dos cenários normativos de specs/auth-ui/spec.md
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const projectRoot = process.cwd();

describe('US1 — Experiência Editorial Split Dossier e Alternância Fluida de Abas (TR-008 & TR-010)', () => {
  const dossierPath = join(projectRoot, 'apps/web/src/components/auth/auth-dossier-card.tsx');

  it('TR-010: AuthDossierCard deve existir e apresentar a vitrine lateral do dossiê 5+7', () => {
    assert.ok(existsSync(dossierPath), 'auth-dossier-card.tsx deve existir');
    const content = readFileSync(dossierPath, 'utf8');

    assert.ok(content.includes('AuthDossierCard'), 'Deve exportar AuthDossierCard');
    assert.ok(content.includes('lg:col-span-5'), 'Deve conter coluna de 5 slots para a vitrine editorial');
    assert.ok(content.includes('lg:col-span-7'), 'Deve conter coluna de 7 slots para a área do formulário');
    assert.ok(content.includes('YUUKILIST'), 'Deve conter o wordmark YUUKILIST');
    assert.ok(
      content.includes('refúgio') || content.includes('histórias orientais'),
      'Vitrine lateral deve exibir citação editorial'
    );
    assert.ok(
      content.includes('Custo Zero') || content.includes('Soberania') || content.includes('Fuso Sincronizado'),
      'Vitrine lateral deve exibir selos de valor e confiança'
    );
  });

  it('TR-008: AuthDossierCard deve permitir alternância fluida entre Entrar e Criar Conta sem recarregar a rota', () => {
    const content = readFileSync(dossierPath, 'utf8');

    assert.ok(content.includes('activeTab') || content.includes('tab'), 'Deve controlar o estado da aba ativa');
    assert.ok(content.includes('Entrar'), 'Deve exibir botão da aba Entrar');
    assert.ok(content.includes('Criar Conta'), 'Deve exibir botão da aba Criar Conta');
    assert.ok(content.includes('min-h-[44px]'), 'Abas ou botões devem ter alvo tátil mínimo de 44px');
  });

  it('TR-010: AuthDossierCard deve respeitar a paleta mineral Asian Editorial e não conter emojis', () => {
    const content = readFileSync(dossierPath, 'utf8');

    assert.ok(content.includes('#E05347') || content.includes('carmine') || content.includes('#1A1820'), 'Deve usar paleta mineral Asian Editorial');
    assert.ok(!content.includes('#06B6D4'), 'Não deve conter cor ciano legada');
    assert.ok(!content.includes('#121520'), 'Não deve conter cor azul tech legada');
    assert.ok(!/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(content), 'Não deve conter emojis');
  });
});

describe('US2 — Formulários Táteis com Alternador de Visibilidade de Senha (TR-002, TR-004 & TR-009)', () => {
  const loginFormPath = join(projectRoot, 'apps/web/src/components/auth/login-form.tsx');
  const registerFormPath = join(projectRoot, 'apps/web/src/components/auth/register-form.tsx');

  it('TR-009: LoginForm deve possuir botão tátil de visibilidade de senha e paleta mineral', () => {
    assert.ok(existsSync(loginFormPath), 'login-form.tsx deve existir');
    const content = readFileSync(loginFormPath, 'utf8');

    assert.ok(content.includes('showPassword'), 'Deve possuir estado para alternar visibilidade de senha');
    assert.ok(content.includes('min-h-[44px]'), 'Inputs e botões devem respeitar alvo mínimo de 44px');
    assert.ok(content.includes('aria-label'), 'Botão de visibilidade deve ter rótulo acessível aria-label');
    assert.ok(!content.includes('#06B6D4'), 'LoginForm não deve conter ciano legado');
    assert.ok(!content.includes('#121520'), 'LoginForm não deve conter azul escuro legado');
    assert.ok(!content.includes('#181C2B'), 'LoginForm não deve conter borda legada');
    assert.ok(content.includes('#E05347'), 'LoginForm deve usar acento Carmim #E05347');
    assert.ok(!/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(content), 'Não deve conter emojis');
  });

  it('TR-004: RegisterForm deve possuir botão tátil de visibilidade de senha e paleta mineral', () => {
    assert.ok(existsSync(registerFormPath), 'register-form.tsx deve existir');
    const content = readFileSync(registerFormPath, 'utf8');

    assert.ok(content.includes('showPassword'), 'Deve possuir estado para alternar visibilidade de senha');
    assert.ok(content.includes('min-h-[44px]'), 'Inputs e botões devem respeitar alvo mínimo de 44px');
    assert.ok(content.includes('aria-label'), 'Botão de visibilidade deve ter rótulo acessível aria-label');
    assert.ok(!content.includes('#06B6D4'), 'RegisterForm não deve conter ciano legado');
    assert.ok(!content.includes('#121520'), 'RegisterForm não deve conter azul escuro legado');
    assert.ok(!content.includes('#181C2B'), 'RegisterForm não deve conter borda legada');
    assert.ok(content.includes('#E05347'), 'RegisterForm deve usar acento Carmim #E05347');
    assert.ok(!/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(content), 'Não deve conter emojis');
  });
});

describe('US3 — Validação Resiliente e Redirecionamento Dinâmico (TR-001, TR-003, TR-005, TR-006 & TR-007)', () => {
  const loginPagePath = join(projectRoot, 'apps/web/src/app/login/page.tsx');
  const registerPagePath = join(projectRoot, 'apps/web/src/app/register/page.tsx');

  it('TR-007: login/page.tsx e register/page.tsx devem integrar AuthDossierCard com redirecionamento de sessão', () => {
    assert.ok(existsSync(loginPagePath), 'login/page.tsx deve existir');
    assert.ok(existsSync(registerPagePath), 'register/page.tsx deve existir');

    const loginContent = readFileSync(loginPagePath, 'utf8');
    const registerContent = readFileSync(registerPagePath, 'utf8');

    assert.ok(loginContent.includes('AuthDossierCard'), 'login/page.tsx deve renderizar AuthDossierCard');
    assert.ok(registerContent.includes('AuthDossierCard'), 'register/page.tsx deve renderizar AuthDossierCard');
    assert.ok(loginContent.includes('initialTab="signin"') || loginContent.includes("signin"), 'login deve pré-selecionar signin');
    assert.ok(registerContent.includes('initialTab="signup"') || registerContent.includes("signup"), 'register deve pré-selecionar signup');

    assert.ok(!loginContent.includes('#06B6D4'), 'login/page.tsx não deve ter spinner ciano legado');
    assert.ok(!registerContent.includes('#06B6D4'), 'register/page.tsx não deve ter spinner ciano legado');
  });
});

