/**
 * YuukiList — Erros de Domínio da Biblioteca Pessoal
 */

export class IncompatibleStatusError extends Error {
  readonly statusCode = 400;
  constructor(message: string = 'Status pessoal incompatível com a categoria da obra') {
    super(message);
    this.name = 'IncompatibleStatusError';
  }
}

export class InvalidProgressError extends Error {
  readonly statusCode = 400;
  constructor(message: string = 'Progresso numérico inválido ou fora do intervalo da obra') {
    super(message);
    this.name = 'InvalidProgressError';
  }
}

export class LibraryItemNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message: string = 'Item não encontrado na biblioteca pessoal') {
    super(message);
    this.name = 'LibraryItemNotFoundError';
  }
}

export class MediaItemNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message: string = 'Obra não encontrada no catálogo') {
    super(message);
    this.name = 'MediaItemNotFoundError';
  }
}
