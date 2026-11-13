import React from 'react';
import { MediaGridSkeleton } from '../../components/catalog/media-card-skeleton.tsx';

export default function LibraryLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="h-24 rounded-2xl bg-surface-raised border border-stroke-subtle" />
      <div className="h-12 rounded-xl bg-surface-raised border border-stroke-subtle" />
      <MediaGridSkeleton count={8} />
    </div>
  );
}

