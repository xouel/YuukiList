import type { AuthUserResponse } from '../../../../packages/shared/src/index.ts';

/**
 * Decorator para injeção do usuário autenticado a partir do request.
 */
export function getCurrentUser(req: { user?: AuthUserResponse }): AuthUserResponse | undefined {
  return req.user;
}
