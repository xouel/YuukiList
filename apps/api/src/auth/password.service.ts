import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(crypto.scrypt);

const DUMMY_SALT = '00000000000000000000000000000000';
const DUMMY_HASH = '0'.repeat(128);

export class PasswordService {
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    if (!storedHash || !storedHash.startsWith('scrypt:')) {
      return false;
    }

    const parts = storedHash.split(':');
    if (parts.length !== 3) {
      return false;
    }

    const salt = parts[1];
    const keyHex = parts[2];

    try {
      const targetBuffer = Buffer.from(keyHex, 'hex');
      const derivedKey = (await scryptAsync(password, salt, targetBuffer.length)) as Buffer;

      if (derivedKey.length !== targetBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(derivedKey, targetBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Executa uma verificação fictícia para manter o tempo de resposta
   * uniforme quando o identificador de usuário não for encontrado (anti-enumeração).
   */
  async dummyVerify(password: string = 'dummy_password_timing_mitigation'): Promise<void> {
    try {
      const derivedKey = (await scryptAsync(password, DUMMY_SALT, 64)) as Buffer;
      const dummyTarget = Buffer.from(DUMMY_HASH, 'hex');
      crypto.timingSafeEqual(derivedKey, dummyTarget);
    } catch {
      // Ignora erro proposital
    }
  }
}

