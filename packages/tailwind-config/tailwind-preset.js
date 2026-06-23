// Shared Tailwind preset — the single design language for landing, dashboard,
// and the mobile app. Web apps add this via `presets: [require('@stoicpiggy/tailwind-config')]`;
// the mobile app adds it alongside `nativewind/preset`.

const { colors, radii, fontFamily } = require('./tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // `content` is intentionally empty here — each app declares its own.
  content: [],
  theme: {
    extend: {
      colors,
      borderRadius: radii,
      fontFamily,
    },
  },
};
