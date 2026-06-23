import type { Config } from 'tailwindcss';
import preset from '@stoicpiggy/tailwind-config';

export default {
  presets: [preset],
  content: ['./app/**/*.{ts,tsx,mdx}', './components/**/*.{ts,tsx}'],
} satisfies Config;
