'use client';

import React, { useState, useEffect } from 'react';
import type { AvatarFrameType, UpdateProfileDto } from '../../../../../packages/shared/src/index.ts';
import { AvatarFrame, AVATAR_FRAMES } from './avatar-frame.tsx';
import { optimizeProfileImageFile, formatCssBackgroundUrl } from '../../lib/profile-media.ts';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    username?: string;
    avatarUrl?: string | null;
    avatarFrame?: AvatarFrameType | string | null;
    bannerUrl?: string | null;
    bio?: string | null;
    phone?: string | null;
    location?: string | null;
  };
  onSave: (updated: UpdateProfileDto) => Promise<void>;
}

export function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: EditProfileModalProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || '');
  const [avatarFrame, setAvatarFrame] = useState<AvatarFrameType>(
    (initialData.avatarFrame as AvatarFrameType) || 'none'
  );
  const [bannerUrl, setBannerUrl] = useState(initialData.bannerUrl || '');
  const [bio, setBio] = useState(initialData.bio || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [location, setLocation] = useState(initialData.location || '');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setAvatarUrl(initialData.avatarUrl || '');
    setAvatarFrame((initialData.avatarFrame as AvatarFrameType) || 'none');
    setBannerUrl(initialData.bannerUrl || '');
    setBio(initialData.bio || '');
    setPhone(initialData.phone || '');
    setLocation(initialData.location || '');
    setErrorMessage(null);
  }, [
    isOpen,
    initialData.avatarUrl,
    initialData.avatarFrame,
    initialData.bannerUrl,
    initialData.bio,
    initialData.phone,
    initialData.location,
  ]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const inputEl = e.target;
    const file = inputEl.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const optimizedFile = await optimizeProfileImageFile(file, type);
      const formData = new FormData();
      formData.append('file', optimizedFile);
      formData.append('type', type);

      const res = await fetch('/api/v1/profile/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Falha no upload da imagem.');
      }

      const data = await res.json();
      if (type === 'avatar') {
        setAvatarUrl(data.url);
      } else {
        setBannerUrl(data.url);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao carregar o arquivo.');
    } finally {
      inputEl.value = '';
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSave({
        avatarUrl: avatarUrl.trim() || null,
        avatarFrame,
        bannerUrl: bannerUrl.trim() || null,
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        location: location.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar alterações do perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-surface-raised border border-stroke-subtle shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-stroke-subtle pb-4">
          <div>
            <h2 id="edit-profile-title" className="font-serif-editorial text-2xl font-bold text-[var(--color-text-primary)]">
              Personalizar Perfil
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Personalize sua identidade, molduras e dados com segurança
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-surface-overlay transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pré-visualização da Capa e Avatar */}
          <div className="relative rounded-xl overflow-hidden border border-stroke-subtle bg-surface-canvas">
            {/* Banner preview */}
            <div
              className="h-28 w-full bg-cover bg-center relative"
              style={{
                backgroundImage:
                  formatCssBackgroundUrl(bannerUrl) ||
                  'linear-gradient(to right, var(--surface-overlay), var(--surface-sunken))',
              }}
            >
              <label className="absolute right-3 top-3 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-medium cursor-pointer backdrop-blur border border-white/10 transition-all active:scale-[0.98]">
                {isUploading ? 'Enviando...' : 'Trocar Capa'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'banner')}
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* Avatar preview com a moldura selecionada */}
            <div className="p-4 pt-0 -mt-10 flex items-end gap-4">
              <AvatarFrame frame={avatarFrame} size="xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent flex items-center justify-center text-xl font-bold text-white">
                    {(initialData.username || 'U')[0].toUpperCase()}
                  </div>
                )}
              </AvatarFrame>

              <label className="mb-2 px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-overlay text-[var(--color-text-primary)] text-xs font-medium border border-stroke-subtle cursor-pointer transition-all active:scale-[0.98]">
                {isUploading ? 'Enviando...' : 'Trocar Foto'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'avatar')}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {/* Seleção de Molduras Editoriais */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Moldura do Avatar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {AVATAR_FRAMES.map((f) => {
                const isSelected = avatarFrame === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAvatarFrame(f.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-accent bg-accent/10 shadow-sm shadow-accent/20'
                        : 'border-stroke-subtle bg-surface-sunken hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">{f.name}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] line-clamp-1 mt-0.5">
                      {f.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Biografia */}
          <div className="space-y-1.5">
            <label htmlFor="bio-input" className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Biografia
            </label>
            <textarea
              id="bio-input"
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Compartilhe seus gostos, animes ou doramas favoritos..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-canvas border border-stroke-subtle text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-accent transition-colors"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] block text-right">
              {bio.length}/500 caracteres
            </span>
          </div>

          {/* Informações Pessoais Opcionais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Localização */}
            <div className="space-y-1.5">
              <label htmlFor="location-input" className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Localização (Opcional)
              </label>
              <input
                id="location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: São Paulo, Brasil"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-canvas border border-stroke-subtle text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Telefone Privado */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="phone-input" className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Telefone (Opcional)
                </label>
                <span className="text-[10px] text-emerald-400 font-medium">Privado · LGPD</span>
              </div>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 (11) 99999-9999"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-canvas border border-stroke-subtle text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stroke-subtle">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs shadow-lg shadow-accent/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>Salvar Alterações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

