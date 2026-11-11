// apps/web/src/services/provisional-api.client.ts

import type {
  CreateInclusionRequestDto,
  InclusionRequest,
  SimilarityCheckResponse,
} from '@yuukilist/shared';

export class ProvisionalApiClient {
  async checkSimilarity(title: string): Promise<SimilarityCheckResponse> {
    const res = await fetch('/api/v1/provisional/similarity-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      throw new Error('Falha ao checar similaridade');
    }
    return res.json();
  }

  async createRequest(dto: CreateInclusionRequestDto): Promise<InclusionRequest> {
    const res = await fetch('/api/v1/provisional/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao enviar solicitação');
    }
    return res.json();
  }

  async getMyRequests(): Promise<InclusionRequest[]> {
    const res = await fetch('/api/v1/provisional/requests/my');
    if (!res.ok) {
      return [];
    }
    return res.json();
  }
}

export const provisionalApiClient = new ProvisionalApiClient();

