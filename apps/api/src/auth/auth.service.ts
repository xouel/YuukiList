import {
  type RegisterDto,
  type LoginDto,
  type AuthUserResponse,
  isValidEmail,
  isValidUsername,
  isValidPassword,
  normalizeEmail,
  normalizeUsername,
} from '../../../../packages/shared/src/index.ts';
import { UsersRepository } from './users.repository.ts';
import { PasswordService } from './password.service.ts';
import { TokenService } from './token.service.ts';
import {
  ValidationError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UnauthorizedError,
} from './errors.ts';

export class AuthService {
  private readonly usersRepository: UsersRepository;
  private readonly passwordService: PasswordService;
  private readonly tokenService: TokenService;

  constructor(
    usersRepository: UsersRepository,
    passwordService: PasswordService,
    tokenService: TokenService
  ) {
    this.usersRepository = usersRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  async register(dto: RegisterDto): Promise<{
    user: AuthUserResponse;
    token: string;
    cookie: string;
  }> {
    if (!dto || typeof dto !== 'object') {
      throw new ValidationError('Corpo da requisição inválido');
    }

    if (!isValidEmail(dto.email)) {
      throw new ValidationError('Formato de email inválido');
    }

    if (!isValidUsername(dto.username)) {
      throw new ValidationError(
        'Formato de nome de usuário inválido (3-30 caracteres alfanuméricos, hífen ou sublinhado)'
      );
    }

    if (!isValidPassword(dto.password)) {
      throw new ValidationError('Senha deve ter no mínimo 8 caracteres (máximo 128)');
    }

    const existingEmail = await this.usersRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new UserAlreadyExistsError('Email já está em uso por outro usuário');
    }

    const existingUsername = await this.usersRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw new UserAlreadyExistsError('Nome de usuário já está em uso');
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);
    const userRecord = await this.usersRepository.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
    });

    const user: AuthUserResponse = {
      id: userRecord.id,
      email: userRecord.email,
      username: userRecord.username,
      createdAt: userRecord.createdAt,
    };

    const token = this.tokenService.signSession({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    const cookie = this.tokenService.createSessionCookie(token);

    return { user, token, cookie };
  }

  async login(dto: LoginDto): Promise<{
    user: AuthUserResponse;
    token: string;
    cookie: string;
  }> {
    if (!dto || typeof dto !== 'object') {
      throw new ValidationError('Corpo da requisição inválido');
    }

    if (!dto.identifier || typeof dto.identifier !== 'string' || !dto.identifier.trim()) {
      throw new ValidationError('Identificador (email ou username) é obrigatório');
    }

    if (!dto.password || typeof dto.password !== 'string') {
      throw new ValidationError('Senha é obrigatória');
    }

    const userRecord = await this.usersRepository.findByIdentifier(dto.identifier);

    if (!userRecord) {
      // Mitigação de enumeração: executa verificação fictícia para tempo constante
      await this.passwordService.dummyVerify(dto.password);
      throw new InvalidCredentialsError('Credenciais inválidas');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      dto.password,
      userRecord.passwordHash
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError('Credenciais inválidas');
    }

    const user: AuthUserResponse = {
      id: userRecord.id,
      email: userRecord.email,
      username: userRecord.username,
      createdAt: userRecord.createdAt,
    };

    const token = this.tokenService.signSession({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    const cookie = this.tokenService.createSessionCookie(token);

    return { user, token, cookie };
  }

  logout(): { success: boolean; cookie: string } {
    const cookie = this.tokenService.createLogoutCookie();
    return { success: true, cookie };
  }

  async getMe(userId: string): Promise<AuthUserResponse> {
    if (!userId || typeof userId !== 'string') {
      throw new UnauthorizedError('Sessão inválida');
    }

    const userRecord = await this.usersRepository.findById(userId);
    if (!userRecord) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    return {
      id: userRecord.id,
      email: userRecord.email,
      username: userRecord.username,
      createdAt: userRecord.createdAt,
    };
  }
}
