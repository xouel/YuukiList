'use client';

/**
 * YuukiList — Formulário de Login de Usuário
 * Conforme Requisito: User Login Interface and Session Recovery
 * Paleta Mineral Asian Editorial: Acento Carmim (#E05347)
 */

import React, { useState, useCallback, useMemo, useRef, type FormEvent, type FocusEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LoginDto } from '../../../../../packages/shared/src/index.ts';
import { useAuth } from '../../context/auth-context.tsx';
import {
  validateLoginFields,
  type LoginFormErrors,
} from './validation.ts';

export type { LoginFormErrors };
export { validateLoginFields };

interface LoginFormProps {
  embedded?: boolean;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ embedded = false, onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const resetSuccess = useMemo(() => searchParams?.get('reset') === 'success', [searchParams]);

  const redirectUrl = useMemo(() => {
    return searchParams?.get('redirect') || '/';
  }, [searchParams]);

  const [values, setValues] = useState<LoginDto>({
    identifier: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleBlur = useCallback(
    (field: keyof LoginDto) => (_e: FocusEvent<HTMLInputElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldErrors = validateLoginFields(values);
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    },
    [values]
  );

  const handleChange = useCallback(
    (field: keyof LoginDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setValues((prev) => ({ ...prev, [field]: val }));
      if (touched[field]) {
        const nextValues = { ...values, [field]: val };
        const fieldErrors = validateLoginFields(nextValues);
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
      }
    },
    [values, touched]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setApiError(null);

      setTouched({ identifier: true, password: true });
      const validationErrors = validateLoginFields(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      try {
        await login(values);
        window.location.href = redirectUrl || '/';
      } catch (err: any) {
        const isAuthError = err.statusCode === 401 || err.code === 'INVALID_CREDENTIALS';
        const message = isAuthError
          ? 'Usuário/e-mail ou senha incorretos. Verifique suas credenciais.'
          : err.message || 'Erro de conexão ou servidor ao autenticar. Tente novamente.';
        setApiError(message);
        if (isAuthError) {
          passwordInputRef.current?.focus();
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, login, router, redirectUrl]
  );

  const formBody = (
    <>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-[var(--color-text-primary)] tracking-tight mb-1.5">
          Acessar Conta
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
          Informe suas credenciais para gerenciar sua biblioteca e acompanhar estreias.
        </p>
      </div>

      {resetSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <svg
            className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="leading-snug">Senha redefinida com sucesso! Acesse sua conta com a nova senha.</span>
        </div>
      )}

      {apiError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-5 p-3.5 rounded-xl bg-red-950/30 border border-red-800/60 text-red-200 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <svg
            className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="leading-snug">{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="identifier"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5"
          >
            E-mail ou Nome de Usuário
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            value={values.identifier}
            onChange={handleChange('identifier')}
            onBlur={handleBlur('identifier')}
            aria-invalid={Boolean(touched.identifier && errors.identifier)}
            aria-describedby={touched.identifier && errors.identifier ? 'identifier-error' : undefined}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-surface-sunken border text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/60 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              touched.identifier && errors.identifier
                ? 'border-red-500/80 focus:border-red-500'
                : 'border-stroke-subtle focus:border-stroke-accent'
            }`}
            placeholder="usuario ou seu.email@exemplo.com"
          />
          {touched.identifier && errors.identifier && (
            <p id="identifier-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.identifier}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]"
            >
              Senha
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-accent hover:underline font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              ref={passwordInputRef}
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={values.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              aria-invalid={Boolean(touched.password && errors.password)}
              aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
              className={`w-full min-h-[44px] pl-3.5 pr-12 py-2.5 rounded-xl bg-surface-sunken border text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/60 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                touched.password && errors.password
                  ? 'border-red-500/80 focus:border-red-500'
                  : 'border-stroke-subtle focus:border-stroke-accent'
              }`}
              placeholder="Sua senha secreta"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg cursor-pointer"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {touched.password && errors.password && (
            <p id="password-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[44px] mt-2 py-2.5 px-6 rounded-xl font-semibold text-sm text-white bg-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-accent/20 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Entrando...</span>
            </>
          ) : (
            <span>Entrar</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[var(--color-text-secondary)]">
        Ainda não tem conta?{' '}
        {onSwitchToRegister ? (
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-accent hover:underline font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
          >
            Criar conta agora
          </button>
        ) : (
          <Link href="/register" className="text-accent hover:underline font-semibold focus-visible:ring-2 focus-visible:ring-accent">
            Criar conta agora
          </Link>
        )}
      </div>
    </>
  );

  if (embedded) {
    return <div className="w-full">{formBody}</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-surface-raised border border-stroke-subtle shadow-hairline-top shadow-2xl">
      {formBody}
    </div>
  );
}
