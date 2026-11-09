export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  username: string;
  createdAt: string | Date;
}

export interface SessionPayload {
  sub: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

export const AUTH_COOKIE_NAME = 'yuukilist_session';
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 255) return false;
  // Expressão regular RFC-5322 simplificada
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

export function isValidUsername(username: string): boolean {
  if (typeof username !== 'string') return false;
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 30) return false;
  // Apenas letras, números, sublinhado e hífen
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return usernameRegex.test(trimmed);
}

export function isValidPassword(password: string): boolean {
  if (typeof password !== 'string') return false;
  // Mínimo de 8 caracteres e máximo de 128 (contra DoS em hashing)
  return password.length >= 8 && password.length <= 128;
}

