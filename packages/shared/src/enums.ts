/**
 * YuukiList — Enums Canônicos e Validadores do Catálogo
 * Conforme estabelecido na Constituição (Princípio IX)
 */

export const CATEGORIES = Object.freeze([
  'DORAMA',
  'FILME',
  'ANIME',
  'MANGA',
  'MANHWA',
  'MANHUA',
] as const);

export type Category = (typeof CATEGORIES)[number];

export const PUBLICATION_STATUSES = Object.freeze([
  'EM_ANDAMENTO',
  'FINALIZADA',
  'CANCELADA',
  'HIATO',
  'DESCONHECIDA',
] as const);

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export class InvalidCatalogEnumError extends Error {
  public readonly code: 'INVALID_CATEGORY' | 'INVALID_PUBLICATION_STATUS';
  public readonly invalidValue: unknown;

  constructor(code: 'INVALID_CATEGORY' | 'INVALID_PUBLICATION_STATUS', invalidValue: unknown) {
    const field = code === 'INVALID_CATEGORY' ? 'categoria' : 'status de publicação';
    const allowed = code === 'INVALID_CATEGORY' ? CATEGORIES.join(', ') : PUBLICATION_STATUSES.join(', ');
    super(`Valor inválido '${String(invalidValue)}' para ${field}. Valores permitidos: ${allowed}.`);
    this.name = 'InvalidCatalogEnumError';
    this.code = code;
    this.invalidValue = invalidValue;
  }
}

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);
}

export function isPublicationStatus(value: unknown): value is PublicationStatus {
  return typeof value === 'string' && (PUBLICATION_STATUSES as readonly string[]).includes(value);
}

export function validateMediaMetadata(input: { category: unknown; publicationStatus: unknown }): {
  category: Category;
  publicationStatus: PublicationStatus;
} {
  if (!isCategory(input.category)) {
    throw new InvalidCatalogEnumError('INVALID_CATEGORY', input.category);
  }
  if (!isPublicationStatus(input.publicationStatus)) {
    throw new InvalidCatalogEnumError('INVALID_PUBLICATION_STATUS', input.publicationStatus);
  }
  return {
    category: input.category,
    publicationStatus: input.publicationStatus,
  };
}

