/**
 * YuukiList — Erros de Domínio de Autenticação
 */

import type { AuthConflictField, AuthErrorCode } from '../../../../packages/shared/src/index.ts';

export class ValidationError extends Error {
  readonly statusCode = 400;
  readonly code: AuthErrorCode = 'VALIDATION_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class InvalidCredentialsError extends Error {
  readonly statusCode = 401;
  readonly code: AuthErrorCode = 'INVALID_CREDENTIALS';
  constructor(message: string = 'Usuário/e-mail ou senha incorretos') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class UnauthorizedError extends Error {
  readonly statusCode = 401;
  readonly code: AuthErrorCode = 'UNAUTHORIZED';
  constructor(message: string = 'Acesso não autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class UserAlreadyExistsError extends Error {
  readonly statusCode = 409;
  readonly code: 'EMAIL_ALREADY_EXISTS' | 'USERNAME_ALREADY_EXISTS' | 'USER_ALREADY_EXISTS';
  readonly field?: AuthConflictField;

  constructor(
    message: string = 'Email ou nome de usuário já cadastrado',
    options?: {
      code?: 'EMAIL_ALREADY_EXISTS' | 'USERNAME_ALREADY_EXISTS' | 'USER_ALREADY_EXISTS';
      field?: AuthConflictField;
    }
  ) {
    super(message);
    this.name = 'UserAlreadyExistsError';
    this.field = options?.field;
    this.code =
      options?.code ||
      (options?.field === 'email'
        ? 'EMAIL_ALREADY_EXISTS'
        : options?.field === 'username'
          ? 'USERNAME_ALREADY_EXISTS'
          : 'USER_ALREADY_EXISTS');
  }
}

export class ResetTokenInvalidError extends Error {
  readonly statusCode = 400;
  readonly code: AuthErrorCode = 'RESET_TOKEN_INVALID';
  constructor(message: string = 'Link de redefinição inválido ou expirado. Solicite um novo link.') {
    super(message);
    this.name = 'ResetTokenInvalidError';
  }
}

export class EmailDeliveryConfigError extends Error {
  readonly statusCode = 503;
  readonly code: AuthErrorCode = 'EMAIL_DELIVERY_CONFIG_ERROR';
  constructor(
    message: string = 'Envio de e-mail de recuperação indisponível no momento. Tente novamente mais tarde.'
  ) {
    super(message);
    this.name = 'EmailDeliveryConfigError';
  }
}
