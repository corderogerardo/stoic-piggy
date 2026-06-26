import type { Lang } from './content';

/** One teaching screen the kid swipes through. */
export interface LessonCard {
  title: string;
  body: string;
}

/** One multiple-choice check. `answer` indexes into `options`. */
export interface QuizQ {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Lesson {
  cards: LessonCard[];
  quiz: QuizQ[];
}

/**
 * In-app lesson content, keyed by a quest's `lessonKey`. Content is universal
 * (everyone learns "saving" the same way), so it lives in the bundle, not the
 * DB. The Quest row is just the per-kid reward + completion ledger.
 */
const LESSONS: Record<string, Record<Lang, Lesson>> = {
  save: {
    es: {
      cards: [
        {
          title: 'Un poco, siempre',
          body: 'Guardar $5 cada semana no parece mucho. Pero en un año son $260. Lo pequeño y constante le gana a lo grande de vez en cuando.',
        },
        {
          title: 'El cerdito que crece',
          body: 'El dinero guardado puede ganar más dinero solo (interés). Mientras más temprano empiezas, más trabaja por ti.',
        },
        {
          title: 'Págate a ti primero',
          body: 'Cuando recibes dinero, aparta tu ahorro antes de gastar. Lo que queda es para gastar, no al revés.',
        },
      ],
      quiz: [
        {
          q: '¿Qué hace crecer más tu dinero?',
          options: [
            'Guardar mucho una vez al año',
            'Guardar un poco cada semana',
            'No guardar y esperar',
          ],
          answer: 1,
          explain: 'Lo constante le gana a lo ocasional.',
        },
        {
          q: '"Págate a ti primero" significa…',
          options: [
            'Gastar y ahorrar lo que sobre',
            'Apartar el ahorro antes de gastar',
            'Pedir dinero prestado',
          ],
          answer: 1,
          explain: 'El ahorro va primero, el gasto después.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'A little, always',
          body: "Saving $5 a week doesn't feel like much. But in a year it's $260. Small and steady beats big and rare.",
        },
        {
          title: 'The piggy that grows',
          body: 'Saved money can earn more money on its own (interest). The earlier you start, the more it works for you.',
        },
        {
          title: 'Pay yourself first',
          body: "When you get money, set aside your savings before spending. What's left is for spending, not the other way around.",
        },
      ],
      quiz: [
        {
          q: 'What makes your money grow the most?',
          options: [
            'Saving a lot once a year',
            'Saving a little every week',
            'Not saving and waiting',
          ],
          answer: 1,
          explain: 'Steady beats occasional.',
        },
        {
          q: '"Pay yourself first" means…',
          options: [
            'Spend, then save the rest',
            'Set savings aside before spending',
            'Borrow money',
          ],
          answer: 1,
          explain: 'Savings first, spending after.',
        },
      ],
    },
  },
  goal: {
    es: {
      cards: [
        {
          title: 'Una meta es un porqué',
          body: 'Ahorrar sin meta es aburrido. Ahorrar para algo (una bici, un juego) le da sentido a cada moneda.',
        },
        {
          title: 'Ponle número y fecha',
          body: '"Quiero una bici de $200 en 4 meses" es mejor que "quiero ahorrar". Ahora sabes cuánto guardar cada semana.',
        },
        {
          title: 'Divide y vencerás',
          body: '$200 en 4 meses son unos $12.50 por semana. Una meta grande se vuelve fácil cuando la partes en pedazos.',
        },
      ],
      quiz: [
        {
          q: '¿Cuál es una buena meta?',
          options: [
            'Quiero ahorrar dinero',
            'Quiero una bici de $200 en 4 meses',
            'Quiero ser rico',
          ],
          answer: 1,
          explain: 'Una buena meta tiene cantidad y fecha.',
        },
        {
          q: 'Para una meta de $200 en 4 meses, ¿cuánto por semana (aprox)?',
          options: ['$5', '$12.50', '$50'],
          answer: 1,
          explain: '$200 ÷ ~16 semanas ≈ $12.50.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'A goal is a "why"',
          body: 'Saving with no goal is boring. Saving for something (a bike, a game) gives every coin a reason.',
        },
        {
          title: 'Give it a number and a date',
          body: '"I want a $200 bike in 4 months" beats "I want to save". Now you know how much per week.',
        },
        {
          title: 'Split it to win it',
          body: '$200 in 4 months is about $12.50 a week. A big goal gets easy when you break it into pieces.',
        },
      ],
      quiz: [
        {
          q: 'Which is a good goal?',
          options: ['I want to save money', 'I want a $200 bike in 4 months', 'I want to be rich'],
          answer: 1,
          explain: 'A good goal has an amount and a date.',
        },
        {
          q: 'For a $200 goal in 4 months, how much per week (approx)?',
          options: ['$5', '$12.50', '$50'],
          answer: 1,
          explain: '$200 ÷ ~16 weeks ≈ $12.50.',
        },
      ],
    },
  },
  resist: {
    es: {
      cards: [
        {
          title: 'La pausa estoica',
          body: 'Las ganas de comprar pasan. Espera un día antes de gastar en algo que no planeaste. Muchas veces ya no lo querrás.',
        },
        {
          title: '¿Quiero o necesito?',
          body: 'Necesito: comida, lo de la escuela. Quiero: el dulce, el juego nuevo. Los dos están bien — pero saber cuál es cuál te da poder.',
        },
        {
          title: 'El costo escondido',
          body: 'Cada peso que gastas en un capricho es un peso que no va a tu meta. No es "gratis": le quita tiempo a lo que de verdad quieres.',
        },
      ],
      quiz: [
        {
          q: 'Sientes ganas de comprar algo no planeado. ¿Qué haces?',
          options: ['Lo compro ya', 'Espero un día y lo pienso', 'Pido prestado para comprarlo'],
          answer: 1,
          explain: 'La pausa hace que las ganas pasen.',
        },
        {
          q: '¿Cuál es un "necesito"?',
          options: ['Un dulce', 'Útiles para la escuela', 'Un juego nuevo'],
          answer: 1,
          explain: 'Lo necesario primero; los gustos después.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'The stoic pause',
          body: "The urge to buy passes. Wait a day before spending on something you didn't plan. Often you won't even want it anymore.",
        },
        {
          title: 'Want or need?',
          body: 'Need: food, school stuff. Want: the candy, the new game. Both are fine — but knowing which is which gives you power.',
        },
        {
          title: 'The hidden cost',
          body: 'Every dollar on an impulse is a dollar that didn\'t reach your goal. It\'s not "free": it steals from what you actually want.',
        },
      ],
      quiz: [
        {
          q: 'You feel an urge to buy something unplanned. What do you do?',
          options: ['Buy it now', 'Wait a day and think', 'Borrow money to buy it'],
          answer: 1,
          explain: 'The pause lets the urge pass.',
        },
        {
          q: 'Which one is a "need"?',
          options: ['Candy', 'School supplies', 'A new game'],
          answer: 1,
          explain: 'Needs first; wants after.',
        },
      ],
    },
  },
};

/** The lesson for a quest's lessonKey in the given language, or null if none. */
export function getLesson(key: string | undefined, lang: Lang): Lesson | null {
  if (!key) return null;
  return LESSONS[key]?.[lang] ?? null;
}
