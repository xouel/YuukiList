/**
 * YuukiList — Erros de Domínio de Autenticação
 */

export class ValidationError extends Error {
  readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class InvalidCredentialsError extends Error {
  readonly statusCode = 401;
  constructor(message: string = 'Identificador ou senha inválidos') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class UnauthorizedError extends Error {
  readonly statusCode = 401;
  constructor(message: string = 'Acesso não autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class UserAlreadyExistsError extends Error {
  readonly statusCode = 409;
  constructor(message: string = 'Email ou nome de usuário já cadastrado') {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}

