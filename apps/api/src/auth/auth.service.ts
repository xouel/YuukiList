import crypto from 'node:crypto';
import {
  type RegisterDto,
  type LoginDto,
  type AuthUserResponse,
  type ForgotPasswordDto,
  type ResetPasswordDto,
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
  PasswordResetRepository,
  type IPasswordResetRepository,
} from './password-reset.repository.ts';
import { BrevoEmailService, type IEmailService } from './email.service.ts';
import {
  ValidationError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UnauthorizedError,
  ResetTokenInvalidError,
} from './errors.ts';

function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

export class AuthService {
  private readonly usersRepository: UsersRepository;
  private readonly passwordService: PasswordService;
  private readonly tokenService: TokenService;
  private readonly passwordResetRepository: IPasswordResetRepository;
  private readonly emailService: IEmailService;

  constructor(
    usersRepository: UsersRepository,
    passwordService: PasswordService,
    tokenService: TokenService,
    passwordResetRepository?: IPasswordResetRepository,
    emailService?: IEmailService
  ) {
    this.usersRepository = usersRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
    this.passwordResetRepository = passwordResetRepository || new PasswordResetRepository();
    this.emailService = emailService || new BrevoEmailService();
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
      throw new UserAlreadyExistsError('Este e-mail já está em uso.', {
        code: 'EMAIL_ALREADY_EXISTS',
        field: 'email',
      });
    }

    const existingUsername = await this.usersRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw new UserAlreadyExistsError('Este nome de usuário já está em uso.', {
        code: 'USERNAME_ALREADY_EXISTS',
        field: 'username',
      });
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
      role: userRecord.role,
      avatarUrl: userRecord.avatarUrl ?? null,
      avatarFrame: userRecord.avatarFrame ?? 'none',
      createdAt: userRecord.createdAt,
    };

    const token = this.tokenService.signSession({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      tokenVersion: userRecord.tokenVersion ?? 0,
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
      throw new InvalidCredentialsError('Identificador ou senha inválidos');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      dto.password,
      userRecord.passwordHash
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError('Identificador ou senha inválidos');
    }

    const user: AuthUserResponse = {
      id: userRecord.id,
      email: userRecord.email,
      username: userRecord.username,
      role: userRecord.role,
      avatarUrl: userRecord.avatarUrl ?? null,
      avatarFrame: userRecord.avatarFrame ?? 'none',
      createdAt: userRecord.createdAt,
    };

    const token = this.tokenService.signSession({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      tokenVersion: userRecord.tokenVersion ?? 0,
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
      role: userRecord.role,
      avatarUrl: userRecord.avatarUrl ?? null,
      avatarFrame: userRecord.avatarFrame ?? 'none',
      createdAt: userRecord.createdAt,
    };
  }

  async requestPasswordReset(dto: ForgotPasswordDto): Promise<{ message: string }> {
    if (!dto || typeof dto !== 'object' || !dto.email) {
      throw new ValidationError('O e-mail é obrigatório para recuperação de senha');
    }

    if (!isValidEmail(dto.email)) {
      throw new ValidationError('Formato de email inválido');
    }

    const normalized = normalizeEmail(dto.email);
    const user = await this.usersRepository.findByEmail(normalized);

    // Proteção anti-enumeração: se o usuário existir e não estiver em cooldown, gera token e envia e-mail
    if (user) {
      const isCooldown = await this.passwordResetRepository.hasRecentToken(user.id);
      if (!isCooldown) {
        await this.passwordResetRepository.invalidatePendingTokens(user.id);

        const rawToken = crypto.randomBytes(32).toString('base64url');
        const tokenHash = hashResetToken(rawToken);
        await this.passwordResetRepository.createToken(user.id, tokenHash);

        const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
        const resetLink = `${baseUrl}/reset-password?token=${rawToken}`;

        await this.emailService.send({
          to: user.email,
          subject: 'YuukiList — Redefinição de Senha',
          textContent: `Olá, ${user.username}!\n\nRecebemos uma solicitação para redefinir a senha da sua conta no YuukiList.\n\nPara cadastrar uma nova senha, acesse o link abaixo (válido por 30 minutos):\n${resetLink}\n\nSe você não solicitou a redefinição de senha, desconsidere este e-mail. Sua conta permanece segura.\n\nAtenciosamente,\nEquipe YuukiList`,
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #121115;">
              <h2 style="color: #E05347; margin-bottom: 16px;">YuukiList</h2>
              <p>Olá, <strong>${user.username}</strong>!</p>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta no YuukiList.</p>
              <p style="margin: 24px 0;">
                <a href="${resetLink}" style="background-color: #E05347; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
              </p>
              <p style="font-size: 12px; color: #666666;">Este link é válido por 30 minutos. Se o botão acima não funcionar, copie e cole o endereço abaixo no seu navegador:</p>
              <p style="font-size: 12px; color: #666666; word-break: break-all;">${resetLink}</p>
              <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
              <p style="font-size: 11px; color: #999999;">Se você não solicitou esta redefinição, nenhuma ação é necessária. Sua senha permanece a mesma.</p>
            </div>
          `,
        });
      }
    }

    return {
      message: 'Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.',
    };
  }

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new ResetTokenInvalidError('Token de redefinição inválido ou ausente');
    }

    const tokenHash = hashResetToken(token);
    const validRecord = await this.passwordResetRepository.findValidToken(tokenHash);
    if (!validRecord) {
      throw new ResetTokenInvalidError('Link de redefinição inválido ou expirado');
    }

    return { valid: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    if (!dto || typeof dto !== 'object') {
      throw new ValidationError('Corpo da requisição inválido');
    }

    if (!dto.token || typeof dto.token !== 'string' || !dto.token.trim()) {
      throw new ResetTokenInvalidError('Token de redefinição é obrigatório');
    }

    if (!dto.newPassword || typeof dto.newPassword !== 'string') {
      throw new ValidationError('Nova senha é obrigatória');
    }

    if (!isValidPassword(dto.newPassword)) {
      throw new ValidationError('Senha deve ter no mínimo 8 caracteres (máximo 128)');
    }

    const tokenHash = hashResetToken(dto.token);
    const consumed = await this.passwordResetRepository.consumeToken(tokenHash);
    if (!consumed) {
      throw new ResetTokenInvalidError('Link de redefinição inválido, expirado ou já utilizado');
    }

    const newHash = await this.passwordService.hashPassword(dto.newPassword);
    await this.usersRepository.updatePasswordAndBumpVersion(consumed.userId, newHash);

    return { message: 'Senha redefinida com sucesso.' };
  }
}
