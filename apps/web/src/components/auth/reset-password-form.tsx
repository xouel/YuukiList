'use client';

/**
 * YuukiList — Formulário de Redefinição de Senha
 * Conforme Requisito: Password Recovery and Reset Interface
 * Paleta Mineral Asian Editorial: Acento Carmim (#E05347)
 */

import React, { useState, useEffect, useCallback, type FormEvent, type FocusEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApiClient, AuthApiError } from '../../services/auth-api.client.ts';
import {
  validateResetPasswordFields,
  type ResetPasswordFormErrors,
} from './validation.ts';

interface ResetPasswordFormProps {
  token: string | null;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();

  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [tokenValid, setTokenValid] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !token.trim()) {
      setIsValidating(false);
      setTokenValid(false);
      setTokenError('Link de redefinição não encontrado ou incompleto.');
      return;
    }

    let isMounted = true;
    authApiClient
      .validateResetToken(token)
      .then((res) => {
        if (isMounted) {
          if (res.valid) {
            setTokenValid(true);
          } else {
            setTokenValid(false);
            setTokenError('Este link de redefinição expirou ou já foi utilizado.');
          }
          setIsValidating(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setTokenValid(false);
          if (err instanceof AuthApiError) {
            setTokenError(err.message);
          } else {
            setTokenError('Link de redefinição inválido, expirado ou já utilizado.');
          }
          setIsValidating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleBlur = useCallback(
    (field: 'password' | 'confirmPassword') => (_e: FocusEvent<HTMLInputElement>) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldErrors = validateResetPasswordFields({ password, confirmPassword });
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    },
    [password, confirmPassword]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setPassword(val);
      if (touched.password) {
        const fieldErrors = validateResetPasswordFields({ password: val, confirmPassword });
        setErrors((prev) => ({ ...prev, password: fieldErrors.password }));
      }
      if (apiError) setApiError(null);
    },
    [touched.password, confirmPassword, apiError]
  );

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setConfirmPassword(val);
      if (touched.confirmPassword) {
        const fieldErrors = validateResetPasswordFields({ password, confirmPassword: val });
        setErrors((prev) => ({ ...prev, confirmPassword: fieldErrors.confirmPassword }));
      }
      if (apiError) setApiError(null);
    },
    [touched.confirmPassword, password, apiError]
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    setApiError(null);

    const validationErrors = validateResetPasswordFields({ password, confirmPassword });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || !token) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authApiClient.resetPassword({
        token,
        newPassword: password,
      });

      router.push('/login?reset=success');
    } catch (err: unknown) {
      if (err instanceof AuthApiError) {
        setApiError(err.message);
      } else {
        setApiError('Não foi possível redefinir sua senha no momento. Tente novamente.');
      }
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-stroke-subtle border-t-accent animate-spin" />
        <p className="text-sm text-[var(--color-text-secondary)]">Validando token de segurança...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="w-full space-y-6">
        <div
          role="alert"
          aria-live="assertive"
          className="p-6 rounded-xl bg-accent/10 border border-accent/30 text-accent space-y-4"
        >
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 flex-shrink-0 text-accent mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h2 className="font-semibold text-accent text-base">Link Inválido ou Expirado</h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                {tokenError || 'Este link de redefinição de senha já foi utilizado ou ultrapassou a validade limite de 30 minutos.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/forgot-password"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-colors"
          >
            Solicitar Novo Link
          </Link>
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-surface-canvas border border-stroke-subtle hover:border-stroke-strong text-[var(--color-text-primary)] text-sm font-medium transition-colors"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] tracking-tight">
          Criar Nova Senha
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
          Defina uma nova senha forte para acessar sua conta no YuukiList.
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

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="reset-password-input" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            Nova Senha
          </label>
          <div className="relative">
            <input
              id="reset-password-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={handlePasswordChange}
              onBlur={handleBlur('password')}
              placeholder="Mínimo de 8 caracteres"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'reset-password-error' : undefined}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 pr-11 rounded-xl text-sm bg-surface-canvas border transition-all duration-200 outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 focus:ring-2 focus:ring-accent/20 ${
                errors.password
                  ? 'border-accent focus:border-accent'
                  : 'border-stroke-subtle focus:border-accent/60'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar nova senha' : 'Exibir nova senha'}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
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
          {errors.password && (
            <p id="reset-password-error" role="alert" className="text-xs text-accent mt-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-accent" />
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reset-confirm-password-input" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
            Confirmar Nova Senha
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password-input"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handleBlur('confirmPassword')}
              placeholder="Digite a nova senha novamente"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'reset-confirm-error' : undefined}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 pr-11 rounded-xl text-sm bg-surface-canvas border transition-all duration-200 outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50 focus:ring-2 focus:ring-accent/20 ${
                errors.confirmPassword
                  ? 'border-accent focus:border-accent'
                  : 'border-stroke-subtle focus:border-accent/60'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Exibir confirmação de senha'}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            >
              {showConfirmPassword ? (
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
          {errors.confirmPassword && (
            <p id="reset-confirm-error" role="alert" className="text-xs text-accent mt-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-accent" />
              {errors.confirmPassword}
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
              <span>Redefinindo senha...</span>
            </>
          ) : (
            <span>Redefinir e Salvar Senha</span>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-xs text-[var(--color-text-secondary)] hover:text-accent font-medium transition-colors"
          >
            ← Voltar para o login
          </Link>
        </div>
      </form>
    </div>
  );
}
