// apps/web/src/services/admin-api.client.ts

import type {
  InclusionRequest,
  ModerateInclusionRequestDto,
  RequestStatus,
} from '@yuukilist/shared';

export class AdminApiClient {
  async listRequests(status?: RequestStatus): Promise<InclusionRequest[]> {
    const url = status
      ? `/api/v1/admin/requests?status=${status}`
      : '/api/v1/admin/requests';
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Acesso negado ao painel administrativo.');
    }
    return res.json();
  }

  async moderateRequest(id: string, dto: ModerateInclusionRequestDto): Promise<InclusionRequest> {
    const res = await fetch(`/api/v1/admin/requests/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao moderar solicitação');
    }
    return res.json();
  }

  async lockFields(id: string, lockedFields: string[]): Promise<any> {
    const res = await fetch(`/api/v1/admin/items/${id}/lock-fields`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lockedFields }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao travar campos');
    }
    return res.json();
  }
}

export const adminApiClient = new AdminApiClient();

