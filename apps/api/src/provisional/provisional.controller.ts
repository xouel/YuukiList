// apps/api/src/provisional/provisional.controller.ts

import { ProvisionalService } from './provisional.service.ts';
import type { CreateInclusionRequestDto } from '../../../../packages/shared/src/index.ts';

export class ProvisionalController {
  private readonly provisionalService: ProvisionalService;

  constructor(provisionalService: ProvisionalService) {
    this.provisionalService = provisionalService;
  }

  async checkSimilarity(title: string) {
    return this.provisionalService.checkSimilarity(title);
  }

  async createRequest(
    userId: string,
    username: string,
    dto: CreateInclusionRequestDto
  ) {
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    return this.provisionalService.createRequest(userId, username, dto);
  }

  async getMyRequests(userId: string) {
    if (!userId) {
      return [];
    }
    return this.provisionalService.getMyRequests(userId);
  }

  async getRequestById(id: string) {
    const request = await this.provisionalService.getRequestById(id);
    if (!request) {
      return { statusCode: 404, message: 'Solicitação não encontrada.' };
    }
    return request;
  }
}
