import type { AuthUserResponse } from '../../../../packages/shared/src/index.ts';
import { TokenService } from './token.service.ts';
import { UsersRepository } from './users.repository.ts';
import { UnauthorizedError } from './errors.ts';

export class AuthGuard {
  private readonly tokenService: TokenService;
  private readonly usersRepository: UsersRepository;

  constructor(tokenService: TokenService, usersRepository: UsersRepository) {
    this.tokenService = tokenService;
    this.usersRepository = usersRepository;
  }

  async validateRequest(req: {
    headers?: Record<string, string | string[] | undefined>;
    cookies?: Record<string, string>;
    user?: AuthUserResponse;
  }): Promise<AuthUserResponse> {
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

    const user = await this.usersRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('Usuário associado à sessão não existe');
    }

    const authUser: AuthUserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };

    req.user = authUser;
    return authUser;
  }
}
