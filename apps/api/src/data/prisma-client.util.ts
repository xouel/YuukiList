/**
 * Utilitários compartilhados para repositórios com persistência dual (Prisma + fallback em memória).
 */

import { PrismaClient } from '@prisma/client';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

/**
 * Resolve uma instância Prisma respeitando isolamento dos testes automatizados.
 */
export function resolveOptionalPrismaClient(
  customPrisma?: PrismaClient | null
): PrismaClient | null {
  if (customPrisma !== undefined) {
    return customPrisma;
  }

  const isTestRunner =
    process.env.NODE_ENV === 'test' ||
    Boolean(process.env.NODE_TEST_CONTEXT) ||
    process.argv.some((arg) => arg.endsWith('.test.mjs')) ||
    process.execArgv.some((arg) => arg === '--test');

  if (!isTestRunner && (process.env.DATABASE_URL || process.env.DIRECT_URL)) {
    try {
      return new PrismaClient();
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Converte slug ou UUID de obra para o UUID canônico da tabela `media_items`.
 */
export async function resolveCatalogMediaUuid(
  prisma: PrismaClient | null,
  mediaItemIdOrSlug: string
): Promise<string> {
  const clean = mediaItemIdOrSlug.trim();
  if (!prisma) return clean;

  const where = isValidUuid(clean)
    ? { OR: [{ id: clean }, { slug: clean.toLowerCase() }] }
    : { slug: clean.toLowerCase() };

  try {
    const media = await (prisma as any).mediaItem?.findFirst({
      where,
      select: { id: true },
    });
    return media ? String(media.id) : clean;
  } catch {
    return clean;
  }
}

