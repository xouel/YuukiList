/**
 * YuukiList — Testes Automatizados de Autenticação e Sessão (Slice R4: 004-auth-backend)
 * TDD: Cobrindo 100% dos requisitos normativos e cenários de specs/auth-session/spec.md
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  AuthModule,
  AuthService,
  AuthController,
  AuthGuard,
  PasswordService,
  TokenService,
  UsersRepository,
  ValidationError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UnauthorizedError,
  AUTH_COOKIE_NAME,
} from '../apps/api/src/index.ts';

describe('US1 — Cadastro de Usuário e Segurança de Credenciais (TR-001, TR-002, TR-003)', () => {
  let authModule;
  let controller;
  let service;

  beforeEach(() => {
    authModule = new AuthModule();
    controller = authModule.authController;
    service = authModule.authService;
  });

  it('TR-001: deve cadastrar novo usuário com dados válidos e emitir cookie de sessão HttpOnly', async () => {
    const headersMap = {};
    const mockRes = {
      setHeader(name, value) {
        headersMap[name] = value;
      },
    };

    const registerDto = {
      email: 'user@yuukilist.test',
      username: 'yuuki_user',
      password: 'strongPassword123',
    };

    const result = await controller.register(registerDto, mockRes);

    assert.ok(result.user, 'Deve retornar o usuário criado');
    assert.ok(result.user.id, 'Deve conter UUID válido');
    assert.equal(result.user.email, 'user@yuukilist.test');
    assert.equal(result.user.username, 'yuuki_user');
    assert.ok(result.user.createdAt, 'Deve conter data de criação');
    assert.equal(result.user.passwordHash, undefined, 'NUNCA deve expor passwordHash');
    assert.equal(result.user.password, undefined, 'NUNCA deve expor senha pura');

    assert.ok(headersMap['Set-Cookie'], 'Deve emitir cabeçalho Set-Cookie');
    assert.ok(
      headersMap['Set-Cookie'].includes('yuukilist_session='),
      'Cookie deve conter nome yuukilist_session'
    );
    assert.ok(
      headersMap['Set-Cookie'].includes('HttpOnly'),
      'Cookie DEVE possuir flag HttpOnly'
    );
    assert.ok(
      headersMap['Set-Cookie'].includes('SameSite=Lax'),
      'Cookie DEVE possuir flag SameSite=Lax'
    );
  });

  it('TR-002: deve rejeitar tentativa de cadastro com email duplicado (409 Conflict)', async () => {
    await service.register({
      email: 'existente@yuukilist.test',
      username: 'usuario_a',
      password: 'password123',
    });

    await assert.rejects(
      async () => {
        await service.register({
          email: 'EXISTENTE@yuukilist.test', // Testa normalização de email
          username: 'usuario_b',
          password: 'password123',
        });
      },
      (err) => {
        assert.ok(err instanceof UserAlreadyExistsError);
        assert.equal(err.statusCode, 409);
        return true;
      }
    );
  });

  it('TR-002: deve rejeitar tentativa de cadastro com username duplicado (409 Conflict)', async () => {
    await service.register({
      email: 'outro@yuukilist.test',
      username: 'usuario_existente',
      password: 'password123',
    });

    await assert.rejects(
      async () => {
        await service.register({
          email: 'novo@yuukilist.test',
          username: 'USUARIO_EXISTENTE', // Testa normalização de username case-insensitive
          password: 'password123',
        });
      },
      (err) => {
        assert.ok(err instanceof UserAlreadyExistsError);
        assert.equal(err.statusCode, 409);
        return true;
      }
    );
  });

  it('TR-003: deve rejeitar cadastro com dados inválidos ou senha fraca (<8 caracteres)', async () => {
    // 1. Senha fraca (< 8 chars)
    await assert.rejects(
      async () => {
        await service.register({
          email: 'valido@yuukilist.test',
          username: 'valido',
          password: '123',
        });
      },
      (err) => {
        assert.ok(err instanceof ValidationError);
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /senha/i);
        return true;
      }
    );

    // 2. Formato de email inválido
    await assert.rejects(
      async () => {
        await service.register({
          email: 'email-invalido-sem-arroba',
          username: 'valido',
          password: 'password123',
        });
      },
      (err) => {
        assert.ok(err instanceof ValidationError);
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /email/i);
        return true;
      }
    );

    // 3. Formato de username inválido (curto ou com caracteres especiais ilegais)
    await assert.rejects(
      async () => {
        await service.register({
          email: 'valido@yuukilist.test',
          username: 'u', // Muito curto (< 3 chars)
          password: 'password123',
        });
      },
      (err) => {
        assert.ok(err instanceof ValidationError);
        assert.equal(err.statusCode, 400);
        assert.match(err.message, /usuário/i);
        return true;
      }
    );
  });
});

describe('US2 — Autenticação Flexível e Gerenciamento de Sessão (TR-004, TR-005, TR-006)', () => {
  let authModule;
  let controller;
  let service;

  beforeEach(async () => {
    authModule = new AuthModule();
    controller = authModule.authController;
    service = authModule.authService;

    // Cadastra um usuário base para testes de login
    await service.register({
      email: 'autor@yuukilist.test',
      username: 'autor_yuuki',
      password: 'correctPassword123',
    });
  });

  it('TR-004: deve autenticar com sucesso informando o nome de usuário (username)', async () => {
    const headersMap = {};
    const mockRes = {
      setHeader(name, value) {
        headersMap[name] = value;
      },
    };

    const result = await controller.login(
      {
        identifier: 'autor_yuuki',
        password: 'correctPassword123',
      },
      mockRes
    );

    assert.ok(result.user);
    assert.equal(result.user.username, 'autor_yuuki');
    assert.equal(result.user.email, 'autor@yuukilist.test');
    assert.ok(headersMap['Set-Cookie'].includes('yuukilist_session='));
  });

  it('TR-004: deve autenticar com sucesso informando o e-mail (email)', async () => {
    const headersMap = {};
    const mockRes = {
      setHeader(name, value) {
        headersMap[name] = value;
      },
    };

    const result = await controller.login(
      {
        identifier: 'AUTOR@yuukilist.test', // Testa login insensível a maiúsculas
        password: 'correctPassword123',
      },
      mockRes
    );

    assert.ok(result.user);
    assert.equal(result.user.username, 'autor_yuuki');
    assert.ok(headersMap['Set-Cookie'].includes('yuukilist_session='));
  });

  it('TR-005: deve rejeitar credenciais incorretas ou usuário inexistente com 401 Unauthorized', async () => {
    // 1. Senha errada
    await assert.rejects(
      async () => {
        await service.login({
          identifier: 'autor_yuuki',
          password: 'wrongPassword999',
        });
      },
      (err) => {
        assert.ok(err instanceof InvalidCredentialsError);
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /inválid/i);
        return true;
      }
    );

    // 2. Usuário inexistente (com mitigação de enumeração)
    await assert.rejects(
      async () => {
        await service.login({
          identifier: 'usuario_inexistente_xyz',
          password: 'passwordQualquer',
        });
      },
      (err) => {
        assert.ok(err instanceof InvalidCredentialsError);
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /inválid/i);
        return true;
      }
    );
  });

  it('TR-006: deve encerrar a sessão com logout e emitir Set-Cookie expirado (Max-Age=0)', () => {
    const headersMap = {};
    const mockRes = {
      setHeader(name, value) {
        headersMap[name] = value;
      },
    };

    const result = controller.logout(mockRes);

    assert.equal(result.success, true);
    assert.ok(headersMap['Set-Cookie']);
    assert.ok(
      headersMap['Set-Cookie'].includes('Max-Age=0'),
      'Cookie de logout deve ter Max-Age=0 para invalidação imediata'
    );
    assert.ok(
      headersMap['Set-Cookie'].includes('yuukilist_session=;'),
      'Cookie de logout deve ter valor vazio'
    );
  });
});

describe('US3 — Identificação do Usuário e Proteção de Rotas (TR-007, TR-008, TR-009)', () => {
  let authModule;
  let controller;
  let service;
  let guard;
  let registeredUser;
  let validToken;

  beforeEach(async () => {
    authModule = new AuthModule();
    controller = authModule.authController;
    service = authModule.authService;
    guard = authModule.authGuard;

    const authResult = await service.register({
      email: 'perfil@yuukilist.test',
      username: 'usuario_perfil',
      password: 'passwordForte123',
    });

    registeredUser = authResult.user;
    validToken = authResult.token;
  });

  it('TR-007: deve consultar dados do usuário autenticado no endpoint me via cookie', async () => {
    const req = {
      headers: {
        cookie: `yuukilist_session=${validToken}`,
      },
    };

    const userProfile = await controller.getMe(req);

    assert.ok(userProfile);
    assert.equal(userProfile.id, registeredUser.id);
    assert.equal(userProfile.email, 'perfil@yuukilist.test');
    assert.equal(userProfile.username, 'usuario_perfil');
    assert.equal(req.user.id, registeredUser.id, 'Deve injetar user no objeto req');
  });

  it('TR-008: deve bloquear acesso com 401 Unauthorized para requisições sem credenciais ou token inválido', async () => {
    // 1. Sem token
    await assert.rejects(
      async () => {
        await controller.getMe({ headers: {} });
      },
      (err) => {
        assert.ok(err instanceof UnauthorizedError);
        assert.equal(err.statusCode, 401);
        return true;
      }
    );

    // 2. Token adulterado / inválido
    await assert.rejects(
      async () => {
        await controller.getMe({
          headers: {
            cookie: 'yuukilist_session=token_adulterado.invalido.123',
          },
        });
      },
      (err) => {
        assert.ok(err instanceof UnauthorizedError);
        assert.equal(err.statusCode, 401);
        return true;
      }
    );
  });

  it('TR-009: deve autenticar alternativamente via Header Authorization: Bearer <token>', async () => {
    const req = {
      headers: {
        authorization: `Bearer ${validToken}`,
      },
    };

    const userProfile = await controller.getMe(req);

    assert.ok(userProfile);
    assert.equal(userProfile.id, registeredUser.id);
    assert.equal(userProfile.username, 'usuario_perfil');
  });
});

