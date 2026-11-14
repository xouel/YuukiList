'use client';

/**
 * YuukiList — Formulário de Solicitação de Recuperação de Senha
 * Conforme Requisito: Password Recovery and Reset Interface
 * Paleta Mineral Asian Editorial: Acento Carmim (#E05347)
 */

import React, { useState, useCallback, type FormEvent, type FocusEvent } from 'react';
import Link from 'next/link';
import { authApiClient, AuthApiError } from '../../services/auth-api.client.ts';
import {
  validateForgotPasswordFields,
  type ForgotPasswordFormErrors,
} from './validation.ts';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [touched, setTouched] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleBlur = useCallback((_e: FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    const fieldErrors = validateForgotPasswordFields({ email });
    setErrors(fieldErrors);
  }, [email]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched) {
      const fieldErrors = validateForgotPasswordFields({ email: val });
      setErrors(fieldErrors);
    }
    if (apiError) setApiError(null);
  }, [touched, apiError]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    setApiError(null);

    const validationErrors = validateForgotPasswordFields({ email });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authApiClient.requestPasswordReset({ email });
      setSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof AuthApiError) {
        setApiError(err.message);
      } else {
        setApiError('Não foi possível processar a solicitação no momento. Tente novamente mais tarde.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] tracking-tight">
          Recuperar Senha
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
          Informe o e-mail cadastrado na sua conta para receber as instruções de recuperação.
        </p>
      </div>

      {apiError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/30 text-accent text-sm flex items-start gap-3"
        >
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="leading-snug">{apiError}</span>
        </div>
      )}

      {submitted ? (
        <div
          role="status"
          aria-live="polite"
          className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-4"
        >
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 flex-shrink-0 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h2 className="font-semibold text-emerald-300 text-base">E-mail de recuperação enviado</h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                Se este e-mail estiver cadastrado no YuukiList, enviamos um link com validade de 30 minutos.
                Verifique sua caixa de entrada e também a pasta de lixo eletrônico (spam).
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setEmail('');
              }}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] underline transition-colors"
            >
              Tentar outro e-mail
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide transition-colors"
            >
              Voltar para o Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="forgot-email" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
              E-mail cadastrado
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="seu@email.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'forgot-email-error' : undefined}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-surface-canvas border transition-all duration-200 outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 focus:ring-2 focus:ring-accent/20 ${
                errors.email
                  ? 'border-accent focus:border-accent'
                  : 'border-stroke-subtle focus:border-accent/60'
              }`}
            />
            {errors.email && (
              <p id="forgot-email-error" role="alert" className="text-xs text-accent mt-1.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-accent" />
                {errors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 px-4 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Enviando link...</span>
              </>
            ) : (
              <span>Enviar link de recuperação</span>
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs text-[var(--color-text-secondary)] hover:text-accent font-medium transition-colors"
            >
              ← Lembrou sua senha? Voltar ao login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
