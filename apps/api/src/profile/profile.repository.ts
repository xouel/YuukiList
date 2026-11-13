import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { ShareScope } from '../../../../packages/shared/src/profile.ts';
import type { ShareLinkDto } from '../../../../packages/shared/src/profile.ts';
import {
  isValidUuid,
  resolveOptionalPrismaClient,
} from '../data/prisma-client.util.ts';

export class ProfileRepository {
  private shareLinks: ShareLinkDto[] = [];
  private prisma: PrismaClient | null = null;

  constructor(customPrisma?: PrismaClient | null) {
    this.prisma = resolveOptionalPrismaClient(customPrisma);
  }

  private mapPrismaShareLink(row: any): ShareLinkDto {
    const token = String(row.token);
    return {
      id: String(row.id),
      userId: String(row.userId),
      token,
      expiresAt: new Date(row.expiresAt).toISOString(),
      isRevoked: Boolean(row.isRevoked),
      createdAt: new Date(row.createdAt).toISOString(),
      shareScope: (row.shareScope || ShareScope.FULL_LIBRARY) as ShareScope,
      publicUrl: `/share/${token}`,
    };
  }

  async createShareLink(
    userId: string,
    expirationDays: number,
    shareScope: ShareScope = ShareScope.FULL_LIBRARY
  ): Promise<ShareLinkDto> {
    const token = crypto.randomBytes(16).toString('hex');
    const now = new Date();
    const expiresAtDate = new Date(
      now.getTime() + expirationDays * 24 * 60 * 60 * 1000
    );

    if (this.prisma) {
      const created = await (this.prisma as any).shareLink.create({
        data: {
          userId,
          token,
          shareScope,
          expiresAt: expiresAtDate,
          isRevoked: false,
        },
      });
      return this.mapPrismaShareLink(created);
    }

    const expiresAt = expiresAtDate.toISOString();
    const newLink: ShareLinkDto = {
      id: `share-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      token,
      expiresAt,
      isRevoked: false,
      createdAt: now.toISOString(),
      shareScope,
      publicUrl: `/share/${token}`,
    };

    this.shareLinks.push(newLink);
    return { ...newLink };
  }

  async findShareLinkByToken(token: string): Promise<ShareLinkDto | null> {
    if (this.prisma) {
      const row = await (this.prisma as any).shareLink.findUnique({
        where: { token },
      });
      return row ? this.mapPrismaShareLink(row) : null;
    }

    const link = this.shareLinks.find((l) => l.token === token);
    return link ? { ...link } : null;
  }

  async findActiveLinksByUser(userId: string): Promise<ShareLinkDto[]> {
    const now = new Date();

    if (this.prisma) {
      const rows = await (this.prisma as any).shareLink.findMany({
        where: {
          userId,
          isRevoked: false,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: 'desc' },
      });
      return rows.map((row: any) => this.mapPrismaShareLink(row));
    }

    return this.shareLinks
      .filter((l) => l.userId === userId && !l.isRevoked && new Date(l.expiresAt) > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async revokeShareLink(userId: string, linkId: string): Promise<boolean> {
    if (this.prisma) {
      if (!isValidUuid(linkId)) return false;
      const result = await (this.prisma as any).shareLink.updateMany({
        where: { id: linkId, userId },
        data: { isRevoked: true },
      });
      return result.count > 0;
    }

    const link = this.shareLinks.find((l) => l.userId === userId && l.id === linkId);
    if (!link) return false;
    link.isRevoked = true;
    return true;
  }

  async revokeAllUserLinks(userId: string): Promise<number> {
    if (this.prisma) {
      const result = await (this.prisma as any).shareLink.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
      return result.count;
    }

    let count = 0;
    for (const link of this.shareLinks) {
      if (link.userId === userId && !link.isRevoked) {
        link.isRevoked = true;
        count++;
      }
    }
    return count;
  }

  async purgeUserData(userId: string): Promise<void> {
    if (this.prisma) {
      await (this.prisma as any).shareLink.deleteMany({ where: { userId } });
      return;
    }

    this.shareLinks = this.shareLinks.filter((l) => l.userId !== userId);
  }
}
