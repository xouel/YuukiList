/**
 * YuukiList — Controller REST do Diário Pessoal e Histórico
 * Endpoints sob /api/v1/diary protegidos por AuthGuard
 */

import type {
  CreateHistoryEventDto,
  UpdateHistoryEventDto,
  HistoryFilterDto,
  HistoryEventDto,
} from '../../../../packages/shared/src/index.ts';
import { AuthGuard } from '../auth/auth.guard.ts';
import { DiaryService } from './diary.service.ts';

export class DiaryController {
  private readonly diaryService: DiaryService;
  private readonly authGuard: AuthGuard;

  constructor(diaryService: DiaryService, authGuard: AuthGuard) {
    this.diaryService = diaryService;
    this.authGuard = authGuard;
  }

  async list(req: any, query: HistoryFilterDto = {}): Promise<HistoryEventDto[]> {
    const user = await this.authGuard.validateRequest(req);
    return this.diaryService.listEvents(user.id, query, user.id);
  }

  async create(req: any, body: CreateHistoryEventDto): Promise<HistoryEventDto> {
    const user = await this.authGuard.validateRequest(req);
    return this.diaryService.createEvent(user.id, body);
  }

  async update(
    req: any,
    id: string,
    body: UpdateHistoryEventDto
  ): Promise<HistoryEventDto> {
    const user = await this.authGuard.validateRequest(req);
    return this.diaryService.updateEvent(user.id, id, body);
  }

  async remove(req: any, id: string): Promise<{ success: boolean }> {
    const user = await this.authGuard.validateRequest(req);
    return this.diaryService.deleteEvent(user.id, id);
  }
}

