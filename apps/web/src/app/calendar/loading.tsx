import React from 'react';

export default function CalendarLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-24 rounded-2xl bg-surface-raised border border-stroke-subtle" />
        <div className="h-24 rounded-2xl bg-surface-raised border border-stroke-subtle" />
        <div className="h-24 rounded-2xl bg-surface-raised border border-stroke-subtle" />
      </div>
      <div className="h-20 rounded-2xl bg-surface-raised border border-stroke-subtle" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-3">
          <div className="h-24 rounded-xl bg-surface-raised border border-stroke-subtle" />
          <div className="h-24 rounded-xl bg-surface-raised border border-stroke-subtle" />
          <div className="h-24 rounded-xl bg-surface-raised border border-stroke-subtle" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="h-44 rounded-2xl bg-surface-raised border border-stroke-subtle" />
          <div className="h-44 rounded-2xl bg-surface-raised border border-stroke-subtle" />
        </div>
      </div>
    </div>
  );
}

