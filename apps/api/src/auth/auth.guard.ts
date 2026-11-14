import type { AuthUserResponse } from '../../../../packages/shared/src/index.ts';
import { TokenService } from './token.service.ts';
import { UsersRepository } from './users.repository.ts';
import { UnauthorizedError } from './errors.ts';

export class AuthGuard {
  private readonly tokenService: TokenService;
  private readonly usersRepository: UsersRepository;
  private readonly userCache = new Map<string, { user: AuthUserResponse; tokenVersion: number; expiresAt: number }>();
  private readonly cacheTtlMs: number;

  constructor(tokenService: TokenService, usersRepository: UsersRepository, cacheTtlMs = 45_000) {
    this.tokenService = tokenService;
    this.usersRepository = usersRepository;
    this.cacheTtlMs = cacheTtlMs;
  }

  invalidateUserCache(userId: string): void {
    if (!userId) return;
    this.userCache.delete(userId);
  }

  invalidateRequestUser(req?: {
    headers?: Record<string, string | string[] | undefined>;
    cookies?: Record<string, string>;
  }): void {
    if (!req) return;
    const token = this.tokenService.extractToken(req.headers || {}, req.cookies);
    if (!token) return;
    const payload = this.tokenService.verifySession(token);
    if (payload?.sub) {
      this.userCache.delete(payload.sub);
    }
  }

  clearUserCache(): void {
    this.userCache.clear();
  }

  async validateRequest(
    req: {
      headers?: Record<string, string | string[] | undefined>;
      cookies?: Record<string, string>;
      user?: AuthUserResponse;
    },
    options?: { bypassCache?: boolean }
  ): Promise<AuthUserResponse> {
    const headers = req.headers || {};
    const cookies = req.cookies;
    const token = this.tokenService.extractToken(headers, cookies);

    if (!token) {
      throw new UnauthorizedError('Token de sessão ausente');
    }

    const payload = this.tokenService.verifySession(token);
    if (!payload) {
      throw new UnauthorizedError('Token de sessão inválido ou expirado');
    }

    const now = Date.now();
    const tokenVersionInPayload = payload.tokenVersion ?? 0;
    const cached = options?.bypassCache ? undefined : this.userCache.get(payload.sub);
    if (cached && cached.expiresAt > now && cached.tokenVersion === tokenVersionInPayload) {
      const authUser: AuthUserResponse = { ...cached.user };
      req.user = authUser;
      return authUser;
    }

    const user = await this.usersRepository.findById(payload.sub);
    if (!user) {
      this.userCache.delete(payload.sub);
      throw new UnauthorizedError('Usuário associado à sessão não existe');
    }

    const currentTokenVersion = user.tokenVersion ?? 0;
    if (currentTokenVersion !== tokenVersionInPayload) {
      this.userCache.delete(payload.sub);
      throw new UnauthorizedError('Sessão revogada após redefinição de senha');
    }

    const authUser: AuthUserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl ?? null,
      avatarFrame: user.avatarFrame ?? 'none',
      createdAt: user.createdAt,
    };

    if (this.cacheTtlMs > 0) {
      this.userCache.set(payload.sub, {
        user: authUser,
        tokenVersion: currentTokenVersion,
        expiresAt: now + this.cacheTtlMs,
      });
    }

    req.user = authUser;
    return authUser;
  }
}
