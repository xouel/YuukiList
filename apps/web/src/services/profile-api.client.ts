import type {
  ProfileStatsDto,
  ShareLinkDto,
  SharedProfileViewDto,
  ExportDataDto,
  ShareScope,
} from '@yuukilist/shared';

export class ProfileApiClient {
  async getStats(): Promise<ProfileStatsDto> {
    const res = await fetch('/api/v1/profile/stats', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Falha ao carregar estatísticas do perfil: ${res.statusText}`);
    }
    return res.json();
  }

  async createShareLink(
    expirationDays: number = 30,
    shareScope?: ShareScope
  ): Promise<ShareLinkDto> {
    const res = await fetch('/api/v1/profile/share-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expirationDays, shareScope }),
    });
    if (!res.ok) {
      throw new Error('Falha ao gerar link de compartilhamento');
    }
    return res.json();
  }

  async getActiveShareLinks(): Promise<ShareLinkDto[]> {
    const res = await fetch('/api/v1/profile/share-links', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('Falha ao buscar links ativos');
    }
    return res.json();
  }

  async revokeShareLink(linkId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/v1/profile/share-links/${linkId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error('Falha ao revogar link');
    }
    return res.json();
  }

  async getSharedView(token: string): Promise<SharedProfileViewDto> {
    const res = await fetch(`/api/v1/share/${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Link de compartilhamento expirado ou inexistente');
    }
    return res.json();
  }

  async exportJson(): Promise<Blob> {
    const res = await fetch('/api/v1/profile/export/json', {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error('Falha ao exportar dados em JSON');
    }
    return res.blob();
  }

  async exportCsv(): Promise<Blob> {
    const res = await fetch('/api/v1/profile/export/csv', {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error('Falha ao exportar biblioteca em CSV');
    }
    return res.blob();
  }

  async deleteAccount(consentConfirmed: boolean): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/v1/profile/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consentConfirmed }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Falha ao excluir conta');
    }
    return res.json();
  }
}

export const profileApiClient = new ProfileApiClient();

