/**
 * YuukiList — Validadores de Formulário de Autenticação
 * Conforme Requisitos: User Registration Interface & User Login Interface
 */

import {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  type RegisterDto,
  type LoginDto,
} from '../../../../../packages/shared/src/index.ts';

export interface RegisterFormErrors {
  email?: string;
  username?: string;
  password?: string;
}

export function validateRegisterFields(values: RegisterDto): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!values.email || !values.email.trim()) {
    errors.email = 'O e-mail é obrigatório.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Informe um endereço de e-mail válido (ex.: usuario@exemplo.com).';
  }

  if (!values.username || !values.username.trim()) {
    errors.username = 'O nome de usuário é obrigatório.';
  } else if (!isValidUsername(values.username)) {
    errors.username = 'O nome de usuário deve ter entre 3 e 30 caracteres alfanuméricos, hífen ou sublinhado.';
  }

  if (!values.password) {
    errors.password = 'A senha é obrigatória.';
  } else if (!isValidPassword(values.password)) {
    errors.password = 'A senha deve conter no mínimo 8 caracteres (máximo 128).';
  }

  return errors;
}

export interface LoginFormErrors {
  identifier?: string;
  password?: string;
}

export function validateLoginFields(values: LoginDto): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!values.identifier || !values.identifier.trim()) {
    errors.identifier = 'Informe seu e-mail ou nome de usuário.';
  }

  if (!values.password) {
    errors.password = 'Informe sua senha.';
  }

  return errors;
}

export interface ForgotPasswordFormErrors {
  email?: string;
}

export function validateForgotPasswordFields(values: { email?: string }): ForgotPasswordFormErrors {
  const errors: ForgotPasswordFormErrors = {};

  if (!values.email || !values.email.trim()) {
    errors.email = 'O e-mail é obrigatório.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Informe um endereço de e-mail válido (ex.: usuario@exemplo.com).';
  }

  return errors;
}

export interface ResetPasswordFormErrors {
  password?: string;
  confirmPassword?: string;
}

export function validateResetPasswordFields(values: {
  password?: string;
  confirmPassword?: string;
}): ResetPasswordFormErrors {
  const errors: ResetPasswordFormErrors = {};

  if (!values.password) {
    errors.password = 'A nova senha é obrigatória.';
  } else if (!isValidPassword(values.password)) {
    errors.password = 'A senha deve conter no mínimo 8 caracteres (máximo 128).';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirme sua nova senha.';
  } else if (values.password && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'As senhas informadas não coincidem.';
  }

  return errors;
}

