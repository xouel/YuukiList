// apps/api/src/admin/admin.controller.ts

import { AdminService } from './admin.service.ts';
import type { ModerateInclusionRequestDto, LockFieldsDto, RequestStatus } from '../../../../packages/shared/src/index.ts';

export class AdminController {
  private readonly adminService: AdminService;

  constructor(adminService: AdminService) {
    this.adminService = adminService;
  }

  async listRequests(userRole?: string, status?: RequestStatus) {
    return this.adminService.listRequests(userRole, status);
  }

  async moderateRequest(
    adminUserId: string,
    adminRole: string | undefined,
    id: string,
    dto: ModerateInclusionRequestDto
  ) {
    if (!adminUserId) {
      throw new Error('Usuário não autenticado');
    }
    return this.adminService.moderateRequest(adminUserId, adminRole, id, dto);
  }

  async lockFields(
    adminRole: string | undefined,
    id: string,
    dto: LockFieldsDto
  ) {
    return this.adminService.lockFields(adminRole, id, dto.lockedFields || []);
  }
}
