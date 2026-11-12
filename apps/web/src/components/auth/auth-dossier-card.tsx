'use client';

import React, { useState } from 'react';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';

interface AuthDossierCardProps {
  initialTab?: 'signin' | 'signup';
}

export function AuthDossierCard({ initialTab = 'signin' }: AuthDossierCardProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-[#1A1820] border border-[#2B2735] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 transition-all">
      {/* Coluna Esquerda (5 slots): Vitrine Editorial */}
      <section
        aria-label="Apresentação institucional YuukiList"
        className="lg:col-span-5 relative flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-[#16141B] via-[#1A1820] to-[#201D28] border-b lg:border-b-0 lg:border-r border-[#2B2735]"
      >
        <div className="space-y-4">
          {/* Badge de Categoria */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#E05347]/10 text-[#E05347] border border-[#E05347]/25 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E05347] animate-pulse" />
            <span>Entretenimento Asiático</span>
          </div>

          {/* Wordmark Tipográfico */}
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4EFEA] tracking-tight">
            YUUKILIST
          </h2>

          {/* Citação Editorial */}
          <blockquote className="text-sm text-zinc-300 font-serif italic leading-relaxed border-l-2 border-[#E05347]/40 pl-3">
            &ldquo;Seu refúgio para catalogar, vivenciar e revisitar histórias orientais.&rdquo;
          </blockquote>

          <p className="text-xs text-zinc-400 leading-relaxed pt-1">
            Mantenha seu diário sincronizado, acompanhe lançamentos no fuso oficial e organize
            seus doramas, animes, mangás e manhwas em um só lugar.
          </p>
        </div>

        {/* Selos de Confiança e Valores Fundamentais */}
        <div className="pt-8 space-y-2.5 border-t border-[#2B2735]/60 mt-6 lg:mt-0">
          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <svg className="w-4 h-4 text-[#E05347]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">Soberania Total de Dados (LGPD)</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Custo Zero Permanente</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Fuso Sincronizado JST e Local</span>
          </div>
        </div>
      </section>

      {/* Coluna Direita (7 slots): Formulário e Abas */}
      <section
        aria-label="Formulário de acesso e registro"
        className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-[#1A1820]"
      >
        {/* Alternador Fluido de Abas no Topo */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div
            role="tablist"
            aria-label="Alternar entre Entrar e Criar Conta"
            className="inline-flex p-1 rounded-xl bg-[#24202C] border border-[#2B2735] w-full sm:w-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'signin'}
              onClick={() => setActiveTab('signin')}
              className={`flex-1 sm:flex-initial min-h-[44px] px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E05347]/40 ${
                activeTab === 'signin'
                  ? 'bg-[#E05347] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'signup'}
              onClick={() => setActiveTab('signup')}
              className={`flex-1 sm:flex-initial min-h-[44px] px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E05347]/40 ${
                activeTab === 'signup'
                  ? 'bg-[#E05347] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Formulário Renderizado Dinamicamente */}
        <div className="transition-all duration-200 ease-out">
          {activeTab === 'signin' ? (
            <LoginForm
              embedded
              onSwitchToRegister={() => setActiveTab('signup')}
            />
          ) : (
            <RegisterForm
              embedded
              onSwitchToLogin={() => setActiveTab('signin')}
            />
          )}
        </div>
      </section>
    </div>
  );
}

