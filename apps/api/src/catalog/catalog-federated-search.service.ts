/**
 * YuukiList — Serviço de Busca Federada Híbrida (CatalogFederatedSearchService)
 * Realiza busca prioritária no catálogo local (Supabase/Prisma) com pg_trgm.
 * Se requisitado ou se os resultados locais forem restritos, consulta em paralelo
 * as APIs externas (TMDB, TVmaze, Kitsu, MangaUpdates) com timeout estrito de 3 segundos
 * e deduplicação semântica.
 */

import {
  type Category,
  type CatalogQueryDto,
  type FederatedCatalogResponse,
  type CanonicalExternalMediaDto,
  normalizeSearchText,
} from '../../../../packages/shared/src/index.ts';
import { type ICatalogRepository } from '../data/catalog.repository.ts';
import { TmdbClient } from '../external/tmdb.client.ts';
import { TvmazeClient } from '../external/tvmaze.client.ts';
import { KitsuClient } from '../external/kitsu.client.ts';
import { MangaUpdatesClient } from '../external/mangaupdates.client.ts';

export class CatalogFederatedSearchService {
  private readonly repository: ICatalogRepository;
  private readonly tmdbClient: TmdbClient;
  private readonly tvmazeClient: TvmazeClient;
  private readonly kitsuClient: KitsuClient;
  private readonly mangaUpdatesClient: MangaUpdatesClient;

  constructor(
    repository: ICatalogRepository,
    clients?: {
      tmdb?: TmdbClient;
      tvmaze?: TvmazeClient;
      kitsu?: KitsuClient;
      mangaUpdates?: MangaUpdatesClient;
    }
  ) {
    this.repository = repository;
    this.tmdbClient = clients?.tmdb || new TmdbClient();
    this.tvmazeClient = clients?.tvmaze || new TvmazeClient();
    this.kitsuClient = clients?.kitsu || new KitsuClient();
    this.mangaUpdatesClient = clients?.mangaUpdates || new MangaUpdatesClient();
  }

  async searchFederated(query: CatalogQueryDto): Promise<FederatedCatalogResponse> {
    const localResult = await this.repository.findMany(query);

    const searchTerm = query.q?.trim() || '';
    const shouldQueryExternal =
      searchTerm.length >= 2 &&
      (query.includeExternal !== false || localResult.data.length < 3);

    if (!shouldQueryExternal) {
      return {
        ...localResult,
        externalResults: [],
      };
    }

    const externalResults = await this.fetchExternalWithTimeout(searchTerm, query.category, 3000);

    // Deduplicação contra os resultados locais existentes
    const localNormalizedTitles = new Set(
      localResult.data.map((item) => normalizeSearchText(item.title))
    );

    const deduplicatedExternal: CanonicalExternalMediaDto[] = [];
    const seenExternalKeys = new Set<string>();

    for (const item of externalResults) {
      const norm = normalizeSearchText(item.title);
      const key = `${norm}:${item.category}`;

      if (localNormalizedTitles.has(norm)) continue;
      if (seenExternalKeys.has(key)) continue;

      seenExternalKeys.add(key);
      deduplicatedExternal.push(item);
    }

    return {
      data: localResult.data,
      meta: localResult.meta,
      externalResults: deduplicatedExternal.slice(0, 10),
    };
  }

  private async fetchExternalWithTimeout(
    term: string,
    category?: Category,
    timeoutMs = 3000
  ): Promise<CanonicalExternalMediaDto[]> {
    const promises: Promise<CanonicalExternalMediaDto[]>[] = [];

    const withTimeout = <T>(promise: Promise<T>): Promise<T> => {
      let timer: NodeJS.Timeout;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('External search timeout')), timeoutMs);
      });
      return Promise.race([
        promise.then((res) => {
          clearTimeout(timer);
          return res;
        }),
        timeoutPromise,
      ]);
    };

    // Audiovisuais (DORAMA, FILME ou sem filtro de categoria)
    if (!category || category === 'DORAMA' || category === 'FILME') {
      promises.push(
        withTimeout(
          this.tmdbClient.search({ title: term, category })
        ).catch(() => [])
      );

      if (!category || category === 'DORAMA') {
        promises.push(
          withTimeout(
            this.tvmazeClient.search({ title: term, category: 'DORAMA' })
          ).catch(() => [])
        );
      }
    }

    // Literários e Animes (ANIME, MANGA, MANHWA, MANHUA ou sem filtro)
    if (!category || category === 'ANIME' || category === 'MANGA') {
      promises.push(
        withTimeout(
          this.kitsuClient.search({ title: term, category: category || 'ANIME' })
        ).catch(() => [])
      );
    }

    if (!category || category === 'MANGA' || category === 'MANHWA' || category === 'MANHUA') {
      promises.push(
        withTimeout(
          this.mangaUpdatesClient.search({ title: term, category: category || 'MANGA' })
        ).catch(() => [])
      );
    }

    const settled = await Promise.allSettled(promises);
    const collected: CanonicalExternalMediaDto[] = [];

    for (const res of settled) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        collected.push(...res.value);
      }
    }

    return collected;
  }
}

