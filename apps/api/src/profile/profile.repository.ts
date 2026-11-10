import crypto from 'node:crypto';
import { ShareScope } from '../../../../packages/shared/src/profile.ts';
import type { ShareLinkDto } from '../../../../packages/shared/src/profile.ts';

export class ProfileRepository {
  private shareLinks: ShareLinkDto[] = [];

  async createShareLink(
    userId: string,
    expirationDays: number,
    shareScope: ShareScope = ShareScope.FULL_LIBRARY
  ): Promise<ShareLinkDto> {
    const token = crypto.randomBytes(16).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000).toISOString();

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
    const link = this.shareLinks.find((l) => l.token === token);
    return link ? { ...link } : null;
  }

  async findActiveLinksByUser(userId: string): Promise<ShareLinkDto[]> {
    const now = new Date();
    return this.shareLinks
      .filter((l) => l.userId === userId && !l.isRevoked && new Date(l.expiresAt) > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async revokeShareLink(userId: string, linkId: string): Promise<boolean> {
    const link = this.shareLinks.find((l) => l.userId === userId && l.id === linkId);
    if (!link) return false;
    link.isRevoked = true;
    return true;
  }

  async revokeAllUserLinks(userId: string): Promise<number> {
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
    this.shareLinks = this.shareLinks.filter((l) => l.userId !== userId);
  }
}
