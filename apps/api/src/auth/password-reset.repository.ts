/**
 * YuukiList — Repositório de Tokens de Redefinição de Senha
 * Conforme Requisitos: Password Recovery Request & Password Reset Verification
 */

import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

export interface PasswordResetRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface IPasswordResetRepository {
  createToken(userId: string, tokenHash: string, ttlMs?: number): Promise<PasswordResetRecord>;
  findValidToken(tokenHash: string): Promise<PasswordResetRecord | null>;
  consumeToken(tokenHash: string): Promise<PasswordResetRecord | null>;
  hasRecentToken(userId: string, cooldownMs?: number): Promise<boolean>;
  invalidatePendingTokens(userId: string): Promise<number>;
  clear(): Promise<void>;
}

export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000; // 30 minutos
export const PASSWORD_RESET_COOLDOWN_MS = 60 * 1000; // 60 segundos

export class PasswordResetRepository implements IPasswordResetRepository {
  private tokens: Map<string, PasswordResetRecord> = new Map();
  private prisma: PrismaClient | null = null;

  constructor(customPrisma?: PrismaClient | null) {
    this.prisma = customPrisma || null;
  }

  async createToken(
    userId: string,
    tokenHash: string,
    ttlMs: number = PASSWORD_RESET_TTL_MS
  ): Promise<PasswordResetRecord> {
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);

    if (this.prisma && typeof this.prisma.passwordResetToken?.create === 'function') {
      try {
        const dbRec = await this.prisma.passwordResetToken.create({
          data: {
            id,
            userId,
            tokenHash,
            expiresAt,
          },
        });
        const rec: PasswordResetRecord = {
          id: dbRec.id,
          userId: dbRec.userId,
          tokenHash: dbRec.tokenHash,
          expiresAt: dbRec.expiresAt,
          usedAt: dbRec.usedAt,
          createdAt: dbRec.createdAt,
        };
        this.tokens.set(rec.tokenHash, rec);
        return rec;
      } catch (err) {
        console.error('Falha ao persistir token de recuperação no Prisma:', err);
      }
    }

    const rec: PasswordResetRecord = {
      id,
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
      createdAt: now,
    };
    this.tokens.set(tokenHash, rec);
    return { ...rec };
  }

  async findValidToken(tokenHash: string): Promise<PasswordResetRecord | null> {
    const now = new Date();

    if (this.prisma && typeof this.prisma.passwordResetToken?.findUnique === 'function') {
      try {
        const dbRec = await this.prisma.passwordResetToken.findUnique({
          where: { tokenHash },
        });
        if (dbRec && !dbRec.usedAt && dbRec.expiresAt > now) {
          return {
            id: dbRec.id,
            userId: dbRec.userId,
            tokenHash: dbRec.tokenHash,
            expiresAt: dbRec.expiresAt,
            usedAt: dbRec.usedAt,
            createdAt: dbRec.createdAt,
          };
        }
        return null;
      } catch (err) {
        console.error('Falha ao buscar token de recuperação no Prisma:', err);
      }
    }

    const rec = this.tokens.get(tokenHash);
    if (!rec) return null;
    if (rec.usedAt !== null) return null;
    if (rec.expiresAt <= now) return null;
    return { ...rec };
  }

  async consumeToken(tokenHash: string): Promise<PasswordResetRecord | null> {
    const now = new Date();

    if (
      this.prisma &&
      typeof this.prisma.passwordResetToken?.updateMany === 'function' &&
      typeof this.prisma.passwordResetToken?.findUnique === 'function'
    ) {
      try {
        const res = await this.prisma.passwordResetToken.updateMany({
          where: {
            tokenHash,
            usedAt: null,
            expiresAt: { gt: now },
          },
          data: {
            usedAt: now,
          },
        });

        if (res.count === 0) {
          return null;
        }

        const dbRec = await this.prisma.passwordResetToken.findUnique({
          where: { tokenHash },
        });
        if (dbRec) {
          return {
            id: dbRec.id,
            userId: dbRec.userId,
            tokenHash: dbRec.tokenHash,
            expiresAt: dbRec.expiresAt,
            usedAt: dbRec.usedAt,
            createdAt: dbRec.createdAt,
          };
        }
      } catch (err) {
        console.error('Falha ao consumir token de recuperação no Prisma:', err);
      }
    }

    const rec = this.tokens.get(tokenHash);
    if (!rec || rec.usedAt !== null || rec.expiresAt <= now) {
      return null;
    }
    rec.usedAt = now;
    return { ...rec };
  }

  async hasRecentToken(
    userId: string,
    cooldownMs: number = PASSWORD_RESET_COOLDOWN_MS
  ): Promise<boolean> {
    const cutoff = new Date(Date.now() - cooldownMs);

    if (this.prisma && typeof this.prisma.passwordResetToken?.findFirst === 'function') {
      try {
        const recent = await this.prisma.passwordResetToken.findFirst({
          where: {
            userId,
            createdAt: { gte: cutoff },
          },
        });
        return Boolean(recent);
      } catch (err) {
        console.error('Falha ao consultar cooldown no Prisma:', err);
      }
    }

    for (const rec of this.tokens.values()) {
      if (rec.userId === userId && rec.createdAt >= cutoff) {
        return true;
      }
    }
    return false;
  }

  async invalidatePendingTokens(userId: string): Promise<number> {
    const now = new Date();

    if (this.prisma && typeof this.prisma.passwordResetToken?.updateMany === 'function') {
      try {
        const res = await this.prisma.passwordResetToken.updateMany({
          where: {
            userId,
            usedAt: null,
          },
          data: {
            usedAt: now,
          },
        });
        return res.count;
      } catch (err) {
        console.error('Falha ao invalidar tokens pendentes no Prisma:', err);
      }
    }

    let count = 0;
    for (const rec of this.tokens.values()) {
      if (rec.userId === userId && rec.usedAt === null) {
        rec.usedAt = now;
        count += 1;
      }
    }
    return count;
  }

  async clear(): Promise<void> {
    this.tokens.clear();
  }
}

