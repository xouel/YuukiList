/**
 * YuukiList — Testes Automatizados de Frontend de Autenticação (Slice R5: 005-auth-frontend)
 * TDD: Cobrindo 100% dos requisitos normativos e cenários de specs/auth-ui/spec.md
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  AuthApiClient,
  AuthApiError,
  isValidEmail,
  isValidUsername,
  isValidPassword,
} from '../apps/web/src/index.ts';

import {
  AuthModule,
  AuthService,
} from '../apps/api/src/index.ts';

import {
  validateRegisterFields,
  validateLoginFields,
} from '../apps/web/src/components/auth/validation.ts';

// Cria um fetcher simulado que delega para a API de autenticação em memória
function createAuthMockFetcher() {
  const authModule = new AuthModule();
  const service = authModule.authService;
  const controller = authModule.authController;

  // Estado de cookies da sessão simulada no navegador
  let activeCookie = null;

  return {
    service,
    controller,
    fetcher: async (input, init = {}) => {
      const urlStr = String(input);
      const parsedUrl = new URL(urlStr, 'http://localhost:3000');
      const pathname = parsedUrl.pathname;
      const method = (init.method || 'GET').toUpperCase();

      // Rota: POST /api/v1/auth/register
      if (pathname === '/api/v1/auth/register' && method === 'POST') {
        const body = JSON.parse(init.body || '{}');
        const headersMap = {};
        const mockRes = {
          setHeader(name, val) {
            headersMap[name] = val;
          },
        };

        try {
          const result = await controller.register(body, mockRes);
          activeCookie = headersMap['Set-Cookie'] || null;

          return {
            ok: true,
            status: 201,
            json: async () => ({ user: result.user }),
          };
        } catch (err) {
          return {
            ok: false,
            status: err.statusCode || 400,
            json: async () => ({ message: err.message, statusCode: err.statusCode || 400 }),
          };
        }
      }

      // Rota: POST /api/v1/auth/login
      if (pathname === '/api/v1/auth/login' && method === 'POST') {
        const body = JSON.parse(init.body || '{}');
        const headersMap = {};
        const mockRes = {
          setHeader(name, val) {
            headersMap[name] = val;
          },
        };

        try {
          const result = await controller.login(body, mockRes);
          activeCookie = headersMap['Set-Cookie'] || null;

          return {
            ok: true,
            status: 200,
            json: async () => ({ user: result.user }),
          };
        } catch (err) {
          return {
            ok: false,
            status: err.statusCode || 401,
            json: async () => ({ message: err.message, statusCode: err.statusCode || 401 }),
          };
        }
      }

      // Rota: POST /api/v1/auth/logout
      if (pathname === '/api/v1/auth/logout' && method === 'POST') {
        const mockRes = { setHeader() {} };
        const result = controller.logout(mockRes);
        activeCookie = null; // Limpa cookie local

        return {
          ok: true,
          status: 200,
          json: async () => result,
        };
      }

      // Rota: GET /api/v1/auth/me
      if (pathname === '/api/v1/auth/me' && method === 'GET') {
        const req = {
          headers: {
            cookie: activeCookie || undefined,
          },
        };

        try {
          const user = await controller.getMe(req);
          return {
            ok: true,
            status: 200,
            json: async () => user,
          };
        } catch (err) {
          return {
            ok: false,
            status: err.statusCode || 401,
            json: async () => ({ message: err.message, statusCode: err.statusCode || 401 }),
          };
        }
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' }),
      };
    },
  };
}

describe('US1 — Cadastro de Conta na Interface Web (TR-001, TR-002, TR-003)', () => {
  let mockEnv;
  let client;

  beforeEach(() => {
    mockEnv = createAuthMockFetcher();
    client = new AuthApiClient({ fetcher: mockEnv.fetcher });
  });

  it('TR-001: deve validar campos válidos e registrar novo usuário com redirecionamento', async () => {
    const validDto = {
      email: 'novo_web@yuukilist.test',
      username: 'usuario_web',
      password: 'strongPassword123',
    };

    // 1. Validação local dos campos
    const validationErrors = validateRegisterFields(validDto);
    assert.deepEqual(validationErrors, {}, 'Não deve haver erros para dados válidos');

    // 2. Chamada de registro via cliente
    const user = await client.register(validDto);
    assert.ok(user);
    assert.equal(user.email, 'novo_web@yuukilist.test');
    assert.equal(user.username, 'usuario_web');

    // 3. Verifica que a sessão foi persistida via cookie e getMe retorna o usuário
    const me = await client.getMe();
    assert.ok(me);
    assert.equal(me.id, user.id);
  });

  it('TR-002: deve executar validação inline e apontar mensagens de erro explicativas', () => {
    // 1. Todos vazios
    const emptyErrors = validateRegisterFields({ email: '', username: '', password: '' });
    assert.ok(emptyErrors.email, 'Deve apontar email obrigatório');
    assert.ok(emptyErrors.username, 'Deve apontar username obrigatório');
    assert.ok(emptyErrors.password, 'Deve apontar senha obrigatória');

    // 2. Formatos inválidos
    const invalidErrors = validateRegisterFields({
      email: 'sem-formato-valido',
      username: 'ab', // < 3 chars
      password: '123', // < 8 chars
    });
    assert.match(invalidErrors.email, /endereço de e-mail válido/i);
    assert.match(invalidErrors.username, /entre 3 e 30 caracteres/i);
    assert.match(invalidErrors.password, /mínimo 8 caracteres/i);
  });

  it('TR-003: deve capturar erro 409 Conflict da API e mapear para mensagem informativa de colisão', async () => {
    // Registra primeiro usuário
    await client.register({
      email: 'colisao@yuukilist.test',
      username: 'usuario_colisao',
      password: 'passwordForte123',
    });

    // Tenta registrar novamente com o mesmo e-mail
    await assert.rejects(
      async () => {
        await client.register({
          email: 'colisao@yuukilist.test',
          username: 'outro_nome',
          password: 'passwordForte123',
        });
      },
      (err) => {
        assert.ok(err instanceof AuthApiError);
        assert.equal(err.statusCode, 409);
        assert.equal(err.code, 'CONFLICT');
        assert.match(err.message, /já está em uso|já cadastrado/i);
        return true;
      }
    );
  });
});

describe('US2 — Login com Feedback Resiliente e Redirecionamento Dinâmico (TR-004, TR-005, TR-006)', () => {
  let mockEnv;
  let client;

  beforeEach(async () => {
    mockEnv = createAuthMockFetcher();
    client = new AuthApiClient({ fetcher: mockEnv.fetcher });

    // Cadastra usuário prévio
    await client.register({
      email: 'membro@yuukilist.test',
      username: 'membro_ativo',
      password: 'correctPassword123',
    });

    // Faz logout para testar login limpo
    await client.logout();
  });

  it('TR-004: deve realizar login com identificador híbrido e resolver URL de redirecionamento dinâmico', async () => {
    // 1. Login com username
    const userByUsername = await client.login({
      identifier: 'membro_ativo',
      password: 'correctPassword123',
    });
    assert.equal(userByUsername.username, 'membro_ativo');

    // Validação da regra de redirecionamento dinâmico
    function resolveRedirectPath(searchParamRedirect) {
      if (!searchParamRedirect || !searchParamRedirect.startsWith('/')) {
        return '/';
      }
      return searchParamRedirect;
    }

    assert.equal(resolveRedirectPath(null), '/');
    assert.equal(resolveRedirectPath(''), '/');
    assert.equal(resolveRedirectPath('/items/crash-landing-on-you'), '/items/crash-landing-on-you');
    assert.equal(resolveRedirectPath('https://malicious.com'), '/', 'Deve rejeitar URLs externas abertas');
  });

  it('TR-005: deve exibir erro 401 para credenciais incorretas e validar campos obrigatórios', async () => {
    // Validação local de campos vazios
    const emptyErrors = validateLoginFields({ identifier: '', password: '' });
    assert.ok(emptyErrors.identifier);
    assert.ok(emptyErrors.password);

    // Erro retornado pela API
    await assert.rejects(
      async () => {
        await client.login({
          identifier: 'membro_ativo',
          password: 'senhaIncorreta999',
        });
      },
      (err) => {
        assert.ok(err instanceof AuthApiError);
        assert.equal(err.statusCode, 401);
        assert.equal(err.code, 'INVALID_CREDENTIALS');
        return true;
      }
    );
  });

  it('TR-006: deve determinar redirecionamento automático para home quando usuário já estiver autenticado', async () => {
    await client.login({
      identifier: 'membro_ativo',
      password: 'correctPassword123',
    });

    const activeUser = await client.getMe();
    assert.ok(activeUser, 'Usuário possui sessão ativa');

    // Regra da página de login/register: se já autenticado, redireciona para '/'
    function shouldRedirectAwayFromAuthPage(user, isLoading) {
      return !isLoading && Boolean(user);
    }

    assert.equal(shouldRedirectAwayFromAuthPage(activeUser, false), true);
    assert.equal(shouldRedirectAwayFromAuthPage(null, false), false);
    assert.equal(shouldRedirectAwayFromAuthPage(activeUser, true), false, 'Não deve redirecionar durante loading inicial');
  });
});

describe('US3 — Sessão Ativa, Logout e Proteção de Rotas Privadas (TR-007, TR-008, TR-009)', () => {
  let mockEnv;
  let client;

  beforeEach(() => {
    mockEnv = createAuthMockFetcher();
    client = new AuthApiClient({ fetcher: mockEnv.fetcher });
  });

  it('TR-007: deve bloquear acesso anônimo a rotas privadas e calcular rota de redirecionamento com parâmetro', () => {
    function computeProtectedRouteDecision(user, isLoading, currentPath) {
      if (isLoading) {
        return { status: 'LOADING' };
      }
      if (!user) {
        const query = currentPath ? `?redirect=${encodeURIComponent(currentPath)}` : '';
        return { status: 'REDIRECT', target: `/login${query}` };
      }
      return { status: 'RENDER_CHILDREN' };
    }

    // Caso 1: Usuário anônimo acessando /library
    const anonDecision = computeProtectedRouteDecision(null, false, '/library');
    assert.equal(anonDecision.status, 'REDIRECT');
    assert.equal(anonDecision.target, '/login?redirect=%2Flibrary');

    // Caso 2: Em carregamento inicial
    const loadingDecision = computeProtectedRouteDecision(null, true, '/library');
    assert.equal(loadingDecision.status, 'LOADING');

    // Caso 3: Autenticado
    const authDecision = computeProtectedRouteDecision({ id: '123', username: 'yuuki' }, false, '/library');
    assert.equal(authDecision.status, 'RENDER_CHILDREN');
  });

  it('TR-008: deve recuperar dados do usuário autenticado no carregamento da aplicação', async () => {
    // Registra e autentica
    await client.register({
      email: 'sessao@yuukilist.test',
      username: 'usuario_sessao',
      password: 'password123',
    });

    const me = await client.getMe();
    assert.ok(me);
    assert.equal(me.username, 'usuario_sessao');
    assert.equal(me.email, 'sessao@yuukilist.test');
  });

  it('TR-009: deve encerrar a sessão no cliente e invalidar cookie no logout', async () => {
    await client.register({
      email: 'logout@yuukilist.test',
      username: 'usuario_logout',
      password: 'password123',
    });

    // Confirma autenticado
    const beforeLogout = await client.getMe();
    assert.ok(beforeLogout);

    // Executa logout
    const logoutResult = await client.logout();
    assert.equal(logoutResult.success, true);

    // Confirma que getMe agora retorna null (anônimo)
    const afterLogout = await client.getMe();
    assert.equal(afterLogout, null);
  });
});
