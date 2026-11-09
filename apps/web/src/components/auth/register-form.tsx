'use client';

/**
 * YuukiList — Formulário de Cadastro de Conta
 * Conforme Requisito: User Registration Interface and Client-Side Validation
 */

import React, { useState, useCallback, type FormEvent, type FocusEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { RegisterDto } from '../../../../../packages/shared/src/index.ts';
import { useAuth } from '../../context/auth-context.tsx';
import {
  validateRegisterFields,
  type RegisterFormErrors as FormErrors,
} from './validation.ts';

export type { FormErrors };
export { validateRegisterFields };

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [values, setValues] = useState<RegisterDto>({
    email: '',
    username: '',
    password: '',
  });

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

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-[#121520] border border-[#181C2B] shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Criar sua Conta</h1>
        <p className="text-sm text-[#94A3B8]">
          Junte-se ao YuukiList e organize sua jornada pelo entretenimento asiático.
        </p>
      </div>

      {apiError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 text-[#FCA5A5] text-sm flex items-start gap-3"
        >
          <svg
            className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5"
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
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
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
            className={`w-full px-4 py-3 rounded-xl bg-[#0B0D13] border text-white placeholder-[#64748B] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#06B6D4] ${
              touched.email && errors.email
                ? 'border-[#EF4444] focus:border-[#EF4444]'
                : 'border-[#181C2B] focus:border-[#06B6D4]'
            }`}
            placeholder="seu.email@exemplo.com"
          />
          {touched.email && errors.email && (
            <p id="email-error" role="alert" className="mt-1.5 text-xs text-[#EF4444]">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
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
            className={`w-full px-4 py-3 rounded-xl bg-[#0B0D13] border text-white placeholder-[#64748B] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#06B6D4] ${
              touched.username && errors.username
                ? 'border-[#EF4444] focus:border-[#EF4444]'
                : 'border-[#181C2B] focus:border-[#06B6D4]'
            }`}
            placeholder="seu_usuario"
          />
          {touched.username && errors.username && (
            <p id="username-error" role="alert" className="mt-1.5 text-xs text-[#EF4444]">
              {errors.username}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={values.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            aria-invalid={Boolean(touched.password && errors.password)}
            aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
            className={`w-full px-4 py-3 rounded-xl bg-[#0B0D13] border text-white placeholder-[#64748B] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#06B6D4] ${
              touched.password && errors.password
                ? 'border-[#EF4444] focus:border-[#EF4444]'
                : 'border-[#181C2B] focus:border-[#06B6D4]'
            }`}
            placeholder="Mínimo 8 caracteres"
          />
          {touched.password && errors.password && (
            <p id="password-error" role="alert" className="mt-1.5 text-xs text-[#EF4444]">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3.5 px-6 rounded-xl font-medium text-sm text-black bg-[#06B6D4] hover:bg-[#22D3EE] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#06B6D4]/20 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
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

      <div className="mt-8 text-center text-xs text-[#94A3B8]">
        Já possui uma conta?{' '}
        <a href="/login" className="text-[#06B6D4] hover:underline font-medium">
          Entrar agora
        </a>
      </div>
    </div>
  );
}
