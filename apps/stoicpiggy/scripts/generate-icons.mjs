// Generates the app icon, Android adaptive foreground, and splash assets from
// the Stoic Piggy mascot (mirrors components/Piggy.tsx). Run with:
//   node scripts/generate-icons.mjs
// Requires `sharp` (already in the workspace).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assets = path.resolve(__dirname, '../assets');

// Brand palette (from lib/theme.ts)
const NAVY = '#1D3557';

// Mascot paths, copied verbatim from components/Piggy.tsx (viewBox 0 0 120 124),
// "happy" mood for a friendly icon. No dashed zen ring so the mark reads cleanly.
const piggy = `
  <!-- ears -->
  <path d="M34 44 L24 18 Q23 13 29 16 L52 33 Z" fill="#EFA59E"/>
  <path d="M86 44 L96 18 Q97 13 91 16 L68 33 Z" fill="#EFA59E"/>
  <path d="M36 40 L30 24 L48 35 Z" fill="#E63946" opacity="0.3"/>
  <path d="M84 40 L90 24 L72 35 Z" fill="#E63946" opacity="0.3"/>
  <!-- head + blush -->
  <circle cx="60" cy="66" r="41" fill="#F4ACA4"/>
  <circle cx="32" cy="74" r="7.5" fill="#E63946" opacity="0.16"/>
  <circle cx="88" cy="74" r="7.5" fill="#E63946" opacity="0.16"/>
  <!-- snout -->
  <ellipse cx="60" cy="78" rx="21" ry="14.5" fill="#ED968E"/>
  <ellipse cx="52" cy="78" rx="3.4" ry="5.4" fill="#1D3557" opacity="0.62"/>
  <ellipse cx="68" cy="78" rx="3.4" ry="5.4" fill="#1D3557" opacity="0.62"/>
  <!-- happy eyes -->
  <g stroke="#1D3557" stroke-width="3.4" stroke-linecap="round" fill="none">
    <path d="M39 60 Q46.5 52 54 60"/>
    <path d="M66 60 Q73.5 52 81 60"/>
  </g>
`;

const S = 1024;
// Mascot content (sans ear tips) is centred at (60, 61.5) in the 120x124 box.
// scale 7.0 -> ~62% of the canvas height; translate to centre it on 1024x1024.
const iconTransform = `translate(${512 - 60 * 7}, ${512 - 61.5 * 7}) scale(7)`;
// Android safe zone is the centre ~66%; keep the foreground smaller (scale 6.3).
const adaptiveTransform = `translate(${512 - 60 * 6.3}, ${512 - 61.5 * 6.3}) scale(6.3)`;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" fill="${NAVY}"/>
  <g transform="${iconTransform}">${piggy}</g>
</svg>`;

// Transparent background -> Android renders it over adaptiveIcon.backgroundColor.
const adaptiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <g transform="${adaptiveTransform}">${piggy}</g>
</svg>`;

// Splash: transparent piggy; expo-splash-screen paints the backgroundColor.
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <g transform="${adaptiveTransform}">${piggy}</g>
</svg>`;

async function png(svg, file) {
  const out = path.join(assets, file);
  await sharp(Buffer.from(svg)).png().toFile(out);
  console.log('wrote', path.relative(process.cwd(), out));
}

await png(iconSvg, 'icon.png');
await png(adaptiveSvg, 'adaptive-icon.png');
await png(splashSvg, 'splash-icon.png');
console.log('done');
