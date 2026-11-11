import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'YuukiList — Catálogo e Rastreador de Entretenimento Asiático',
    short_name: 'YuukiList',
    description: 'Acompanhe doramas, filmes, animes, mangás, manhwas e manhuas em um só lugar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090a0f',
    theme_color: '#e50914',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
