'use client';

/**
 * YuukiList — Página de Esqueci Minha Senha (/forgot-password)
 * Conforme Requisito: Password Recovery and Reset Interface
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context.tsx';
import { ForgotPasswordForm } from '../../components/auth/forgot-password-form.tsx';

export default function ForgotPasswordPage() {
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
              &ldquo;Seus dados e registros protegidos com criptografia de ponta a ponta.&rdquo;
            </blockquote>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pt-1">
              Links de redefinição são assinados com SHA-256 e possuem validade temporária de 30 minutos
              para garantir total soberania e proteção à sua biblioteca.
            </p>
          </div>

          <div className="pt-8 space-y-2.5 border-t border-stroke-subtle mt-6 lg:mt-0">
            <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-secondary)]">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium">Tokens Descartáveis de Uso Único</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-secondary)]">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium">Revogação Automática de Sessões Antigas</span>
            </div>
          </div>
        </section>

        {/* Coluna Direita (7 slots): Formulário */}
        <section
          aria-label="Formulário de recuperação de senha"
          className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center"
        >
          <ForgotPasswordForm />
        </section>
      </div>
    </main>
  );
}
