import type {
  ProfileStatsDto,
  ShareLinkDto,
  SharedProfileViewDto,
  SharedProfileItemDto,
  ExportDataDto,
  ShareScope,
} from '../../../../packages/shared/src/profile.ts';
import { ProfileRepository } from './profile.repository.ts';
import { LibraryRepository } from '../library/library.repository.ts';
import { CatalogRepository } from '../data/catalog.repository.ts';
import { UsersRepository } from '../auth/users.repository.ts';
import { DiaryRepository } from '../diary/diary.repository.ts';

export class ProfileService {
  private readonly profileRepo: ProfileRepository;
  private readonly libraryRepo: LibraryRepository;
  private readonly catalogRepo: CatalogRepository;
  private readonly usersRepo: UsersRepository;
  private readonly diaryRepo?: DiaryRepository;

  constructor(
    profileRepo: ProfileRepository,
    libraryRepo: LibraryRepository,
    catalogRepo: CatalogRepository,
    usersRepo: UsersRepository,
    diaryRepo?: DiaryRepository
  ) {
    this.profileRepo = profileRepo;
    this.libraryRepo = libraryRepo;
    this.catalogRepo = catalogRepo;
    this.usersRepo = usersRepo;
    this.diaryRepo = diaryRepo;
  }

  async getStats(userId: string): Promise<ProfileStatsDto> {
    const user = await this.usersRepo.findById(userId);
    const username = user ? user.username : 'Usuário';
    const joinedAt = user ? user.createdAt.toISOString() : new Date().toISOString();
    const avatarUrl = user?.avatarUrl || undefined;
    const avatarFrame = (user?.avatarFrame as any) || 'none';
    const bannerUrl = user?.bannerUrl || null;
    const bio = user?.bio || undefined;
    const location = user?.location || null;

    const { items: libraryItems } = await this.libraryRepo.findMany(userId, { limit: 2000 });

    if (libraryItems.length === 0) {
      return {
        userId,
        username,
        avatarUrl,
        avatarFrame,
        bannerUrl,
        bio,
        location,
        joinedAt,
        totalCompleted: 0,
        totalWatchingOrReading: 0,
        totalPlanToWatchOrRead: 0,
        totalEstimatedHours: 0,
        totalChaptersRead: 0,
        totalVolumesRead: 0,
        averageRating: null,
        categoryDistribution: {},
        topGenres: [],
        topCountries: [],
        favorites: [],
      };
    }

    let totalCompleted = 0;
    let totalWatchingOrReading = 0;
    let totalPlanToWatchOrRead = 0;
    let totalRatingSum = 0;
    let totalRatingCount = 0;
    let totalEstimatedHours = 0;
    let totalChaptersRead = 0;
    let totalVolumesRead = 0;

    const categoryCounts: Record<string, number> = {};
    const genreCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const favoriteItems: ProfileStatsDto['favorites'] = [];

    for (const item of libraryItems) {
      const statusStr = String(item.status);
      if (statusStr === 'CONCLUIDO' || statusStr === 'COMPLETED') {
        totalCompleted++;
      } else if (
        statusStr === 'ASSISTINDO' ||
        statusStr === 'LENDO' ||
        statusStr === 'WATCHING' ||
        statusStr === 'READING'
      ) {
        totalWatchingOrReading++;
      } else if (
        statusStr === 'QUERO_ASSISTIR' ||
        statusStr === 'QUERO_LER' ||
        statusStr === 'PLAN_TO_WATCH' ||
        statusStr === 'PLAN_TO_READ'
      ) {
        totalPlanToWatchOrRead++;
      }

      if (typeof item.rating === 'number' && item.rating > 0) {
        totalRatingSum += item.rating;
        totalRatingCount++;
      }

      // Fetch catalog item metadata
      let media = await this.catalogRepo.findById(item.mediaItemId);
      if (!media) {
        media = await this.catalogRepo.findBySlug(item.mediaItemId);
      }

      const category = media ? media.category : 'OUTROS';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      if (media?.genres && Array.isArray(media.genres)) {
        for (const g of media.genres) {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        }
      }

      const country = media?.countryOfOrigin || 'JP';
      countryCounts[country] = (countryCounts[country] || 0) + 1;

      // Time and unit accumulation
      if (category === 'DORAMA') {
        totalEstimatedHours += (item.progress || 0) * 1.0;
      } else if (category === 'ANIME') {
        totalEstimatedHours += (item.progress || 0) * 0.4; // ~24 min
      } else if (category === 'FILME') {
        if (statusStr === 'CONCLUIDO' || statusStr === 'ASSISTIDO') {
          totalEstimatedHours += 2.0;
        }
      } else {
        totalChaptersRead += item.progress || 0;
        totalVolumesRead += item.progressVolumes || 0;
      }

      if (item.isFavorite) {
        favoriteItems.push({
          mediaItemId: item.mediaItemId,
          title: media ? media.title : item.mediaItemId,
          slug: media ? media.slug : item.mediaItemId,
          category,
          coverUrl: media ? media.coverUrl : '/covers/default.svg',
          rating: item.rating,
        });
      }
    }

    const averageRating =
      totalRatingCount > 0 ? Number((totalRatingSum / totalRatingCount).toFixed(1)) : null;

    const totalItems = libraryItems.length;
    const categoryDistribution: Record<string, { count: number; percentage: number }> = {};
    for (const [cat, count] of Object.entries(categoryCounts)) {
      categoryDistribution[cat] = {
        count,
        percentage: Math.round((count / totalItems) * 100),
      };
    }

    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topCountries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      userId,
      username,
      avatarUrl,
      avatarFrame,
      bannerUrl,
      bio,
      location,
      joinedAt,
      totalCompleted,
      totalWatchingOrReading,
      totalPlanToWatchOrRead,
      totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
      totalChaptersRead,
      totalVolumesRead,
      averageRating,
      categoryDistribution,
      topGenres,
      topCountries,
      favorites: favoriteItems,
    };
  }

  async updateProfile(userId: string, data: any) {
    return this.usersRepo.updateProfile(userId, data);
  }

  async getAccount(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) return null;
    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      avatarFrame: user.avatarFrame || 'none',
      bannerUrl: user.bannerUrl || null,
      bio: user.bio || null,
      phone: user.phone || null,
      location: user.location || null,
      createdAt: user.createdAt,
    };
  }

  async createShareLink(
    userId: string,
    expirationDays: number = 30,
    shareScope?: ShareScope
  ): Promise<ShareLinkDto> {
    const validDays = [7, 30, 90].includes(expirationDays) ? expirationDays : 30;
    return this.profileRepo.createShareLink(userId, validDays, shareScope);
  }

  async getActiveShareLinks(userId: string): Promise<ShareLinkDto[]> {
    return this.profileRepo.findActiveLinksByUser(userId);
  }

  async revokeShareLink(userId: string, linkId: string): Promise<boolean> {
    return this.profileRepo.revokeShareLink(userId, linkId);
  }

  async getSharedView(token: string): Promise<SharedProfileViewDto> {
    const link = await this.profileRepo.findShareLinkByToken(token);
    if (!link) {
      throw new Error('Link de compartilhamento inexistente');
    }
    if (link.isRevoked) {
      throw new Error('Link de compartilhamento revogado pelo proprietário');
    }
    if (new Date() > new Date(link.expiresAt)) {
      throw new Error('Link de compartilhamento expirado');
    }

    const stats = await this.getStats(link.userId);
    const { items: libraryItems } = await this.libraryRepo.findMany(link.userId, { limit: 2000 });

    const sharedItems: SharedProfileItemDto[] = [];
    for (const item of libraryItems) {
      if (link.shareScope === 'FAVORITES_ONLY' && !item.isFavorite) {
        continue;
      }
      let media = await this.catalogRepo.findById(item.mediaItemId);
      if (!media) {
        media = await this.catalogRepo.findBySlug(item.mediaItemId);
      }

      sharedItems.push({
        mediaItemId: item.mediaItemId,
        title: media ? media.title : item.mediaItemId,
        slug: media ? media.slug : item.mediaItemId,
        category: media ? media.category : 'OUTROS',
        coverUrl: media ? media.coverUrl : '/covers/default.svg',
        status: String(item.status),
        progress: item.progress,
        isFavorite: item.isFavorite,
        rating: item.rating,
      });
    }

    return {
      username: stats.username,
      avatarUrl: stats.avatarUrl,
      bio: stats.bio,
      joinedAt: stats.joinedAt,
      expiresAt: link.expiresAt,
      stats,
      items: sharedItems,
    };
  }

  async exportDataJson(userId: string): Promise<ExportDataDto> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const { items: libraryItems } = await this.libraryRepo.findMany(userId, { limit: 5000 });
    const formattedLibrary = [];
    for (const item of libraryItems) {
      let media = await this.catalogRepo.findById(item.mediaItemId);
      if (!media) media = await this.catalogRepo.findBySlug(item.mediaItemId);
      formattedLibrary.push({
        id: item.id,
        mediaItemId: item.mediaItemId,
        title: media?.title,
        slug: media?.slug,
        category: media?.category,
        status: String(item.status),
        progress: item.progress,
        progressVolumes: item.progressVolumes,
        rating: item.rating,
        isFavorite: item.isFavorite,
        rewatchCount: item.rewatchCount,
        updatedAt: item.updatedAt.toISOString(),
      });
    }

    let diaryEvents: any[] = [];
    if (this.diaryRepo) {
      diaryEvents = await this.diaryRepo.findMany(userId, { limit: 5000 });
    }

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt.toISOString(),
      },
      library: formattedLibrary,
      diary: diaryEvents,
    };
  }

  async exportLibraryCsv(userId: string): Promise<string> {
    const { items: libraryItems } = await this.libraryRepo.findMany(userId, { limit: 5000 });
    const headers = [
      'ID_OBRA',
      'TITULO',
      'CATEGORIA',
      'STATUS_PESSOAL',
      'PROGRESSO',
      'VOLUMES',
      'NOTA',
      'FAVORITO',
      'REWATCH_COUNT',
      'ATUALIZADO_EM',
    ];

    const rows: string[] = [headers.join(',')];

    for (const item of libraryItems) {
      let media = await this.catalogRepo.findById(item.mediaItemId);
      if (!media) media = await this.catalogRepo.findBySlug(item.mediaItemId);

      const title = (media?.title || item.mediaItemId).replace(/"/g, '""');
      const category = media?.category || 'OUTROS';
      const status = String(item.status);
      const progress = item.progress;
      const volumes = item.progressVolumes ?? '';
      const rating = item.rating ?? '';
      const isFavorite = item.isFavorite ? 'SIM' : 'NAO';
      const rewatch = item.rewatchCount || 0;
      const updatedAt = item.updatedAt.toISOString();

      rows.push(
        `"${item.mediaItemId}","${title}","${category}","${status}",${progress},"${volumes}","${rating}","${isFavorite}",${rewatch},"${updatedAt}"`
      );
    }

    return rows.join('\n');
  }

  async deleteAccount(
    userId: string,
    consentConfirmed: boolean
  ): Promise<{ success: boolean; message: string }> {
    if (!consentConfirmed) {
      throw new Error('Consentimento explícito obrigatório para exclusão de conta');
    }

    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new Error('Usuário inexistente ou já excluído');
    }

    // 1. Expurga registros de biblioteca
    await this.libraryRepo.deleteAllByUser(userId);

    // 2. Expurga histórico de diário
    if (this.diaryRepo) {
      await this.diaryRepo.deleteAllByUser(userId);
    }

    // 3. Expurga links compartilhados
    await this.profileRepo.purgeUserData(userId);

    // 4. Remove a conta de usuário
    await this.usersRepo.delete(userId);

    return {
      success: true,
      message: 'Conta e dados pessoais excluídos definitivamente do YuukiList',
    };
  }
}

