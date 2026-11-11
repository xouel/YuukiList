// apps/api/src/provisional/provisional.repository.ts

import type { InclusionRequest, RequestStatus } from '../../../../packages/shared/src/index.ts';

export interface IProvisionalRepository {
  create(request: InclusionRequest): Promise<InclusionRequest>;
  findById(id: string): Promise<InclusionRequest | null>;
  findByUserId(userId: string): Promise<InclusionRequest[]>;
  findPendingByTitleAndUser(userId: string, title: string): Promise<InclusionRequest | null>;
  update(id: string, updates: Partial<InclusionRequest>): Promise<InclusionRequest | null>;
  findAll(status?: RequestStatus): Promise<InclusionRequest[]>;
  count(): Promise<number>;
  clear(): Promise<void>;
}

export class ProvisionalRepository implements IProvisionalRepository {
  private requests: Map<string, InclusionRequest> = new Map();

  async create(request: InclusionRequest): Promise<InclusionRequest> {
    this.requests.set(request.id, { ...request });
    return { ...request };
  }

  async findById(id: string): Promise<InclusionRequest | null> {
    const found = this.requests.get(id);
    return found ? { ...found } : null;
  }

  async findByUserId(userId: string): Promise<InclusionRequest[]> {
    const list: InclusionRequest[] = [];
    for (const req of this.requests.values()) {
      if (req.userId === userId) {
        list.push({ ...req });
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findPendingByTitleAndUser(userId: string, title: string): Promise<InclusionRequest | null> {
    const normalized = title.trim().toLowerCase();
    for (const req of this.requests.values()) {
      if (
        req.userId === userId &&
        (req.status === 'PENDENTE' || req.status === 'EM_ANALISE') &&
        req.title.trim().toLowerCase() === normalized
      ) {
        return { ...req };
      }
    }
    return null;
  }

  async update(id: string, updates: Partial<InclusionRequest>): Promise<InclusionRequest | null> {
    const existing = this.requests.get(id);
    if (!existing) return null;

    const updated: InclusionRequest = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.requests.set(id, updated);
    return { ...updated };
  }

  async findAll(status?: RequestStatus): Promise<InclusionRequest[]> {
    const list: InclusionRequest[] = [];
    for (const req of this.requests.values()) {
      if (!status || req.status === status) {
        list.push({ ...req });
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async count(): Promise<number> {
    return this.requests.size;
  }

  async clear(): Promise<void> {
    this.requests.clear();
  }
}

