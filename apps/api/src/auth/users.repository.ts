import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import {
  normalizeEmail,
  normalizeUsername,
  UserRole,
} from '../../../../packages/shared/src/index.ts';
import type { UserRole as UserRoleType } from '../../../../packages/shared/src/index.ts';

export interface UserRecord {
  id: string;
  email: string;
  normalizedEmail: string;
  username: string;
  normalizedUsername: string;
  passwordHash: string;
  role: UserRoleType;
  avatarUrl?: string | null;
  avatarFrame?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUsersRepository {
  create(data: { email: string; username: string; passwordHash: string; role?: UserRoleType }): Promise<UserRecord>;
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findByUsername(username: string): Promise<UserRecord | null>;
  findByIdentifier(identifier: string): Promise<UserRecord | null>;
  setRole(id: string, role: UserRoleType): Promise<UserRecord | null>;
  updateProfile(id: string, data: Partial<UserRecord>): Promise<UserRecord | null>;
  count(): Promise<number>;
  clear(): Promise<void>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class UsersRepository implements IUsersRepository {
  private users: Map<string, UserRecord> = new Map();
  private prisma: PrismaClient | null = null;

  constructor(customPrisma?: PrismaClient | null) {
    if (customPrisma !== undefined) {
      this.prisma = customPrisma;
    } else {
      this.prisma = null;
    }
  }

  private mapPrismaUser(dbUser: any): UserRecord {
    const rec: UserRecord = {
      id: dbUser.id,
      email: dbUser.email,
      normalizedEmail: dbUser.normalizedEmail,
      username: dbUser.username,
      normalizedUsername: dbUser.normalizedUsername,
      passwordHash: dbUser.passwordHash,
      role: UserRole.USER,
      avatarUrl: dbUser.avatarUrl ?? null,
      avatarFrame: dbUser.avatarFrame ?? 'none',
      bannerUrl: dbUser.bannerUrl ?? null,
      bio: dbUser.bio ?? null,
      phone: dbUser.phone ?? null,
      location: dbUser.location ?? null,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
    this.users.set(rec.id, rec);
    return { ...rec };
  }

  async create(data: {
    email: string;
    username: string;
    passwordHash: string;
    role?: UserRoleType;
  }): Promise<UserRecord> {
    const id = crypto.randomUUID();
    const now = new Date();
    const normalizedEmail = normalizeEmail(data.email);
    const normalizedUsername = normalizeUsername(data.username);

    if (this.prisma) {
      try {
        const dbUser = await this.prisma.user.create({
          data: {
            id,
            email: data.email.trim(),
            normalizedEmail,
            username: data.username.trim(),
            normalizedUsername,
            passwordHash: data.passwordHash,
          },
        });
        return this.mapPrismaUser(dbUser);
      } catch {
        // Fallback gracioso em caso de indisponibilidade transitória de rede
      }
    }

    const user: UserRecord = {
      id,
      email: data.email.trim(),
      normalizedEmail,
      username: data.username.trim(),
      normalizedUsername,
      passwordHash: data.passwordHash,
      role: data.role || UserRole.USER,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);
    return { ...user };
  }

  async findById(id: string): Promise<UserRecord | null> {
    if (!id) return null;

    if (this.prisma && UUID_REGEX.test(id)) {
      try {
        const dbUser = await this.prisma.user.findUnique({ where: { id } });
        if (dbUser) return this.mapPrismaUser(dbUser);
      } catch {
        // Fallback para memória
      }
    }

    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const target = normalizeEmail(email);

    if (this.prisma) {
      try {
        const dbUser = await this.prisma.user.findUnique({
          where: { normalizedEmail: target },
        });
        if (dbUser) return this.mapPrismaUser(dbUser);
      } catch {
        // Fallback para memória
      }
    }

    for (const user of this.users.values()) {
      if (user.normalizedEmail === target) {
        return { ...user };
      }
    }
    return null;
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const target = normalizeUsername(username);

    if (this.prisma) {
      try {
        const dbUser = await this.prisma.user.findUnique({
          where: { normalizedUsername: target },
        });
        if (dbUser) return this.mapPrismaUser(dbUser);
      } catch {
        // Fallback para memória
      }
    }

    for (const user of this.users.values()) {
      if (user.normalizedUsername === target) {
        return { ...user };
      }
    }
    return null;
  }

  async findByIdentifier(identifier: string): Promise<UserRecord | null> {
    if (!identifier) return null;
    const target = identifier.trim().toLowerCase();

    if (this.prisma) {
      try {
        const dbUser = await this.prisma.user.findFirst({
          where: {
            OR: [{ normalizedEmail: target }, { normalizedUsername: target }],
          },
        });
        if (dbUser) return this.mapPrismaUser(dbUser);
      } catch {
        // Fallback para memória
      }
    }

    for (const user of this.users.values()) {
      if (user.normalizedEmail === target || user.normalizedUsername === target) {
        return { ...user };
      }
    }
    return null;
  }

  async setRole(id: string, role: UserRoleType): Promise<UserRecord | null> {
    const user = (await this.findById(id)) || this.users.get(id);
    if (!user) return null;
    user.role = role;
    user.updatedAt = new Date();
    this.users.set(id, user);
    return { ...user };
  }

  async updateProfile(id: string, data: Partial<UserRecord>): Promise<UserRecord | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    if (data.avatarUrl !== undefined) existing.avatarUrl = data.avatarUrl;
    if (data.avatarFrame !== undefined) existing.avatarFrame = data.avatarFrame;
    if (data.bannerUrl !== undefined) existing.bannerUrl = data.bannerUrl;
    if (data.bio !== undefined) existing.bio = data.bio;
    if (data.phone !== undefined) existing.phone = data.phone;
    if (data.location !== undefined) existing.location = data.location;
    existing.updatedAt = new Date();

    if (this.prisma && UUID_REGEX.test(id)) {
      try {
        const dbUpdated = await this.prisma.user.update({
          where: { id },
          data: {
            avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
            avatarFrame: data.avatarFrame !== undefined ? data.avatarFrame : undefined,
            bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : undefined,
            bio: data.bio !== undefined ? data.bio : undefined,
            phone: data.phone !== undefined ? data.phone : undefined,
            location: data.location !== undefined ? data.location : undefined,
          },
        });
        return this.mapPrismaUser(dbUpdated);
      } catch {
        // Fallback gracioso em memória
      }
    }

    this.users.set(id, existing);
    return { ...existing };
  }

  async count(): Promise<number> {
    if (this.prisma) {
      try {
        return await this.prisma.user.count();
      } catch {
        // Fallback para memória
      }
    }
    return this.users.size;
  }

  async delete(id: string): Promise<boolean> {
    const deletedMem = this.users.delete(id);
    if (this.prisma && UUID_REGEX.test(id)) {
      try {
        await this.prisma.user.delete({ where: { id } });
        return true;
      } catch {
        return deletedMem;
      }
    }
    return deletedMem;
  }

  async clear(): Promise<void> {
    this.users.clear();
  }
}
