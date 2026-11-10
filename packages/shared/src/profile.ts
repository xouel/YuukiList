export const ShareScope = Object.freeze({
  FULL_LIBRARY: 'FULL_LIBRARY',
  FAVORITES_ONLY: 'FAVORITES_ONLY',
} as const);

export type ShareScope = (typeof ShareScope)[keyof typeof ShareScope];

export interface ProfileStatsDto {
  userId: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  joinedAt: string;
  totalCompleted: number;
  totalWatchingOrReading: number;
  totalPlanToWatchOrRead: number;
  totalEstimatedHours: number;
  totalChaptersRead: number;
  totalVolumesRead: number;
  averageRating: number | null;
  categoryDistribution: Record<string, { count: number; percentage: number }>;
  topGenres: Array<{ genre: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  favorites: Array<{
    mediaItemId: string;
    title: string;
    slug: string;
    category: string;
    coverUrl: string;
    rating?: number | null;
  }>;
}

export interface ShareLinkDto {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
  shareScope: ShareScope;
  publicUrl: string;
}

export interface CreateShareLinkDto {
  expirationDays: number; // 7, 30 or 90
  shareScope?: ShareScope;
}

export interface SharedProfileItemDto {
  mediaItemId: string;
  title: string;
  slug: string;
  category: string;
  coverUrl: string;
  status: string;
  progress: number;
  isFavorite: boolean;
  rating?: number | null;
}

export interface SharedProfileViewDto {
  username: string;
  avatarUrl?: string;
  bio?: string;
  joinedAt: string;
  expiresAt: string;
  stats: ProfileStatsDto;
  items: SharedProfileItemDto[];
}

export interface ExportDataDto {
  exportedAt: string;
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: string;
  };
  library: Array<{
    id: string;
    mediaItemId: string;
    title?: string;
    slug?: string;
    category?: string;
    status: string;
    progress: number;
    progressVolumes?: number | null;
    rating?: number | null;
    isFavorite: boolean;
    rewatchCount: number;
    updatedAt: string;
  }>;
  diary?: Array<any>;
}

