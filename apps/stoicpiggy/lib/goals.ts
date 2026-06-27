import type { GoalCategory, GoalTerm } from '@stoicpiggy/shared';

/**
 * Preloaded goal suggestions + display meta. Like lib/lessons.ts, this content
 * is universal and bilingual, so it lives in the bundle — the DB only stores the
 * goal a kid actually creates (title + target + term + category). Picking a
 * suggestion just seeds those four fields.
 */

/** Approx months each term represents — used for the "reach it in ~N months" hint. */
export const TERM_MONTHS: Record<GoalTerm, number> = { short: 1, medium: 3, long: 6 };

/** Per-category icon, shared by suggestions and custom goals (Font Awesome 4.7). */
export const CATEGORY_ICON: Record<GoalCategory, string> = {
  thing: 'shopping-bag',
  invest: 'line-chart',
  learn: 'graduation-cap',
};

/** A preloaded goal a kid can pick from the "Suggested" tab. */
export interface GoalSuggestion {
  key: string;
  icon: string;
  category: GoalCategory;
  term: GoalTerm;
  targetCents: number;
  /** Youngest age this suits; used only to order suggestions by relevance. */
  ageMin: number;
  es: { title: string; why: string };
  en: { title: string; why: string };
}

const SUGGESTIONS: GoalSuggestion[] = [
  // ---- Things to save for (short → long) ----
  {
    key: 'toy',
    icon: 'gift',
    category: 'thing',
    term: 'short',
    targetCents: 3000,
    ageMin: 5,
    es: {
      title: 'Un juguete que quiero',
      why: 'Una meta corta: guarda un poco cada semana y en un mes es tuyo.',
    },
    en: {
      title: 'A toy I want',
      why: 'A short goal: save a little each week and in about a month it’s yours.',
    },
  },
  {
    key: 'videogame',
    icon: 'gamepad',
    category: 'thing',
    term: 'short',
    targetCents: 6000,
    ageMin: 7,
    es: {
      title: 'Un videojuego nuevo',
      why: 'Un juego es una meta de ~1 mes. Aparta poquito y llegas sin prisa.',
    },
    en: {
      title: 'A new video game',
      why: 'A game is a ~1-month goal. Set a bit aside and you’ll get there.',
    },
  },
  {
    key: 'headphones',
    icon: 'headphones',
    category: 'thing',
    term: 'medium',
    targetCents: 8000,
    ageMin: 10,
    es: {
      title: 'Audífonos',
      why: 'Algo más caro pide más paciencia: unos 3 meses de ahorro constante.',
    },
    en: {
      title: 'Headphones',
      why: 'Pricier things need patience: about 3 months of steady saving.',
    },
  },
  {
    key: 'bicycle',
    icon: 'bicycle',
    category: 'thing',
    term: 'medium',
    targetCents: 15000,
    ageMin: 7,
    es: {
      title: 'Una bicicleta',
      why: 'Una bici se ahorra en ~3 meses. Lo grande llega paso a paso.',
    },
    en: {
      title: 'A bicycle',
      why: 'A bike takes ~3 months to save for. Big things come step by step.',
    },
  },
  {
    key: 'console',
    icon: 'gamepad',
    category: 'thing',
    term: 'long',
    targetCents: 50000,
    ageMin: 10,
    es: {
      title: 'Una consola (PS5)',
      why: 'Meta grande: ~6 meses. La paciencia es un superpoder con el dinero.',
    },
    en: {
      title: 'A game console (PS5)',
      why: 'A big goal: ~6 months. Patience is a money superpower.',
    },
  },
  {
    key: 'phone',
    icon: 'mobile',
    category: 'thing',
    term: 'long',
    targetCents: 40000,
    ageMin: 12,
    es: {
      title: 'Mi primer teléfono',
      why: 'Ahorrar para algo grande te enseña a esperar lo que de verdad quieres.',
    },
    en: {
      title: 'My first phone',
      why: 'Saving for something big teaches you to wait for what you really want.',
    },
  },
  // ---- Invest & grow (learn how money makes money) ----
  {
    key: 'first-share',
    icon: 'rocket',
    category: 'invest',
    term: 'long',
    targetCents: 20000,
    ageMin: 11,
    es: {
      title: 'Una acción de una empresa',
      why: 'Una acción es un trocito de una empresa real (como una de cohetes). Si crece, tu dinero crece.',
    },
    en: {
      title: 'One share of a company',
      why: 'A share is a tiny piece of a real company (like a rocket maker). If it grows, your money grows.',
    },
  },
  {
    key: 'index-fund',
    icon: 'line-chart',
    category: 'invest',
    term: 'long',
    targetCents: 30000,
    ageMin: 13,
    es: {
      title: 'Empezar un fondo índice',
      why: 'Reparte tu dinero entre muchas empresas a la vez: más lento, más seguro.',
    },
    en: {
      title: 'Start an index fund',
      why: 'Spreads your money across many companies at once: slower and safer.',
    },
  },
  {
    key: 'compound-100',
    icon: 'money',
    category: 'invest',
    term: 'long',
    targetCents: 10000,
    ageMin: 12,
    es: {
      title: 'Mis primeros $100 invertidos',
      why: 'El dinero invertido gana más dinero solo: eso es interés compuesto. Empezar temprano gana.',
    },
    en: {
      title: 'My first $100 invested',
      why: 'Invested money earns more on its own — that’s compound growth. Starting early wins.',
    },
  },
  // ---- Learn & grow (invest in yourself) ----
  {
    key: 'book',
    icon: 'book',
    category: 'learn',
    term: 'short',
    targetCents: 2500,
    ageMin: 6,
    es: {
      title: 'Un libro que me encante',
      why: 'Los libros son aventuras y grandes ideas. Una primera meta perfecta.',
    },
    en: {
      title: 'A book I’ll love',
      why: 'Books are adventures and big ideas. A perfect first goal.',
    },
  },
  {
    key: 'art-kit',
    icon: 'paint-brush',
    category: 'learn',
    term: 'medium',
    targetCents: 12000,
    ageMin: 7,
    es: {
      title: 'Kit de arte o música',
      why: 'Las herramientas hacen crecer tu talento, y el talento nadie te lo quita.',
    },
    en: {
      title: 'Art or music kit',
      why: 'Tools grow your talent — and talent is wealth no one can take.',
    },
  },
  {
    key: 'robotics-kit',
    icon: 'flask',
    category: 'learn',
    term: 'medium',
    targetCents: 7000,
    ageMin: 9,
    es: {
      title: 'Kit de ciencia o robótica',
      why: 'Construir cosas reales te enseña cómo funciona el mundo. La curiosidad rinde.',
    },
    en: {
      title: 'A science or robotics kit',
      why: 'Building real things teaches how the world works. Curiosity pays off.',
    },
  },
  {
    key: 'online-course',
    icon: 'graduation-cap',
    category: 'learn',
    term: 'medium',
    targetCents: 5000,
    ageMin: 10,
    es: {
      title: 'Un curso en línea',
      why: 'Gastar en habilidades rinde para siempre: un curso de código, dibujo o lo que te apasione.',
    },
    en: {
      title: 'An online course',
      why: 'Spending on skills pays back forever — code, drawing, whatever you love.',
    },
  },
  {
    key: 'camp',
    icon: 'university',
    category: 'learn',
    term: 'long',
    targetCents: 20000,
    ageMin: 11,
    es: {
      title: 'Un campamento o taller',
      why: 'Habilidades nuevas y amigos nuevos. Las experiencias valen más que las cosas.',
    },
    en: {
      title: 'A camp or workshop',
      why: 'New skills and new friends. Experiences are worth more than stuff.',
    },
  },
  {
    key: 'college-fund',
    icon: 'graduation-cap',
    category: 'learn',
    term: 'long',
    targetCents: 100000,
    ageMin: 14,
    es: {
      title: 'Empezar un fondo para la universidad',
      why: 'La universidad es el juego largo. Ahorrar poco y temprano crea un hábito poderoso.',
    },
    en: {
      title: 'Start a college fund',
      why: 'College is the long game. Saving a little, early, builds a powerful habit.',
    },
  },
];

/**
 * Suggestions ordered for a kid of `age`: age-appropriate ones (ageMin ≤ age)
 * first — closest to their age leading — then the rest by how soon they unlock.
 * With no age, returns the catalog order unchanged.
 */
export function suggestionsForAge(age?: number): GoalSuggestion[] {
  if (age == null) return SUGGESTIONS;
  const fits = SUGGESTIONS.filter((s) => age >= s.ageMin).sort((a, b) => b.ageMin - a.ageMin);
  const rest = SUGGESTIONS.filter((s) => age < s.ageMin).sort((a, b) => a.ageMin - b.ageMin);
  return [...fits, ...rest];
}
