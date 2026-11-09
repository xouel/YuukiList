'use client';

/**
 * YuukiList — Página de Login (/login)
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context.tsx';
import { LoginForm } from '../../components/auth/login-form.tsx';

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
        <div className="w-8 h-8 rounded-full border-2 border-[#181C2B] border-t-[#06B6D4] animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main id="main-content" className="py-12 px-4 sm:px-6 flex items-center justify-center">
      <LoginForm />
    </main>
  );
}

