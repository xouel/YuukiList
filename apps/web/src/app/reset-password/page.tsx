'use client';

/**
 * YuukiList — Página de Redefinição de Senha (/reset-password)
 * Conforme Requisito: Password Recovery and Reset Interface
 */

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/auth-context.tsx';
import { ResetPasswordForm } from '../../components/auth/reset-password-form.tsx';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? null;

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
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
      <div className="w-full max-w-4xl mx-auto rounded-2xl bg-surface-raised border border-stroke-subtle shadow-hairline-top overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 transition-all">
        {/* Coluna Esquerda (5 slots): Vitrine Editorial */}
        <section
          aria-label="Apresentação institucional YuukiList"
          className="lg:col-span-5 relative flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-surface-canvas via-surface-raised to-surface-overlay border-b lg:border-b-0 lg:border-r border-stroke-subtle"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/25 self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>Segurança da Conta</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-primary)] tracking-tight">
              YUUKILIST
            </h2>

            <blockquote className="text-sm text-[var(--color-text-secondary)] font-serif italic leading-relaxed border-l-2 border-accent/40 pl-3">
              &ldquo;Atualize sua credencial com segurança e retome seu diário de histórias.&rdquo;
            </blockquote>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pt-1">
              Ao confirmar a nova senha, o link atual é invalidado permanentemente e todas as sessões
              anteriores são encerradas de forma automática.
            </p>
          </div>

          <div className="pt-8 space-y-2.5 border-t border-stroke-subtle mt-6 lg:mt-0">
            <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-secondary)]">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium">Proteção por Hash Scrypt & SHA-256</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-secondary)]">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium">Consumo Único Atômico</span>
            </div>
          </div>
        </section>

        {/* Coluna Direita (7 slots): Formulário */}
        <section
          aria-label="Formulário de redefinição de senha"
          className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center"
        >
          <Suspense
            fallback={
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-stroke-subtle border-t-accent animate-spin" />
                <p className="text-sm text-[var(--color-text-secondary)]">Carregando formulário...</p>
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
