import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif-editorial': ['var(--font-serif-editorial)', 'Shippori Mincho', 'Playfair Display', 'Cinzel', 'serif'],
        'sans-ui': ['var(--font-sans-ui)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        'cjk': ['var(--font-cjk)', 'Noto Sans KR', 'Noto Sans JP', 'sans-serif'],
      },
      colors: {
        nanquim: '#121115',
        estante: '#1A1820',
        papel: '#F4EFEA',
        carmim: '#E05347',
        background: 'var(--color-bg-base)',
        surface: {
          DEFAULT: 'var(--color-bg-surface)',
          canvas: 'var(--surface-canvas)',
          raised: 'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
          sunken: 'var(--surface-sunken)',
        },
        stroke: {
          subtle: 'var(--stroke-subtle)',
          strong: 'var(--stroke-strong)',
          accent: 'var(--stroke-accent)',
        },
        'media-video': 'var(--accent-media-video)',
        'media-print': 'var(--accent-media-print)',
        'media-anime': 'var(--accent-media-anime)',
        card: 'var(--color-bg-card)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        cyan: {
          400: '#E05347',
          500: '#E05347',
        },
      },
      boxShadow: {
        'hairline-top': 'var(--highlight-hairline)',
      },
    },
  },
  plugins: [],
};

export default config;
