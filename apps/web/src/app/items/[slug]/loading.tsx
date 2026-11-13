import React from 'react';

export default function ItemDetailLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="h-10 w-44 rounded-lg bg-surface-raised border border-stroke-subtle" />
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-raised border border-stroke-subtle">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          <div className="md:col-span-4 lg:col-span-3 aspect-[2/3] max-w-[260px] w-full mx-auto rounded-xl bg-surface-overlay" />
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            <div className="h-6 w-40 rounded bg-surface-overlay" />
            <div className="h-10 w-3/4 rounded bg-surface-overlay" />
            <div className="h-24 w-full rounded-xl bg-surface-overlay" />
            <div className="h-32 w-full rounded-xl bg-surface-overlay" />
          </div>
        </div>
      </div>
    </div>
  );
}

