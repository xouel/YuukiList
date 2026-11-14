/**
 * YuukiList — Testes TDD de Feedback de Autenticação e Recuperação de Senha
 * Mudança X-Spec: 040-auth-feedback-and-password-recovery
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  AuthModule,
  UsersRepository,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  ResetTokenInvalidError,
  MemoryEmailService,
  AUTH_COOKIE_NAME,
} from '../apps/api/src/index.ts';
import {
  AuthApiClient,
  AuthApiError,
  validateForgotPasswordFields,
  validateResetPasswordFields,
} from '../apps/web/src/index.ts';

describe('US1 — Mensagens Específicas no Cadastro e Login (040-auth-feedback-and-password-recovery)', () => {
  let authModule;

  beforeEach(() => {
    authModule = new AuthModule();
  });

  it('TR-002/TR-003: AuthService.register deve identificar explicitamente colisão de email vs. username', async () => {
    await authModule.authService.register({
      email: 'alice@yuukilist.test',
      username: 'alice_yuuki',
      password: 'strongPassword123',
    });

    await assert.rejects(
      () =>
        authModule.authService.register({
          email: 'ALICE@yuukilist.test',
          username: 'novo_user',
          password: 'strongPassword123',
        }),
      (err) => {
        assert.ok(err instanceof UserAlreadyExistsError);
        assert.equal(err.statusCode, 409);
        assert.equal(err.code, 'EMAIL_ALREADY_EXISTS');
        assert.equal(err.field, 'email');
        assert.match(err.message, /e-?mail/i);
        return true;
      }
    );

    await assert.rejects(
      () =>
        authModule.authService.register({
          email: 'nova@yuukilist.test',
          username: 'ALICE_YUUKI',
          password: 'strongPassword123',
        }),
      (err) => {
        assert.ok(err instanceof UserAlreadyExistsError);
        assert.equal(err.statusCode, 409);
        assert.equal(err.code, 'USERNAME_ALREADY_EXISTS');
        assert.equal(err.field, 'username');
        assert.match(err.message, /usuário/i);
        return true;
      }
    );
  });

  it('TR-005: UsersRepository.create NÃO deve engolir P2002 ou erro de banco em RAM quando Prisma estiver ativo', async () => {
    const repoUniqueErr = new UsersRepository({
      user: {
        create: async () => {
          const err = new Error('Unique constraint failed');
          err.code = 'P2002';
          err.meta = { target: ['normalized_email'] };
          throw err;
        },
      },
    });

    await assert.rejects(
      () =>
        repoUniqueErr.create({
          email: 'dup@yuukilist.test',
          username: 'dup_user',
          passwordHash: 'scrypt:123:abc',
        }),
      (err) => {
        assert.ok(err instanceof UserAlreadyExistsError);
        assert.equal(err.statusCode, 409);
        assert.equal(err.field, 'email');
        assert.equal(err.code, 'EMAIL_ALREADY_EXISTS');
        return true;
      }
    );

    const repoDbDown = new UsersRepository({
      user: {
        create: async () => {
          throw new Error('P1001 connection refused');
        },
      },
    });

    await assert.rejects(
      () =>
        repoDbDown.create({
          email: 'down@yuukilist.test',
          username: 'down_user',
          passwordHash: 'scrypt:123:abc',
        }),
      /persistir usuário|connection refused/i
    );
  });

  it('TR-007/TR-008: AuthApiClient deve preservar field/serverCode no 409 e distinguir 401 vs. 500 no login', async () => {
    const client = new AuthApiClient({
      fetcher: async (input) => {
        const url = String(input);
        if (url.endsWith('/api/v1/auth/register')) {
          return {
            ok: false,
            status: 409,
            json: async () => ({
              message: 'Este nome de usuário já está em uso.',
              code: 'USERNAME_ALREADY_EXISTS',
              field: 'username',
            }),
          };
        }
        if (url.endsWith('/api/v1/auth/login')) {
          return {
            ok: false,
            status: 500,
            json: async () => ({
              message: 'Erro temporário no servidor ao autenticar.',
              code: 'INTERNAL_ERROR',
            }),
          };
        }
        throw new Error('Unexpected URL');
      },
    });

    await assert.rejects(
      () =>
        client.register({
          email: 'ok@yuukilist.test',
          username: 'ocupado',
          password: 'password123',
        }),
      (err) => {
        assert.ok(err instanceof AuthApiError);
        assert.equal(err.statusCode, 409);
        assert.equal(err.code, 'CONFLICT');
        assert.equal(err.serverCode, 'USERNAME_ALREADY_EXISTS');
        assert.equal(err.field, 'username');
        assert.match(err.message, /nome de usuário/i);
        return true;
      }
    );

    await assert.rejects(
      () =>
        client.login({
          identifier: 'user',
          password: 'password123',
        }),
      (err) => {
        assert.ok(err instanceof AuthApiError);
        assert.equal(err.statusCode, 500);
        assert.equal(err.code, 'INTERNAL_ERROR');
        assert.notEqual(err.code, 'INVALID_CREDENTIALS');
        return true;
      }
    );
  });

  it('TR-019/TR-022/TR-023: AuthProvider, RegisterForm, LoginForm e rota login não devem desmontar UI nem mascarar erros', async () => {
    const contextSrc = await fs.readFile(
      path.resolve(process.cwd(), 'apps/web/src/context/auth-context.tsx'),
      'utf8'
    );
    const registerBlock = contextSrc.slice(
      contextSrc.indexOf('const register = useCallback'),
      contextSrc.indexOf('const login = useCallback')
    );
    const loginBlock = contextSrc.slice(
      contextSrc.indexOf('const login = useCallback'),
      contextSrc.indexOf('const logout = useCallback')
    );

    assert.ok(
      !registerBlock.includes('setIsLoading('),
      'AuthProvider.register não deve alternar isLoading global para evitar desmontar o formulário'
    );
    assert.ok(
      !loginBlock.includes('setIsLoading('),
      'AuthProvider.login não deve alternar isLoading global para evitar desmontar o formulário'
    );

    const loginRouteSrc = await fs.readFile(
      path.resolve(process.cwd(), 'apps/web/src/app/api/v1/auth/login/route.ts'),
      'utf8'
    );
    assert.ok(
      loginRouteSrc.includes('err?.statusCode || 500') || loginRouteSrc.includes('err.statusCode || 500'),
      'Rota /api/v1/auth/login não pode mascarar falhas inesperadas com status 401'
    );

    const registerFormSrc = await fs.readFile(
      path.resolve(process.cwd(), 'apps/web/src/components/auth/register-form.tsx'),
      'utf8'
    );
    assert.ok(
      !registerFormSrc.includes("'Email ou nome de usuário já cadastrado no YuukiList.'"),
      'RegisterForm não deve sobrescrever a mensagem específica da API em erro 409'
    );

    const loginFormSrc = await fs.readFile(
      path.resolve(process.cwd(), 'apps/web/src/components/auth/login-form.tsx'),
      'utf8'
    );
    assert.match(loginFormSrc, /forgot-password/, 'LoginForm deve possuir link para /forgot-password');
    assert.match(loginFormSrc, /passwordInputRef|focus\(/, 'LoginForm deve devolver foco à senha em erro 401');
  });
});

describe('US2 & US3 — Recuperação e Redefinição de Senha (040-auth-feedback-and-password-recovery)', () => {
  let memoryEmailService;
  let authModule;

  beforeEach(() => {
    memoryEmailService = new MemoryEmailService();
    authModule = new AuthModule(null, memoryEmailService);
  });

  it('TR-010 & TR-011 & TR-012: requestPasswordReset com e-mail válido, anti-enumeração e cooldown', async () => {
    const user = await authModule.authService.register({
      email: 'recupera@yuukilist.test',
      username: 'recupera_user',
      password: 'initialPassword123',
    });

    // 1. E-mail existente envia email com token
    const res1 = await authModule.authService.requestPasswordReset({
      email: 'recupera@yuukilist.test',
    });
    assert.match(res1.message, /se (este|o) e-mail estiver cadastrado/i);
    assert.equal(memoryEmailService.sentEmails.length, 1);
    const sentEmail = memoryEmailService.sentEmails[0];
    assert.equal(sentEmail.to, 'recupera@yuukilist.test');
    assert.match(sentEmail.htmlContent, /reset-password\?token=[A-Za-z0-9_-]{40,}/);

    // Extrai token do link enviado
    const tokenMatch = sentEmail.htmlContent.match(/reset-password\?token=([A-Za-z0-9_-]+)/);
    assert.ok(tokenMatch, 'Deve conter link com token base64url seguro');
    const rawToken = tokenMatch[1];

    // 2. Cooldown de 60 segundos: segunda chamada não deve reenviar email
    const resCooldown = await authModule.authService.requestPasswordReset({
      email: 'recupera@yuukilist.test',
    });
    assert.match(resCooldown.message, /se (este|o) e-mail estiver cadastrado/i);
    assert.equal(
      memoryEmailService.sentEmails.length,
      1,
      'Não deve disparar novo e-mail dentro do período de cooldown de 60s'
    );

    // 3. E-mail inexistente: resposta idêntica, sem erro e sem e-mail enviado
    memoryEmailService.clear();
    const resInexistente = await authModule.authService.requestPasswordReset({
      email: 'inexistente@yuukilist.test',
    });
    assert.match(resInexistente.message, /se (este|o) e-mail estiver cadastrado/i);
    assert.equal(
      memoryEmailService.sentEmails.length,
      0,
      'Não deve enviar e-mail para endereço não cadastrado (anti-enumeração)'
    );
  });

  it('TR-013 & TR-014 & TR-015 & TR-016: validação, redefinição, consumo único e invalidação de sessão antiga', async () => {
    const registerRes = await authModule.authService.register({
      email: 'redefinir@yuukilist.test',
      username: 'redefinir_user',
      password: 'oldPassword123',
    });

    // Sessão emitida antes da troca de senha
    const oldSessionToken = registerRes.token;
    const oldSessionUser = await authModule.authGuard.validateRequest({
      headers: { authorization: `Bearer ${oldSessionToken}` },
    });
    assert.equal(oldSessionUser.id, registerRes.user.id);

    // Solicita recuperação
    await authModule.authService.requestPasswordReset({
      email: 'redefinir@yuukilist.test',
    });
    assert.equal(memoryEmailService.sentEmails.length, 1);
    const rawToken = memoryEmailService.sentEmails[0].htmlContent.match(
      /reset-password\?token=([A-Za-z0-9_-]+)/
    )[1];

    // TR-013: Validação de token válido
    const validInfo = await authModule.authService.validateResetToken(rawToken);
    assert.equal(validInfo.valid, true);

    // TR-015: Validação de token adulterado ou inexistente
    await assert.rejects(
      () => authModule.authService.validateResetToken('token-falso-adulterado'),
      (err) => {
        assert.ok(err instanceof ResetTokenInvalidError);
        assert.equal(err.statusCode, 400);
        return true;
      }
    );

    // TR-014: Redefinição bem-sucedida de senha
    const resetRes = await authModule.authService.resetPassword({
      token: rawToken,
      newPassword: 'brandNewPassword456',
    });
    assert.match(resetRes.message, /redefinida com sucesso/i);

    // TR-015: Reutilização do token deve falhar (consumo único)
    await assert.rejects(
      () =>
        authModule.authService.resetPassword({
          token: rawToken,
          newPassword: 'anotherPassword789',
        }),
      (err) => {
        assert.ok(err instanceof ResetTokenInvalidError);
        return true;
      }
    );

    // Antiga senha não funciona mais
    await assert.rejects(
      () =>
        authModule.authService.login({
          identifier: 'redefinir@yuukilist.test',
          password: 'oldPassword123',
        }),
      (err) => {
        assert.ok(err instanceof InvalidCredentialsError);
        return true;
      }
    );

    // Nova senha funciona no login
    const newLogin = await authModule.authService.login({
      identifier: 'redefinir@yuukilist.test',
      password: 'brandNewPassword456',
    });
    assert.ok(newLogin.token);

    // TR-016: Sessão JWT antiga deve ser rejeitada após bumping de tokenVersion
    authModule.invalidateUserCache(registerRes.user.id);
    await assert.rejects(
      () =>
        authModule.authGuard.validateRequest({
          headers: { authorization: `Bearer ${oldSessionToken}` },
        }),
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.match(err.message, /Sessão revogada/i);
        return true;
      }
    );
  });

  it('TR-029 & TR-030: validadores clientes de recuperação e redefinição de senha', () => {
    // Forgot Password
    assert.ok(validateForgotPasswordFields({ email: '' }).email);
    assert.ok(validateForgotPasswordFields({ email: 'email-invalido' }).email);
    assert.deepEqual(validateForgotPasswordFields({ email: 'valido@yuukilist.test' }), {});

    // Reset Password
    assert.ok(validateResetPasswordFields({ password: '' }).password);
    assert.ok(validateResetPasswordFields({ password: 'curta' }).password);
    assert.ok(
      validateResetPasswordFields({
        password: 'passwordForte123',
        confirmPassword: 'outraPassword456',
      }).confirmPassword
    );
    assert.deepEqual(
      validateResetPasswordFields({
        password: 'passwordForte123',
        confirmPassword: 'passwordForte123',
      }),
      {}
    );
  });

  it('TR-029 & TR-030 & TR-031: páginas e formulários de recuperação e redefinição seguem requisitos normativos e WCAG', async () => {
    const forgotFormSrc = await fs.readFile(
      path.resolve(process.cwd(), 'apps/web/src/components/auth/forgot-password-form.tsx'),
      'utf8'
    );
    const forgotPageSrc = await fs.readFile(
      path.resolve(process.cwd(), 'apps/web/src/app/forgot-password/page.tsx'),
      'utf8'
    );
    const resetFormSrc = await fs.readFile(
      path.resolve(process.cwd(), 'apps/web/src/components/auth/reset-password-form.tsx'),
      'utf8'
    );
    const resetPageSrc = await fs.readFile(
      path.resolve(process.cwd(), 'apps/web/src/app/reset-password/page.tsx'),
      'utf8'
    );

    assert.match(forgotFormSrc, /requestPasswordReset/, 'ForgotPasswordForm deve chamar authApiClient.requestPasswordReset');
    assert.match(forgotFormSrc, /caixa de entrada.*spam/i, 'ForgotPasswordForm deve orientar verificar caixa de entrada e spam');
    assert.match(forgotPageSrc, /ForgotPasswordForm/, 'Página /forgot-password deve renderizar ForgotPasswordForm');

    assert.match(resetFormSrc, /validateResetToken/, 'ResetPasswordForm deve validar o token na abertura');
    assert.match(resetFormSrc, /resetPassword/, 'ResetPasswordForm deve submeter redefinição de senha');
    assert.match(resetFormSrc, /\/login\?reset=success/, 'ResetPasswordForm deve redirecionar para /login?reset=success');
    assert.match(resetFormSrc, /\/forgot-password/, 'ResetPasswordForm deve oferecer atalho para solicitar novo link');
    assert.match(resetFormSrc, /w-11 h-11/, 'ResetPasswordForm deve manter alvos táteis de 44px no alternador de visibilidade');
    assert.match(resetPageSrc, /<Suspense/, 'Página /reset-password deve envolver useSearchParams() em <Suspense>');
  });
});

