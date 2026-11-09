import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0D13',
        surface: '#121520',
        card: '#181C2B',
        border: '#262C3F',
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
        },
      },
    },
  },
  plugins: [],
};

export default config;

