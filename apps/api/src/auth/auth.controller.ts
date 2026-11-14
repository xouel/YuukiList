import type {
  RegisterDto,
  LoginDto,
  AuthUserResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../../../../packages/shared/src/index.ts';
import { AuthService } from './auth.service.ts';
import { AuthGuard } from './auth.guard.ts';

export class AuthController {
  private readonly authService: AuthService;
  private readonly authGuard: AuthGuard;

  constructor(authService: AuthService, authGuard: AuthGuard) {
    this.authService = authService;
    this.authGuard = authGuard;
  }

  async register(
    dto: RegisterDto,
    res?: { setHeader?(name: string, value: string): void }
  ): Promise<{ user: AuthUserResponse; cookie: string }> {
    const result = await this.authService.register(dto);
    if (res?.setHeader) {
      res.setHeader('Set-Cookie', result.cookie);
    }
    return { user: result.user, cookie: result.cookie };
  }

  async login(
    dto: LoginDto,
    res?: { setHeader?(name: string, value: string): void }
  ): Promise<{ user: AuthUserResponse; cookie: string }> {
    const result = await this.authService.login(dto);
    if (res?.setHeader) {
      res.setHeader('Set-Cookie', result.cookie);
    }
    return { user: result.user, cookie: result.cookie };
  }

  logout(
    res?: { setHeader?(name: string, value: string): void },
    req?: {
      headers?: Record<string, string | string[] | undefined>;
      cookies?: Record<string, string>;
    }
  ): { success: boolean; cookie: string } {
    this.authGuard.invalidateRequestUser(req);
    const result = this.authService.logout();
    if (res?.setHeader) {
      res.setHeader('Set-Cookie', result.cookie);
    }
    return result;
  }

  async getMe(
    req: {
      headers?: Record<string, string | string[] | undefined>;
      cookies?: Record<string, string>;
      user?: AuthUserResponse;
    },
    options?: { bypassCache?: boolean }
  ): Promise<AuthUserResponse> {
    const user = await this.authGuard.validateRequest(req, options);
    return user;
  }

  async requestPasswordReset(dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.requestPasswordReset(dto);
  }

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    return this.authService.validateResetToken(token);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }
}
