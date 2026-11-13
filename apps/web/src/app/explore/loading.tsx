import React from 'react';
import { MediaGridSkeleton } from '../../components/catalog/media-card-skeleton.tsx';

export default function ExploreLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-9 w-64 rounded-lg bg-surface-raised border border-stroke-subtle" />
        <div className="h-4 w-96 max-w-full rounded bg-surface-overlay" />
        <div className="h-11 w-full rounded-xl bg-surface-raised border border-stroke-subtle" />
      </div>
      <div className="h-12 w-full rounded-xl bg-surface-raised border border-stroke-subtle" />
      <MediaGridSkeleton count={12} />
    </div>
  );
}

