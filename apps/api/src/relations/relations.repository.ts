/**
 * YuukiList — Repositório de Relacionamentos e Franquias
 * Conforme Documento Mestre de Contexto (Seções 3.6 e 8.9) e PRD
 */

import type { MediaRelationType } from '../../../../packages/shared/src/index.ts';
import type { CatalogRepository } from '../data/catalog.repository.ts';

export interface StoredMediaRelation {
  id: string;
  mediaItemId: string;
  relatedMediaItemId: string;
  relationType: MediaRelationType;
}

export interface StoredFranchiseItem {
  mediaItemId: string;
  releaseOrder: number;
  chronologicalOrder: number;
  roleInFranchise?: string;
}

export interface StoredFranchise {
  id: string;
  slug: string;
  name: string;
  originalName?: string;
  description?: string;
  items: StoredFranchiseItem[];
}

export class RelationsRepository {
  private relations: StoredMediaRelation[] = [];
  private franchises: StoredFranchise[] = [];
  private readonly catalogRepo?: CatalogRepository;

  constructor(catalogRepo?: CatalogRepository) {
    this.catalogRepo = catalogRepo;
    this.seedDefaults();
  }

  addRelation(relation: StoredMediaRelation): StoredMediaRelation {
    const existing = this.relations.find(
      (r) =>
        (r.mediaItemId === relation.mediaItemId &&
          r.relatedMediaItemId === relation.relatedMediaItemId &&
          r.relationType === relation.relationType) ||
        (r.mediaItemId === relation.relatedMediaItemId &&
          r.relatedMediaItemId === relation.mediaItemId)
    );

    if (existing) {
      return existing;
    }

    this.relations.push(relation);
    return relation;
  }

  findRelationsByMediaItemId(mediaItemId: string): StoredMediaRelation[] {
    return this.relations.filter(
      (r) => r.mediaItemId === mediaItemId || r.relatedMediaItemId === mediaItemId
    );
  }

  createFranchise(franchise: StoredFranchise): StoredFranchise {
    const index = this.franchises.findIndex(
      (f) => f.id === franchise.id || f.slug === franchise.slug
    );
    if (index >= 0) {
      this.franchises[index] = franchise;
      return franchise;
    }
    this.franchises.push(franchise);
    return franchise;
  }

  findFranchiseBySlug(slug: string): StoredFranchise | null {
    return this.franchises.find((f) => f.slug === slug) || null;
  }

  findFranchiseByMediaItemId(mediaItemId: string): StoredFranchise | null {
    return (
      this.franchises.find((f) =>
        f.items.some((item) => item.mediaItemId === mediaItemId)
      ) || null
    );
  }

  listFranchises(): StoredFranchise[] {
    return [...this.franchises];
  }

  private seedDefaults(): void {
    if (!this.catalogRepo) return;

    // Garante que obras do universo The Untamed / Mo Dao Zu Shi estejam no catálogo
    const manhuaId = 'mdzs-manhua-2017';
    const doramaId = 'the-untamed-dorama-2019';
    const animeId = 'mdzs-anime-2018';

    // Se o catálogo já tiver The Grandmaster, pega o ID real
    const existingManhua = this.catalogRepo.findBySlug('the-grandmaster-of-demonic-cultivation-manhua-2017');
    const realManhuaId = existingManhua?.id || manhuaId;

    if (!existingManhua) {
      this.catalogRepo.save({
        id: realManhuaId,
        slug: 'the-grandmaster-of-demonic-cultivation-manhua-2017',
        title: 'The Grandmaster of Demonic Cultivation',
        originalTitle: '魔道祖师',
        category: 'MANHUA',
        coverUrl: '/covers/the-grandmaster-of-demonic-cultivation-manhua-2017.svg',
        releaseYear: 2017,
        publicationStatus: 'FINALIZADA',
        genres: ['Ação', 'Aventura', 'Sobrenatural'],
      });
    }

    let existingDorama = this.catalogRepo.findBySlug('the-untamed');
    if (!existingDorama) {
      existingDorama = this.catalogRepo.save({
        id: doramaId,
        slug: 'the-untamed',
        title: 'The Untamed',
        originalTitle: '陈情令 (Chen Qing Ling)',
        category: 'DORAMA',
        coverUrl: '/covers/the-grandmaster-of-demonic-cultivation-manhua-2017.svg',
        releaseYear: 2019,
        publicationStatus: 'FINALIZADA',
        genres: ['Drama', 'Fantasia', 'Wuxia'],
      });
    }

    let existingAnime = this.catalogRepo.findBySlug('mo-dao-zu-shi-anime');
    if (!existingAnime) {
      existingAnime = this.catalogRepo.save({
        id: animeId,
        slug: 'mo-dao-zu-shi-anime',
        title: 'Mo Dao Zu Shi: The Founder of Diabolism',
        originalTitle: '魔道祖师 动画',
        category: 'ANIME',
        coverUrl: '/covers/the-grandmaster-of-demonic-cultivation-manhua-2017.svg',
        releaseYear: 2018,
        publicationStatus: 'FINALIZADA',
        genres: ['Ação', 'Fantasia', 'Sobrenatural'],
      });
    }

    // Registra relacionamentos transmídia
    this.addRelation({
      id: 'rel-mdzs-manhua-dorama',
      mediaItemId: realManhuaId,
      relatedMediaItemId: existingDorama.id,
      relationType: 'ADAPTATION',
    });

    this.addRelation({
      id: 'rel-mdzs-manhua-anime',
      mediaItemId: realManhuaId,
      relatedMediaItemId: existingAnime.id,
      relationType: 'ADAPTATION',
    });

    this.addRelation({
      id: 'rel-mdzs-anime-dorama',
      mediaItemId: existingAnime.id,
      relatedMediaItemId: existingDorama.id,
      relationType: 'ALTERNATIVE_VERSION',
    });

    // Registra a Franquia The Untamed / Mo Dao Zu Shi Universe
    this.createFranchise({
      id: 'franchise-untamed-universe',
      slug: 'the-untamed-universe',
      name: 'Universo Mo Dao Zu Shi / The Untamed',
      originalName: '魔道祖师 宇宙',
      description: 'O universo transmídia de cultivo demoníaco e honra criado por Mo Xiang Tong Xiu, adaptado em manhua, donghua (anime) e série live-action (dorama).',
      items: [
        {
          mediaItemId: realManhuaId,
          releaseOrder: 1,
          chronologicalOrder: 1,
          roleInFranchise: 'Obra Original / Manhua (2017)',
        },
        {
          mediaItemId: existingAnime.id,
          releaseOrder: 2,
          chronologicalOrder: 2,
          roleInFranchise: 'Adaptação em Anime / Donghua (2018)',
        },
        {
          mediaItemId: existingDorama.id,
          releaseOrder: 3,
          chronologicalOrder: 3,
          roleInFranchise: 'Adaptação Live-Action / Dorama (2019)',
        },
      ],
    });

    // Franquia Solo Leveling
    const existingSoloManhwa = this.catalogRepo.findBySlug('solo-leveling-manhwa-2018');
    const realSoloManhwaId = existingSoloManhwa?.id || 'solo-leveling-manhwa-2018';

    let existingSoloAnime = this.catalogRepo.findBySlug('solo-leveling-anime');
    if (!existingSoloAnime) {
      existingSoloAnime = this.catalogRepo.save({
        id: 'solo-leveling-anime-2024',
        slug: 'solo-leveling-anime',
        title: 'Solo Leveling (Anime)',
        originalTitle: '俺だけレベルアップな件',
        category: 'ANIME',
        coverUrl: '/covers/solo-leveling-manhwa-2018.svg',
        releaseYear: 2024,
        publicationStatus: 'EM_ANDAMENTO',
        genres: ['Ação', 'Aventura', 'Fantasia'],
      });
    }

    if (existingSoloManhwa || realSoloManhwaId) {
      this.addRelation({
        id: 'rel-solo-leveling-adapt',
        mediaItemId: realSoloManhwaId,
        relatedMediaItemId: existingSoloAnime.id,
        relationType: 'ADAPTATION',
      });

      this.createFranchise({
        id: 'franchise-solo-leveling',
        slug: 'solo-leveling-universe',
        name: 'Universo Solo Leveling',
        originalName: '나 혼자만 레벨업',
        description: 'A jornada de Sung Jin-woo desde os Portais de rank E até o ápice como Monarca das Sombras.',
        items: [
          {
            mediaItemId: realSoloManhwaId,
            releaseOrder: 1,
            chronologicalOrder: 1,
            roleInFranchise: 'Webtoon / Manhwa Original (2018)',
          },
          {
            mediaItemId: existingSoloAnime.id,
            releaseOrder: 2,
            chronologicalOrder: 2,
            roleInFranchise: 'Série de Animação (2024)',
          },
        ],
      });
    }
  }
}
