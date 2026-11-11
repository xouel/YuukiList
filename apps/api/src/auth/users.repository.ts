import crypto from 'node:crypto';
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
  count(): Promise<number>;
  clear(): Promise<void>;
}

export class UsersRepository implements IUsersRepository {
  private users: Map<string, UserRecord> = new Map();

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
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const target = normalizeEmail(email);
    for (const user of this.users.values()) {
      if (user.normalizedEmail === target) {
        return { ...user };
      }
    }
    return null;
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const target = normalizeUsername(username);
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
    for (const user of this.users.values()) {
      if (user.normalizedEmail === target || user.normalizedUsername === target) {
        return { ...user };
      }
    }
    return null;
  }

  async setRole(id: string, role: UserRoleType): Promise<UserRecord | null> {
    const user = this.users.get(id);
    if (!user) return null;
    user.role = role;
    user.updatedAt = new Date();
    this.users.set(id, user);
    return { ...user };
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async clear(): Promise<void> {
    this.users.clear();
  }
}
