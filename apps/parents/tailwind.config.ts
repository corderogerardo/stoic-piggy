import preset from '@stoicpiggy/tailwind-config';
import type { Config } from 'tailwindcss';

export default {
  presets: [preset],
  content: ['./app/**/*.{ts,tsx,mdx}', './components/**/*.{ts,tsx}'],
} satisfies Config;
