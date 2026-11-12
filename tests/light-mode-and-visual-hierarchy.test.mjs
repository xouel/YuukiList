import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Helper de Luminância Relativa e Relação de Contraste WCAG 2.2
function parseHex(hex) {
  const clean = hex.replace('#', '').trim();
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const [r1, g1, b1] = parseHex(hex1);
  const [r2, g2, b2] = parseHex(hex2);
  const l1 = getRelativeLuminance(r1, g1, b1);
  const l2 = getRelativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

test('Theme Selection: Tokens semânticos e paleta Washi em globals.css', () => {
  const cssPath = path.resolve('apps/web/src/app/globals.css');
  assert.ok(fs.existsSync(cssPath), 'globals.css deve existir');
  const content = fs.readFileSync(cssPath, 'utf8');

  // Extrai o bloco [data-theme="light"]
  const lightBlockMatch = content.match(/\[data-theme=["']light["']\]\s*\{([\s\S]*?)\}/);
  assert.ok(lightBlockMatch, 'Bloco [data-theme="light"] deve estar declarado em globals.css');
  const lightBlock = lightBlockMatch[1];

  // Verifica tokens essenciais Washi Editorial
  assert.match(lightBlock, /--surface-canvas:\s*#F9F8F5/i, 'surface-canvas deve ser #F9F8F5');
  assert.match(lightBlock, /--surface-raised:\s*#FFFFFF/i, 'surface-raised deve ser #FFFFFF');
  assert.match(lightBlock, /--surface-overlay:\s*#F1EFEA/i, 'surface-overlay deve ser #F1EFEA');
  assert.match(lightBlock, /--surface-sunken:\s*#E7E3DA/i, 'surface-sunken deve ser #E7E3DA');
  assert.match(lightBlock, /--color-text-primary:\s*#16141A/i, 'color-text-primary deve ser #16141A');
  assert.match(lightBlock, /--color-text-secondary:\s*#5A5462/i, 'color-text-secondary deve ser #5A5462');
  assert.match(lightBlock, /--color-accent:\s*#C8453B/i, 'color-accent deve ser #C8453B');
  assert.match(lightBlock, /--ring-focus:\s*#C8453B/i, 'ring-focus deve ser #C8453B');
});

test('Accessibility Contrast: Contraste WCAG 2.2 AAA para tipografia do modo claro', () => {
  const textPrimary = '#16141A';
  const textSecondary = '#5A5462';
  const surfaceCanvas = '#F9F8F5';
  const surfaceRaised = '#FFFFFF';

  const ratioPrimaryOnRaised = getContrastRatio(textPrimary, surfaceRaised);
  assert.ok(
    ratioPrimaryOnRaised >= 14.0,
    `Texto primário sobre Surface Raised deve atingir contraste AAA >= 14:1 (atual: ${ratioPrimaryOnRaised.toFixed(2)}:1)`
  );

  const ratioPrimaryOnCanvas = getContrastRatio(textPrimary, surfaceCanvas);
  assert.ok(
    ratioPrimaryOnCanvas >= 14.0,
    `Texto primário sobre Surface Canvas deve atingir contraste AAA >= 14:1 (atual: ${ratioPrimaryOnCanvas.toFixed(2)}:1)`
  );

  const ratioSecondaryOnRaised = getContrastRatio(textSecondary, surfaceRaised);
  assert.ok(
    ratioSecondaryOnRaised >= 4.5,
    `Texto secundário sobre Surface Raised deve atingir contraste AA >= 4.5:1 (atual: ${ratioSecondaryOnRaised.toFixed(2)}:1)`
  );
});

test('Static Audit: Erradicação de hexadecimais escuros estáticos em componentes centrais', () => {
  const filesToCheck = [
    {
      file: 'apps/web/src/app/library/page.tsx',
      banned: ['bg-[#0B0D13]', 'text-[#F3F4F6]'],
    },
    {
      file: 'apps/web/src/components/home/continue-watching.tsx',
      banned: ['bg-[#1A1820]', 'text-[#F4EFEA]'],
    },
    {
      file: 'apps/web/src/components/home/trending-showcase.tsx',
      banned: ['bg-[#1A1820]', 'text-[#F4EFEA]'],
    },
    {
      file: 'apps/web/src/app/profile/page.tsx',
      banned: ['bg-[#1A1820]', 'text-[#F4EFEA]'],
    },
    {
      file: 'apps/web/src/components/profile/edit-profile-modal.tsx',
      banned: ['bg-[#1A1820]', 'text-[#F4EFEA]'],
    },
    {
      file: 'apps/web/src/components/layout/theme-toggle.tsx',
      banned: ['bg-[#181C2B]'],
    },
  ];

  for (const item of filesToCheck) {
    const fullPath = path.resolve(item.file);
    assert.ok(fs.existsSync(fullPath), `Arquivo ${item.file} deve existir`);
    const content = fs.readFileSync(fullPath, 'utf8');

    for (const bannedPattern of item.banned) {
      assert.ok(
        !content.includes(bannedPattern),
        `Arquivo ${item.file} NÃO deve conter padrão escuro estático hardcoded '${bannedPattern}'`
      );
    }
  }
});

test('Anti-Collision: Badges sobre capas de mídia preservam classes anti-colisão explícitas', () => {
  const cardPath = path.resolve('apps/web/src/components/library/library-card.tsx');
  const cardContent = fs.readFileSync(cardPath, 'utf8');
  assert.ok(
    cardContent.includes('bg-black/') || cardContent.includes('text-white'),
    'LibraryCard deve possuir classes de contraste explícito para elementos sobrepostos à capa'
  );

  const showcasePath = path.resolve('apps/web/src/components/home/trending-showcase.tsx');
  const showcaseContent = fs.readFileSync(showcasePath, 'utf8');
  assert.ok(
    showcaseContent.includes('bg-black/'),
    'TrendingShowcase deve possuir badge de categoria com fundo escuro explícito sobre a imagem'
  );
});

