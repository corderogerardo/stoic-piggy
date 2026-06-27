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
  budget: {
    es: {
      cards: [
        {
          title: '¿A dónde fue mi dinero?',
          body: 'Sin un plan, el dinero desaparece sin que lo notes. Un presupuesto es como un mapa: te dice a dónde va cada peso antes de que se vaya.',
        },
        {
          title: 'La regla 50/30/20',
          body: '50% para lo necesario (comida, escuela), 30% para lo que quieres, 20% para ahorro. Es una guía, no una camisa de fuerza.',
        },
        {
          title: 'Revisa cada semana',
          body: 'Toma 5 minutos los domingos para ver si gastas menos de lo planeado. Lo que sobra va directo a tu alcancía.',
        },
      ],
      quiz: [
        {
          q: '¿Para qué sirve un presupuesto?',
          options: ['Para saber a dónde va tu dinero', 'Para gastar más', 'Para pedir prestado'],
          answer: 0,
          explain: 'Un presupuesto es un plan — te da control sobre tu dinero.',
        },
        {
          q: 'En la regla 50/30/20, ¿cuánto va al ahorro?',
          options: ['50%', '30%', '20%'],
          answer: 2,
          explain: 'El 20% va al ahorro, que es lo que te hace avanzar.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'Where did my money go?',
          body: 'Without a plan, money disappears without you noticing. A budget is like a map: it tells you where each dollar goes before it leaves.',
        },
        {
          title: 'The 50/30/20 rule',
          body: "50% for needs (food, school), 30% for wants, 20% for savings. It's a guide, not a straitjacket.",
        },
        {
          title: 'Check in weekly',
          body: "Take 5 minutes on Sundays to see if you spent less than planned. What's left goes straight to your piggy bank.",
        },
      ],
      quiz: [
        {
          q: 'What is a budget for?',
          options: ['To know where your money goes', 'To spend more', 'To borrow money'],
          answer: 0,
          explain: 'A budget is a plan — it gives you control over your money.',
        },
        {
          q: 'In the 50/30/20 rule, how much goes to savings?',
          options: ['50%', '30%', '20%'],
          answer: 2,
          explain: "20% goes to savings — that's what moves you forward.",
        },
      ],
    },
  },
  patience: {
    es: {
      cards: [
        {
          title: 'El malvavisco',
          body: 'Un estudio famoso: niños que esperaron 15 minutos para tener 2 malvaviscos en vez de 1 desarrollaron mejor autocontrol. Esperar es una habilidad que se aprende.',
        },
        {
          title: 'El dinero que se multiplica',
          body: 'Si ahorras $100 y gana 5% al año: año 1 tienes $105. Año 10 tienes $163. No hiciste nada — el tiempo trabajó por ti.',
        },
        {
          title: 'La trampa del "ya"',
          body: 'Las tiendas quieren que compres YA. Precios especiales, ofertas relámpago… todos trucos para que no esperes. Tú eliges cuándo.',
        },
      ],
      quiz: [
        {
          q: '¿Qué es el interés compuesto?',
          options: [
            'Dinero que gana más dinero con el tiempo',
            'Un tipo de deuda',
            'Un descuento especial',
          ],
          answer: 0,
          explain: 'El interés compuesto hace que tu ahorro crezca solo — más tiempo, más dinero.',
        },
        {
          q: '¿Por qué las tiendas usan "ofertas relámpago"?',
          options: [
            'Para que no esperes y compres de inmediato',
            'Para ahorrarte dinero',
            'Para que ahorres más',
          ],
          answer: 0,
          explain: 'La urgencia es un truco para que no pienses. La pausa te da el poder.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'The marshmallow test',
          body: 'A famous study: kids who waited 15 minutes for 2 marshmallows instead of 1 developed better self-control. Waiting is a skill you can learn.',
        },
        {
          title: 'Money that multiplies',
          body: 'If you save $100 and it earns 5% a year: year 1 you have $105. Year 10 you have $163. You did nothing — time worked for you.',
        },
        {
          title: 'The "now" trap',
          body: "Stores want you to buy NOW. Flash sales, limited offers… all tricks so you don't wait. You choose when.",
        },
      ],
      quiz: [
        {
          q: 'What is compound interest?',
          options: [
            'Money that earns more money over time',
            'A type of debt',
            'A special discount',
          ],
          answer: 0,
          explain:
            'Compound interest makes your savings grow on their own — more time, more money.',
        },
        {
          q: 'Why do stores use "flash sales"?',
          options: [
            "So you don't wait and buy immediately",
            'To save you money',
            'So you save more',
          ],
          answer: 0,
          explain: "Urgency is a trick so you don't think. The pause gives you the power.",
        },
      ],
    },
  },
  track: {
    es: {
      cards: [
        {
          title: 'Lo que mides, mejora',
          body: 'Cuando sabes exactamente cuánto gastas, puedes encontrar las "fugas": esos gastos pequeños y frecuentes que suman mucho al mes.',
        },
        {
          title: 'El cuaderno de 5 pesos',
          body: 'Anotar cada gasto del día — aunque sea en una libreta barata — puede ahorrarte cientos al mes. No necesitas una app cara.',
        },
        {
          title: 'Celebra lo que funciona',
          body: 'Si esta semana gastaste menos que la semana pasada, eso es un logro. El seguimiento te avisa cuándo vas bien y cuándo necesitas ajustar.',
        },
      ],
      quiz: [
        {
          q: '"Lo que mides, mejora" significa…',
          options: [
            'Si rastreo mis gastos, puedo mejorarlos',
            'El dinero crece solo',
            'Siempre gastaré igual',
          ],
          answer: 0,
          explain: 'Ver tus números te da información. Con información puedes cambiar.',
        },
        {
          q: '¿Cuál es la "fuga" más común en el dinero?',
          options: [
            'Gastos pequeños y frecuentes que no notas',
            'Un gasto grande y único',
            'No tener trabajo',
          ],
          answer: 0,
          explain: 'Los gastos pequeños y repetidos son invisibles — pero suman mucho.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'What you measure improves',
          body: 'When you know exactly how much you spend, you can find the "leaks": small, frequent expenses that add up a lot each month.',
        },
        {
          title: 'The $1 notebook',
          body: "Writing down every daily expense — even in a cheap notebook — can save you hundreds a month. You don't need an expensive app.",
        },
        {
          title: 'Celebrate what works',
          body: "If you spent less this week than last week, that's an achievement. Tracking tells you when you're on track and when to adjust.",
        },
      ],
      quiz: [
        {
          q: '"What you measure improves" means…',
          options: [
            'If I track my spending, I can improve it',
            'Money grows on its own',
            "I'll always spend the same",
          ],
          answer: 0,
          explain: 'Seeing your numbers gives you information. With information you can change.',
        },
        {
          q: 'What\'s the most common money "leak"?',
          options: [
            "Small, frequent expenses you don't notice",
            'One large expense',
            'Not having a job',
          ],
          answer: 0,
          explain: 'Small, repeated expenses are invisible — but they add up fast.',
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
