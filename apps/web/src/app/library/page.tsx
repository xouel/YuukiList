import React from 'react';
import { ProtectedRoute } from '../../components/auth/protected-route.tsx';
import { LibraryView } from '../../components/library/library-view.tsx';

export const metadata = {
  title: 'Minha Biblioteca — YuukiList',
  description: 'Gerencie seu catálogo pessoal de doramas, filmes, animes e mangás.',
};

export default function LibraryPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#0B0D13] text-[#F3F4F6] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <LibraryView />
      </main>
    </ProtectedRoute>
  );
}

