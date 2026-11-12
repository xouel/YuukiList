'use client';

/**
 * YuukiList — Formulário de Cadastro de Conta
 * Conforme Requisito: User Registration Interface and Client-Side Validation
 * Paleta Mineral Asian Editorial: Acento Carmim (#E05347)
 */

import React, { useState, useCallback, type FormEvent, type FocusEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { RegisterDto } from '../../../../../packages/shared/src/index.ts';
import { useAuth } from '../../context/auth-context.tsx';
import {
  validateRegisterFields,
  type RegisterFormErrors as FormErrors,
} from './validation.ts';

export type { FormErrors };
export { validateRegisterFields };

interface RegisterFormProps {
  embedded?: boolean;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ embedded = false, onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const { register } = useAuth();

  const [values, setValues] = useState<RegisterDto>({
    email: '',
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleBlur = useCallback(
    (field: keyof RegisterDto) => (_e: FocusEvent<HTMLInputElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldErrors = validateRegisterFields(values);
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    },
    [values]
  );

  const handleChange = useCallback(
    (field: keyof RegisterDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setValues((prev) => ({ ...prev, [field]: val }));
      if (touched[field]) {
        const nextValues = { ...values, [field]: val };
        const fieldErrors = validateRegisterFields(nextValues);
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
      }
    },
    [values, touched]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setApiError(null);

      // Marca todos como tocados e valida
      setTouched({ email: true, username: true, password: true });
      const validationErrors = validateRegisterFields(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      try {
        await register(values);
        window.location.href = '/';
      } catch (err: any) {
        const message =
          err.statusCode === 409
            ? 'Email ou nome de usuário já cadastrado no YuukiList.'
            : err.message || 'Erro ao criar conta. Verifique seus dados.';
        setApiError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, register, router]
  );

  const formBody = (
    <>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-[var(--color-text-primary)] tracking-tight mb-1.5">
          Criar sua Conta
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
          Junte-se ao YuukiList e organize sua jornada pelo entretenimento asiático.
        </p>
      </div>

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
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            aria-invalid={Boolean(touched.email && errors.email)}
            aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-surface-sunken border text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/60 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              touched.email && errors.email
                ? 'border-red-500/80 focus:border-red-500'
                : 'border-stroke-subtle focus:border-stroke-accent'
            }`}
            placeholder="seu.email@exemplo.com"
          />
          {touched.email && errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
            Nome de Usuário
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={values.username}
            onChange={handleChange('username')}
            onBlur={handleBlur('username')}
            aria-invalid={Boolean(touched.username && errors.username)}
            aria-describedby={touched.username && errors.username ? 'username-error' : undefined}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-surface-sunken border text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/60 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              touched.username && errors.username
                ? 'border-red-500/80 focus:border-red-500'
                : 'border-stroke-subtle focus:border-stroke-accent'
            }`}
            placeholder="seu_usuario"
          />
          {touched.username && errors.username && (
            <p id="username-error" role="alert" className="mt-1 text-xs text-red-400">
              {errors.username}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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
              placeholder="Mínimo 8 caracteres"
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
              <span>Criando conta...</span>
            </>
          ) : (
            <span>Criar Conta</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[var(--color-text-secondary)]">
        Já possui uma conta?{' '}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-accent hover:underline font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
          >
            Entrar agora
          </button>
        ) : (
          <Link href="/login" className="text-accent hover:underline font-semibold focus-visible:ring-2 focus-visible:ring-accent">
            Entrar agora
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
