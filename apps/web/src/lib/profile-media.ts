export type ProfileMediaKind = 'avatar' | 'banner';

export interface ProfileImageResizeSpec {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

export const MAX_VERCEL_SAFE_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB
export const MAX_RAW_SELECTION_BYTES = 12 * 1024 * 1024; // 12 MB antes da compressão cliente

const RESIZE_SPECS: Record<ProfileMediaKind, ProfileImageResizeSpec> = {
  avatar: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.85,
  },
  banner: {
    maxWidth: 1440,
    maxHeight: 540,
    quality: 0.82,
  },
};

export function getProfileImageResizeSpec(kind: ProfileMediaKind): ProfileImageResizeSpec {
  return RESIZE_SPECS[kind];
}

export function formatCssBackgroundUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const escaped = trimmed.replace(/\\/g, '\\\\').replace(/"/g, '%22');
  return `url("${escaped}")`;
}

function loadBrowserImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Não foi possível decodificar a imagem selecionada.'));
    };
    img.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/**
 * Redimensiona e comprime imagens raster (JPEG/PNG/WebP) no navegador para manter
 * payloads leves no PostgreSQL e abaixo do limite de 4,5 MB da Vercel.
 */
export async function optimizeProfileImageFile(
  file: File,
  kind: ProfileMediaKind
): Promise<File> {
  if (!file || file.size === 0) {
    throw new Error('Arquivo de imagem vazio ou inválido.');
  }

  if (file.size > MAX_RAW_SELECTION_BYTES) {
    throw new Error('O arquivo excede o limite máximo permitido de 12 MB.');
  }

  if (file.type === 'image/gif') {
    if (file.size > MAX_VERCEL_SAFE_UPLOAD_BYTES) {
      throw new Error('GIF animado excede o limite máximo permitido de 4 MB.');
    }
    return file;
  }

  if (
    typeof document === 'undefined' ||
    typeof Image === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    if (file.size > MAX_VERCEL_SAFE_UPLOAD_BYTES) {
      throw new Error('O arquivo excede o limite máximo permitido de 4 MB.');
    }
    return file;
  }

  const spec = getProfileImageResizeSpec(kind);
  const img = await loadBrowserImage(file);
  const srcWidth = Math.max(1, img.naturalWidth || img.width || spec.maxWidth);
  const srcHeight = Math.max(1, img.naturalHeight || img.height || spec.maxHeight);
  const ratio = Math.min(spec.maxWidth / srcWidth, spec.maxHeight / srcHeight, 1);

  const targetWidth = Math.max(1, Math.round(srcWidth * ratio));
  const targetHeight = Math.max(1, Math.round(srcHeight * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (file.size > MAX_VERCEL_SAFE_UPLOAD_BYTES) {
      throw new Error('O arquivo excede o limite máximo permitido de 4 MB.');
    }
    return file;
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  let blob = await canvasToBlob(canvas, 'image/webp', spec.quality);
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasToBlob(canvas, 'image/jpeg', spec.quality);
  }

  if (blob && blob.size > MAX_VERCEL_SAFE_UPLOAD_BYTES) {
    const tighter = await canvasToBlob(canvas, blob.type || 'image/jpeg', 0.68);
    if (tighter) {
      blob = tighter;
    }
  }

  if (!blob) {
    if (file.size > MAX_VERCEL_SAFE_UPLOAD_BYTES) {
      throw new Error('O arquivo excede o limite máximo permitido de 4 MB.');
    }
    return file;
  }

  if (
    file.size <= 150 * 1024 &&
    srcWidth <= spec.maxWidth &&
    srcHeight <= spec.maxHeight &&
    blob.size >= file.size
  ) {
    return file;
  }

  if (blob.size > MAX_VERCEL_SAFE_UPLOAD_BYTES) {
    throw new Error('Não foi possível reduzir a imagem para menos de 4 MB.');
  }

  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '') || kind;
  return new File([blob], `${baseName}.${ext}`, {
    type: blob.type || 'image/webp',
    lastModified: Date.now(),
  });
}
