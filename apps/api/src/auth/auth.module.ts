import { PasswordService } from './password.service.ts';
import { TokenService } from './token.service.ts';
import { UsersRepository } from './users.repository.ts';
import { AuthService } from './auth.service.ts';
import { AuthGuard } from './auth.guard.ts';
import { AuthController } from './auth.controller.ts';

export class AuthModule {
  readonly passwordService: PasswordService;
  readonly tokenService: TokenService;
  readonly usersRepository: UsersRepository;
  readonly authService: AuthService;
  readonly authGuard: AuthGuard;
  readonly authController: AuthController;

  constructor() {
    this.passwordService = new PasswordService();
    this.tokenService = new TokenService();
    this.usersRepository = new UsersRepository();
    this.authService = new AuthService(
      this.usersRepository,
      this.passwordService,
      this.tokenService
    );
    this.authGuard = new AuthGuard(this.tokenService, this.usersRepository);
    this.authController = new AuthController(this.authService, this.authGuard);
  }
}

