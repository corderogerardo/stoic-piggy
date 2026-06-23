const preset = require('@stoicpiggy/tailwind-config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  // nativewind/preset is required; our shared preset adds the design tokens.
  presets: [require('nativewind/preset'), preset],
  theme: { extend: {} },
  plugins: [],
};
