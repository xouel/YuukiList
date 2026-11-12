'use client';

/**
 * YuukiList — Página de Login (/login)
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context.tsx';
import { AuthDossierCard } from '../../components/auth/auth-dossier-card.tsx';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2B2735] border-t-[#E05347] animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main id="main-content" className="py-8 sm:py-12 px-4 sm:px-6 flex items-center justify-center">
      <AuthDossierCard initialTab="signin" />
    </main>
  );
}
