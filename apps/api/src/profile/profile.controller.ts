import { ProfileService } from './profile.service.ts';

export class ProfileController {
  private readonly profileService: ProfileService;

  constructor(profileService: ProfileService) {
    this.profileService = profileService;
  }

  async getStats(userId: string) {
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return this.profileService.getStats(userId);
  }

  async createShareLink(userId: string, body: { expirationDays?: number; shareScope?: any }) {
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return this.profileService.createShareLink(userId, body.expirationDays, body.shareScope);
  }

  async getActiveShareLinks(userId: string) {
    if (!userId) {
      return [];
    }
    return this.profileService.getActiveShareLinks(userId);
  }

  async revokeShareLink(userId: string, linkId: string) {
    if (!userId || !linkId) {
      return { success: false, error: 'Parâmetros inválidos' };
    }
    const revoked = await this.profileService.revokeShareLink(userId, linkId);
    return { success: revoked };
  }

  async getSharedView(token: string) {
    if (!token) {
      throw new Error('Token de compartilhamento ausente');
    }
    return this.profileService.getSharedView(token);
  }

  async exportJson(userId: string) {
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return this.profileService.exportDataJson(userId);
  }

  async exportCsv(userId: string) {
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return this.profileService.exportLibraryCsv(userId);
  }

  async deleteAccount(userId: string, body: { consentConfirmed?: boolean }) {
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return this.profileService.deleteAccount(userId, !!body.consentConfirmed);
  }
}

