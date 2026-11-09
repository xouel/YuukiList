import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_MEDIA_ITEMS } from './seed-data.ts';
import { generateSlug } from '../../../../packages/shared/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../../assets/covers');

const categoryColors: Record<string, { g1: string; g2: string; accent: string; badge: string }> = {
  DORAMA: { g1: '#1a1026', g2: '#0b0814', accent: '#d946ef', badge: '#701a75' },
  FILME: { g1: '#131b2e', g2: '#080c14', accent: '#38bdf8', badge: '#0c4a6e' },
  ANIME: { g1: '#1e1438', g2: '#0b0618', accent: '#a855f7', badge: '#581c87' },
  MANGA: { g1: '#1f1e24', g2: '#0d0d10', accent: '#f59e0b', badge: '#78350f' },
  MANHWA: { g1: '#0e2424', g2: '#061212', accent: '#10b981', badge: '#064e3b' },
  MANHUA: { g1: '#261414', g2: '#120707', accent: '#f43f5e', badge: '#881337' },
};

fs.mkdirSync(outDir, { recursive: true });

for (const item of SEED_MEDIA_ITEMS) {
  const slug = generateSlug(item.title);
  const col = categoryColors[item.category] || { g1: '#12141c', g2: '#090a0f', accent: '#00e5ff', badge: '#1e293b' };
  const orig = item.originalTitle ? item.originalTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;') : '';
  const title = item.title.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">
  <defs>
    <linearGradient id="bg-${slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${col.g1}"/>
      <stop offset="100%" stop-color="${col.g2}"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="url(#bg-${slug})"/>
  <rect x="12" y="12" width="276" height="426" rx="10" fill="none" stroke="${col.accent}" stroke-width="1.5" stroke-opacity="0.3"/>
  <text x="150" y="180" fill="${col.accent}" font-family="sans-serif" font-size="42" font-weight="bold" text-anchor="middle" opacity="0.12">${orig}</text>
  <rect x="24" y="28" width="86" height="22" rx="11" fill="${col.badge}"/>
  <text x="67" y="43" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="700" letter-spacing="1" text-anchor="middle">${item.category}</text>
  <text x="24" y="370" fill="${col.accent}" font-family="system-ui, sans-serif" font-size="11" font-weight="600" letter-spacing="2">${item.originCountry} • ${item.releaseYear}</text>
  <text x="24" y="398" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="bold">${title}</text>
  <text x="24" y="418" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">${item.genres.slice(0, 2).join(' • ')}</text>
</svg>`;

  fs.writeFileSync(path.join(outDir, `${slug}.svg`), svg, 'utf8');
}

console.log('Total SVGs gerados:', fs.readdirSync(outDir).length);

