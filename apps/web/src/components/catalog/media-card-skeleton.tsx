'use client';

import React from 'react';

export function MediaCardSkeleton() {
  return (
    <div className="bg-[#181C2B] rounded-xl overflow-hidden border border-[#262C3F] animate-pulse flex flex-col h-full">
      {/* Capa Skeleton (2:3) */}
      <div className="aspect-[2/3] w-full bg-[#1F2438]" />

      {/* Conteúdo Skeleton */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 bg-[#262C3F] rounded w-4/5" />
          <div className="h-3 bg-[#262C3F]/60 rounded w-1/2" />
        </div>

        <div className="pt-2 border-t border-[#262C3F]/40 flex justify-between">
          <div className="h-3 bg-[#262C3F]/60 rounded w-1/3" />
          <div className="h-3 bg-[#262C3F]/60 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function MediaGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <MediaCardSkeleton key={`skeleton-${idx}`} />
      ))}
    </div>
  );
}
