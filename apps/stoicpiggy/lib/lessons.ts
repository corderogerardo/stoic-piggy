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
  needs_wants: {
    es: {
      cards: [
        {
          title: 'Necesito vs. quiero',
          body: 'Necesito: agua, comida, ropa, donde dormir. Quiero: el juego nuevo, los zapatos de moda. Los dos son válidos — pero confundirlos es el error más costoso.',
        },
        {
          title: 'El test de 24 horas',
          body: 'Antes de comprar algo que "quieres", espera 24 horas. Si al día siguiente aún lo quieres y tienes el dinero, puede ser una buena decisión.',
        },
        {
          title: 'Los "necesito" disfrazados',
          body: 'Cuidado con los "necesito" que en realidad son "quiero mucho". "Necesito el nuevo celular" — ¿de verdad? La honestidad contigo mismo vale oro.',
        },
      ],
      quiz: [
        {
          q: '¿Cuál es un "necesito"?',
          options: ['Comida para el día', 'El último videojuego', 'Ropa de moda'],
          answer: 0,
          explain: 'La comida es una necesidad básica. El videojuego y la ropa de moda son deseos.',
        },
        {
          q: '¿Qué hace el "test de 24 horas"?',
          options: [
            'Esperar un día para ver si aún quieres algo',
            'Ahorrar por 24 horas',
            'Comparar precios',
          ],
          answer: 0,
          explain: 'Esperar reduce las compras impulsivas — muchas ganas pasan solas.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'Need vs. want',
          body: 'Need: water, food, clothing, shelter. Want: the new game, the trendy shoes. Both are valid — but confusing them is the most expensive mistake.',
        },
        {
          title: 'The 24-hour test',
          body: 'Before buying something you "want," wait 24 hours. If you still want it the next day and have the money, it might be a good decision.',
        },
        {
          title: '"Needs" in disguise',
          body: 'Watch out for "needs" that are really "really wants." "I need the new phone" — really? Honesty with yourself is worth gold.',
        },
      ],
      quiz: [
        {
          q: 'Which one is a "need"?',
          options: ['Food for the day', 'The latest video game', 'Trendy clothes'],
          answer: 0,
          explain: 'Food is a basic need. The video game and trendy clothes are wants.',
        },
        {
          q: 'What does the "24-hour test" do?',
          options: [
            'Wait a day to see if you still want something',
            'Save for 24 hours',
            'Compare prices',
          ],
          answer: 0,
          explain: 'Waiting reduces impulse buys — many urges pass on their own.',
        },
      ],
    },
  },
  emergency: {
    es: {
      cards: [
        {
          title: 'El dinero del "por si acaso"',
          body: 'Los expertos recomiendan tener de 3 a 6 meses de gastos guardados aparte, solo para emergencias: un gasto médico, perder el trabajo, reparar algo urgente.',
        },
        {
          title: 'No lo toques',
          body: 'El fondo de emergencia no es para vacaciones, ni para el celular nuevo, ni para "aprovechar" una oferta. Es para emergencias reales. Tiene que aburrirte usarlo.',
        },
        {
          title: 'Empieza pequeño',
          body: 'No necesitas los 6 meses desde el primer día. Empieza con una meta pequeña: $500. Eso ya cubre muchas emergencias menores.',
        },
      ],
      quiz: [
        {
          q: '¿Para qué es el fondo de emergencia?',
          options: ['Gastos inesperados urgentes', 'Vacaciones', 'Compras en oferta'],
          answer: 0,
          explain: 'Solo para emergencias reales. Usarlo para otra cosa arruina su propósito.',
        },
        {
          q: '¿Cuánto recomiendan tener los expertos?',
          options: ['3 a 6 meses de gastos', '1 semana de gastos', 'Lo que quieras'],
          answer: 0,
          explain: '3-6 meses cubre la mayoría de las emergencias sin entrar en deuda.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'The "just in case" money',
          body: 'Experts recommend keeping 3 to 6 months of expenses saved aside, only for emergencies: a medical expense, losing a job, fixing something urgent.',
        },
        {
          title: "Don't touch it",
          body: "The emergency fund is not for vacations, a new phone, or taking advantage of a sale. It's for real emergencies. It should bore you to use it.",
        },
        {
          title: 'Start small',
          body: "You don't need 6 months from day one. Start with a small goal: $500. That already covers many minor emergencies.",
        },
      ],
      quiz: [
        {
          q: 'What is the emergency fund for?',
          options: ['Urgent unexpected expenses', 'Vacations', 'Sale purchases'],
          answer: 0,
          explain: 'Only for real emergencies. Using it for anything else defeats its purpose.',
        },
        {
          q: 'How much do experts recommend having?',
          options: ['3 to 6 months of expenses', '1 week of expenses', 'Whatever you want'],
          answer: 0,
          explain: '3-6 months covers most emergencies without going into debt.',
        },
      ],
    },
  },
  inflation: {
    es: {
      cards: [
        {
          title: 'El dinero que se encoge',
          body: 'Con $10 hoy puedes comprar un refresco y una botana. Con esos mismos $10 en 10 años, quizás solo alcances para el refresco. Eso es la inflación.',
        },
        {
          title: '¿Por qué sube todo?',
          body: 'Cuando hay más dinero circulando pero los mismos productos, los precios suben. Es como si hubiera más personas competeindo por los mismos boletos.',
        },
        {
          title: 'Cómo protegerte',
          body: 'El dinero bajo el colchón pierde valor. Invertir (aunque sea poco) ayuda a que tu dinero crezca al ritmo de la inflación o más rápido.',
        },
      ],
      quiz: [
        {
          q: '¿Qué es la inflación?',
          options: [
            'El aumento general de precios con el tiempo',
            'Un impuesto extra',
            'Un descuento del gobierno',
          ],
          answer: 0,
          explain: 'La inflación hace que el mismo dinero compre menos cosas con el tiempo.',
        },
        {
          q: '¿Cómo proteger tu dinero de la inflación?',
          options: ['Invertirlo para que crezca', 'Guardarlo bajo el colchón', 'Gastarlo todo ya'],
          answer: 0,
          explain: 'El dinero invertido puede crecer más rápido que la inflación.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'Shrinking money',
          body: 'With $10 today you can buy a soda and a snack. With those same $10 in 10 years, maybe only the soda. That is inflation.',
        },
        {
          title: 'Why does everything go up?',
          body: 'When there is more money circulating but the same products, prices rise. It is like more people competing for the same tickets.',
        },
        {
          title: 'How to protect yourself',
          body: 'Money under the mattress loses value. Investing (even a little) helps your money grow at the pace of inflation or faster.',
        },
      ],
      quiz: [
        {
          q: 'What is inflation?',
          options: [
            'The general rise of prices over time',
            'An extra tax',
            'A government discount',
          ],
          answer: 0,
          explain: 'Inflation makes the same money buy fewer things over time.',
        },
        {
          q: 'How do you protect money from inflation?',
          options: ['Invest it so it grows', 'Keep it under the mattress', 'Spend it all now'],
          answer: 0,
          explain: 'Invested money can grow faster than inflation.',
        },
      ],
    },
  },
  banking: {
    es: {
      cards: [
        {
          title: '¿Qué hace un banco?',
          body: 'Un banco guarda tu dinero de forma segura, te paga un pequeño porcentaje por tenerlo ahí (interés), y lo presta a otras personas cobrándoles más.',
        },
        {
          title: 'Cuenta de ahorro vs. corriente',
          body: 'La cuenta de ahorro te paga interés y es para guardar. La cuenta corriente (o de cheques) es para el gasto diario. Usa las dos con propósito.',
        },
        {
          title: 'Tu dinero está asegurado',
          body: 'En muchos países, el gobierno garantiza tu dinero hasta cierto límite. Si el banco quiebra, no pierdes tus ahorros.',
        },
      ],
      quiz: [
        {
          q: '¿Qué paga el banco por guardar tu dinero?',
          options: ['Interés (un porcentaje)', 'Nada', 'Comida'],
          answer: 0,
          explain: 'El banco paga interés porque usa tu dinero para prestar a otros.',
        },
        {
          q: '¿Cuál cuenta es mejor para ahorrar?',
          options: ['Cuenta de ahorro', 'Cuenta corriente', 'Son iguales'],
          answer: 0,
          explain: 'La cuenta de ahorro paga más interés y está diseñada para guardar dinero.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'What does a bank do?',
          body: 'A bank keeps your money safe, pays you a small percentage for having it there (interest), and lends it to others charging them more.',
        },
        {
          title: 'Savings vs. checking account',
          body: 'A savings account pays interest and is for saving. A checking account is for daily spending. Use both with purpose.',
        },
        {
          title: 'Your money is insured',
          body: 'In many countries, the government guarantees your money up to a certain limit. If the bank fails, you do not lose your savings.',
        },
      ],
      quiz: [
        {
          q: 'What does the bank pay you for keeping your money?',
          options: ['Interest (a percentage)', 'Nothing', 'Food'],
          answer: 0,
          explain: 'The bank pays interest because it uses your money to lend to others.',
        },
        {
          q: 'Which account is better for saving?',
          options: ['Savings account', 'Checking account', 'They are the same'],
          answer: 0,
          explain: 'A savings account pays more interest and is designed for keeping money.',
        },
      ],
    },
  },
  credit: {
    es: {
      cards: [
        {
          title: '¿Qué es el crédito?',
          body: 'El crédito es pedir dinero prestado hoy con la promesa de devolverlo después, con un extra (interés). Es una herramienta — útil o peligrosa según cómo la uses.',
        },
        {
          title: 'El historial crediticio',
          body: 'Cada vez que pagas a tiempo, tu "calificación crediticia" sube. Con buen historial, los bancos te prestan más y con mejores condiciones. Con mal historial, te cierran puertas.',
        },
        {
          title: 'La trampa del mínimo',
          body: 'Una tarjeta de crédito dice "pago mínimo $50". Si solo pagas eso, el resto genera más interés. Una deuda de $1,000 puede convertirse en $2,000 si no tienes cuidado.',
        },
      ],
      quiz: [
        {
          q: '¿Qué es el interés en un préstamo?',
          options: [
            'El extra que pagas por pedir dinero prestado',
            'Un regalo del banco',
            'Un descuento',
          ],
          answer: 0,
          explain: 'El interés es el costo de pedir dinero. Cuanto antes pagues, menos pagas.',
        },
        {
          q: '¿Qué pasa si solo pagas el mínimo de tu tarjeta?',
          options: [
            'El resto genera más interés y la deuda crece',
            'La deuda desaparece',
            'El banco te perdona el resto',
          ],
          answer: 0,
          explain: 'Pagar solo el mínimo es una de las trampas más caras del crédito.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'What is credit?',
          body: 'Credit is borrowing money today with the promise of paying it back later, with a little extra (interest). It is a tool — useful or dangerous depending on how you use it.',
        },
        {
          title: 'Credit history',
          body: 'Every time you pay on time, your "credit score" goes up. With good history, banks lend you more at better rates. With bad history, doors close.',
        },
        {
          title: 'The minimum payment trap',
          body: 'A credit card says "minimum payment $50." If you only pay that, the rest generates more interest. A $1,000 debt can become $2,000 if you are not careful.',
        },
      ],
      quiz: [
        {
          q: 'What is interest on a loan?',
          options: ['The extra you pay for borrowing money', 'A gift from the bank', 'A discount'],
          answer: 0,
          explain: 'Interest is the cost of borrowing money. The faster you pay, the less you pay.',
        },
        {
          q: 'What happens if you only pay the minimum on your card?',
          options: [
            'The rest generates more interest and debt grows',
            'The debt disappears',
            'The bank forgives the rest',
          ],
          answer: 0,
          explain: 'Paying only the minimum is one of the most expensive credit traps.',
        },
      ],
    },
  },
  taxes: {
    es: {
      cards: [
        {
          title: '¿Qué son los impuestos?',
          body: 'Son el dinero que todos aportamos al gobierno para pagar cosas que usamos juntos: carreteras, escuelas, hospitales, policía, bomberos.',
        },
        {
          title: 'Cuánto se paga',
          body: 'Generalmente, cuanto más ganas, más pagas en porcentaje. Esto se llama sistema progresivo. El IVA (o impuesto de ventas) lo pagas cada vez que compras algo.',
        },
        {
          title: 'Es una responsabilidad',
          body: 'No pagar impuestos cuando debes se llama evasión fiscal y es ilegal. Aprender a declararlos correctamente es una habilidad importante para adultos.',
        },
      ],
      quiz: [
        {
          q: '¿Para qué sirven los impuestos?',
          options: [
            'Pagar servicios públicos que todos usamos',
            'Enriquecer a los políticos',
            'Nada útil',
          ],
          answer: 0,
          explain: 'Los impuestos financian escuelas, hospitales, carreteras y más.',
        },
        {
          q: '¿Cuándo pagas IVA o impuesto de ventas?',
          options: [
            'Cada vez que compras algo',
            'Solo cuando ganas dinero',
            'Solo los adultos lo pagan',
          ],
          answer: 0,
          explain: 'El impuesto de ventas se aplica en casi toda compra, incluso para niños.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'What are taxes?',
          body: 'They are money everyone contributes to the government to pay for things we share: roads, schools, hospitals, police, firefighters.',
        },
        {
          title: 'How much you pay',
          body: 'Generally, the more you earn, the higher percentage you pay. This is called a progressive system. Sales tax is paid every time you buy something.',
        },
        {
          title: 'It is a responsibility',
          body: 'Not paying taxes when you should is called tax evasion and is illegal. Learning to file them correctly is an important adult skill.',
        },
      ],
      quiz: [
        {
          q: 'What are taxes for?',
          options: [
            'Paying public services we all use',
            'Making politicians rich',
            'Nothing useful',
          ],
          answer: 0,
          explain: 'Taxes fund schools, hospitals, roads, and more.',
        },
        {
          q: 'When do you pay sales tax?',
          options: [
            'Every time you buy something',
            'Only when you earn money',
            'Only adults pay it',
          ],
          answer: 0,
          explain: 'Sales tax applies to almost every purchase, even for kids.',
        },
      ],
    },
  },
  entrepreneur: {
    es: {
      cards: [
        {
          title: '¿Qué es un emprendedor?',
          body: 'Alguien que crea su propio negocio en vez de trabajar para otros. Tú decides qué hacer, cuándo, y te quedas con las ganancias — pero también asumes los riesgos.',
        },
        {
          title: 'Una idea + un problema',
          body: 'Los mejores negocios resuelven un problema real. ¿Qué necesitan las personas en tu colonia que nadie les da? Ahí está tu negocio.',
        },
        {
          title: 'Empieza pequeño',
          body: 'No necesitas mucho dinero para empezar. Un servicio de lavado de autos, vender artesanías, dar clases — lo importante es empezar y aprender.',
        },
      ],
      quiz: [
        {
          q: '¿Cuál es la base de un buen negocio?',
          options: ['Resolver un problema real', 'Tener mucho dinero', 'Copiar lo que hacen otros'],
          answer: 0,
          explain: 'Los negocios exitosos resuelven un problema que la gente tiene.',
        },
        {
          q: '¿Qué necesitas para empezar a emprender?',
          options: ['Una idea y las ganas de empezar', 'Mucho dinero', 'Terminar la universidad'],
          answer: 0,
          explain:
            'Muchos negocios exitosos empezaron con casi nada. La idea y la acción son lo primero.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'What is an entrepreneur?',
          body: 'Someone who creates their own business instead of working for others. You decide what to do, when, and keep the profits — but you also take the risks.',
        },
        {
          title: 'An idea + a problem',
          body: 'The best businesses solve a real problem. What do people in your neighborhood need that nobody provides? That is your business.',
        },
        {
          title: 'Start small',
          body: 'You do not need a lot of money to start. A car washing service, selling crafts, tutoring — the important thing is to start and learn.',
        },
      ],
      quiz: [
        {
          q: 'What is the foundation of a good business?',
          options: ['Solving a real problem', 'Having a lot of money', 'Copying what others do'],
          answer: 0,
          explain: 'Successful businesses solve a problem people actually have.',
        },
        {
          q: 'What do you need to start a business?',
          options: ['An idea and the will to start', 'A lot of money', 'Finishing university'],
          answer: 0,
          explain:
            'Many successful businesses started with almost nothing. The idea and action come first.',
        },
      ],
    },
  },
  advertising: {
    es: {
      cards: [
        {
          title: 'Te hablan a ti',
          body: 'La publicidad no te informa — te persuade. Cada anuncio está diseñado por expertos para hacerte sentir que necesitas lo que venden. Saberlo te da poder.',
        },
        {
          title: 'Los trucos más usados',
          body: 'Celebridades que lo usan, precios terminados en .99, "¡Solo hoy!", "Todos lo tienen" — son técnicas probadas para que compres sin pensar.',
        },
        {
          title: 'Pregunta antes de comprar',
          body: '¿Lo vi en un anuncio o lo necesito de verdad? Si la respuesta es "lo vi en un anuncio", espera. La necesidad real no desaparece con el tiempo; las ganas sí.',
        },
      ],
      quiz: [
        {
          q: '¿Por qué los precios terminan en .99?',
          options: ['Para que parezcan más baratos de lo que son', 'Por error', 'Para confundir'],
          answer: 0,
          explain: '$9.99 se siente mucho menos que $10, aunque la diferencia sea 1 centavo.',
        },
        {
          q: '¿Qué debes preguntarte antes de una compra?',
          options: [
            '¿Lo necesito o solo lo vi en un anuncio?',
            '¿Cuántos anuncios lo promocionan?',
            '¿Cuánto tiempo tiene el anuncio?',
          ],
          answer: 0,
          explain: 'Separar el deseo creado por publicidad de una necesidad real te ahorra dinero.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'They are talking to you',
          body: 'Advertising does not inform you — it persuades you. Every ad is designed by experts to make you feel you need what they sell. Knowing this gives you power.',
        },
        {
          title: 'The most used tricks',
          body: 'Celebrities using it, prices ending in .99, "Today only!", "Everyone has one" — these are proven techniques to make you buy without thinking.',
        },
        {
          title: 'Ask before buying',
          body: 'Did I see it in an ad or do I actually need it? If the answer is "I saw it in an ad," wait. A real need does not disappear with time; wants do.',
        },
      ],
      quiz: [
        {
          q: 'Why do prices end in .99?',
          options: ['To seem cheaper than they are', 'By mistake', 'To confuse'],
          answer: 0,
          explain: '$9.99 feels much less than $10, even though the difference is 1 cent.',
        },
        {
          q: 'What should you ask yourself before a purchase?',
          options: [
            'Do I need it or just see it in an ad?',
            'How many ads promote it?',
            'How long has the ad been running?',
          ],
          answer: 0,
          explain: 'Separating ad-created desire from a real need saves you money.',
        },
      ],
    },
  },
  opportunity_cost: {
    es: {
      cards: [
        {
          title: 'Elegir es renunciar',
          body: 'Cada vez que eliges algo, renuncias a otra cosa. Si gastas $100 en un videojuego, renuncias a lo que habrías hecho con ese dinero. Eso es el costo de oportunidad.',
        },
        {
          title: 'El tiempo también tiene costo',
          body: 'Si pasas 2 horas viendo videos, renuncias a 2 horas de estudio, ejercicio o aprender algo nuevo. El tiempo es el recurso más escaso — todos tienen solo 24 horas.',
        },
        {
          title: 'Tomar mejores decisiones',
          body: 'Antes de decidir, pregunta: ¿qué dejo de hacer o tener si escojo esto? Si eso que dejas vale más, quizás hay una mejor opción.',
        },
      ],
      quiz: [
        {
          q: '¿Qué es el costo de oportunidad?',
          options: [
            'Lo que renuncias cuando tomas una decisión',
            'El precio de algo',
            'Una multa por oportunidad perdida',
          ],
          answer: 0,
          explain: 'Todo tiene un costo de oportunidad: lo que no hiciste o no compraste.',
        },
        {
          q: 'Si gastas tus ahorros en un viaje, ¿cuál es el costo de oportunidad?',
          options: [
            'La meta que habrías alcanzado con ese dinero',
            'El boleto del avión',
            'El tiempo del viaje',
          ],
          answer: 0,
          explain: 'El costo de oportunidad es lo que sacrificas al elegir.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'To choose is to give up',
          body: 'Every time you choose something, you give up something else. If you spend $100 on a video game, you give up what you would have done with that money. That is opportunity cost.',
        },
        {
          title: 'Time also has a cost',
          body: 'If you spend 2 hours watching videos, you give up 2 hours of studying, exercising, or learning something new. Time is the scarcest resource — everyone has only 24 hours.',
        },
        {
          title: 'Make better decisions',
          body: 'Before deciding, ask: what do I stop doing or having if I choose this? If what you give up is worth more, maybe there is a better option.',
        },
      ],
      quiz: [
        {
          q: 'What is opportunity cost?',
          options: [
            'What you give up when you make a decision',
            'The price of something',
            'A fine for missed opportunity',
          ],
          answer: 0,
          explain: 'Everything has an opportunity cost: what you did not do or buy.',
        },
        {
          q: 'If you spend savings on a trip, what is the opportunity cost?',
          options: [
            'The goal you would have reached with that money',
            'The plane ticket',
            'The trip time',
          ],
          answer: 0,
          explain: 'Opportunity cost is what you sacrifice when you choose.',
        },
      ],
    },
  },
  giving: {
    es: {
      cards: [
        {
          title: 'El dinero que regresa',
          body: 'Dar parte de lo que tienes — a una causa, a alguien que lo necesita — no solo ayuda a otros. Estudios muestran que las personas que dan reportan más felicidad.',
        },
        {
          title: 'Cuánto dar',
          body: 'Muchas tradiciones sugieren 10% de lo que recibes. Pero no hay regla fija: lo importante es hacerlo con intención y regularidad, no por obligación.',
        },
        {
          title: 'Da tu tiempo también',
          body: 'El dinero no es lo único que puedes dar. Tu tiempo, habilidades y atención a veces valen más. Ayudar a alguien con tarea o limpiar el parque también es dar.',
        },
      ],
      quiz: [
        {
          q: '¿Por qué dar puede hacerte más feliz?',
          options: [
            'Porque ayudar a otros activa el bienestar propio',
            'Porque recibes más dinero',
            'Porque es obligatorio',
          ],
          answer: 0,
          explain:
            'La generosidad activa áreas del cerebro relacionadas con el bienestar y la satisfacción.',
        },
        {
          q: '¿Qué puedes dar además de dinero?',
          options: ['Tiempo y habilidades', 'Solo dinero funciona', 'Deudas'],
          answer: 0,
          explain: 'Tu tiempo y habilidades son recursos valiosos que también puedes compartir.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'Money that comes back',
          body: 'Giving part of what you have — to a cause, to someone who needs it — not only helps others. Studies show that people who give report more happiness.',
        },
        {
          title: 'How much to give',
          body: 'Many traditions suggest 10% of what you receive. But there is no fixed rule: what matters is doing it with intention and regularity, not out of obligation.',
        },
        {
          title: 'Give your time too',
          body: 'Money is not the only thing you can give. Your time, skills, and attention are sometimes worth more. Helping someone with homework or cleaning the park is also giving.',
        },
      ],
      quiz: [
        {
          q: 'Why can giving make you happier?',
          options: [
            'Because helping others activates your own well-being',
            'Because you receive more money',
            'Because it is required',
          ],
          answer: 0,
          explain: 'Generosity activates brain areas related to well-being and satisfaction.',
        },
        {
          q: 'What can you give besides money?',
          options: ['Time and skills', 'Only money works', 'Debts'],
          answer: 0,
          explain: 'Your time and skills are valuable resources you can also share.',
        },
      ],
    },
  },
  comparison: {
    es: {
      cards: [
        {
          title: 'El mismo producto, distinto precio',
          body: 'El mismo cereal puede costar $30 en una tienda y $22 en otra. La misma computadora puede estar $500 más barata si la compras en línea. Comparar paga.',
        },
        {
          title: 'Precio por unidad',
          body: 'Una caja grande puede parecer cara pero ser más barata por gramo o por pieza. Siempre compara el precio por unidad, no el precio total.',
        },
        {
          title: 'El costo de la comodidad',
          body: 'Comprar en la tienda del súper cerca es más cómodo, pero suele ser más caro. A veces vale pagar más por conveniencia — pero saberlo es elegir con los ojos abiertos.',
        },
      ],
      quiz: [
        {
          q: '¿Por qué conviene comparar precios?',
          options: [
            'Para pagar menos por lo mismo',
            'Para gastar más rápido',
            'Para confundir a los vendedores',
          ],
          answer: 0,
          explain: 'El mismo producto puede tener precios muy distintos en diferentes lugares.',
        },
        {
          q: '¿Qué es el precio por unidad?',
          options: [
            'El costo por gramo, litro o pieza',
            'El precio del paquete completo',
            'El precio con descuento',
          ],
          answer: 0,
          explain:
            'El precio por unidad te permite comparar cualquier tamaño de envase justamente.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'Same product, different price',
          body: 'The same cereal can cost $3 in one store and $2.20 in another. The same laptop can be $500 cheaper if you buy it online. Comparing pays off.',
        },
        {
          title: 'Price per unit',
          body: 'A large box may seem expensive but be cheaper per gram or per piece. Always compare the price per unit, not the total price.',
        },
        {
          title: 'The cost of convenience',
          body: 'Buying at the nearby corner store is more convenient but usually more expensive. Sometimes paying more for convenience is worth it — but knowing it is choosing with eyes open.',
        },
      ],
      quiz: [
        {
          q: 'Why does comparing prices pay off?',
          options: ['To pay less for the same thing', 'To spend faster', 'To confuse sellers'],
          answer: 0,
          explain: 'The same product can have very different prices in different places.',
        },
        {
          q: 'What is the price per unit?',
          options: [
            'The cost per gram, liter, or piece',
            'The full package price',
            'The discounted price',
          ],
          answer: 0,
          explain: 'Price per unit lets you compare any package size fairly.',
        },
      ],
    },
  },
  digital_money: {
    es: {
      cards: [
        {
          title: 'Dinero que no se ve',
          body: 'Hoy la mayoría del dinero es digital: números en una pantalla. Las tarjetas de débito, las transferencias y las apps de pago mueven ese dinero invisible.',
        },
        {
          title: 'Débito vs. crédito',
          body: 'Con débito gastas dinero que ya tienes. Con crédito gastas dinero que debes devolver. La tarjeta de débito no te endeuda; la de crédito sí, si no la pagas completa.',
        },
        {
          title: 'Seguridad digital',
          body: 'Nunca compartas tu NIP o contraseña. Revisa tus movimientos seguido. Si ves un cobro que no reconoces, repórtalo inmediatamente.',
        },
      ],
      quiz: [
        {
          q: '¿Cuál es la diferencia entre débito y crédito?',
          options: [
            'Débito gasta lo tuyo; crédito pide prestado',
            'Son lo mismo',
            'Crédito es más seguro',
          ],
          answer: 0,
          explain:
            'Con débito solo gastas lo que tienes. Con crédito estás pidiendo dinero prestado.',
        },
        {
          q: '¿Qué debes hacer si ves un cobro desconocido?',
          options: ['Reportarlo de inmediato', 'Ignorarlo', 'Esperar a ver si se repite'],
          answer: 0,
          explain: 'Los cobros desconocidos pueden ser fraude. Repórtalos cuanto antes.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'Money you cannot see',
          body: 'Today most money is digital: numbers on a screen. Debit cards, transfers, and payment apps move that invisible money.',
        },
        {
          title: 'Debit vs. credit',
          body: 'With debit you spend money you already have. With credit you spend money you must pay back. A debit card does not put you in debt; a credit card does, if you do not pay it in full.',
        },
        {
          title: 'Digital security',
          body: 'Never share your PIN or password. Check your transactions often. If you see a charge you do not recognize, report it immediately.',
        },
      ],
      quiz: [
        {
          q: 'What is the difference between debit and credit?',
          options: ['Debit spends yours; credit borrows', 'They are the same', 'Credit is safer'],
          answer: 0,
          explain: 'With debit you only spend what you have. With credit you are borrowing money.',
        },
        {
          q: 'What should you do if you see an unknown charge?',
          options: ['Report it immediately', 'Ignore it', 'Wait to see if it repeats'],
          answer: 0,
          explain: 'Unknown charges may be fraud. Report them as soon as possible.',
        },
      ],
    },
  },
  scams: {
    es: {
      cards: [
        {
          title: 'Si suena demasiado bueno…',
          body: '"Gana $5,000 desde casa trabajando 1 hora al día." "Tu tío en el extranjero te dejó herencia." Si parece increíble, casi seguro es una trampa.',
        },
        {
          title: 'Los fraudes más comunes',
          body: 'Phishing: emails falsos que parecen de tu banco. Pirámides: negocios donde el dinero viene de nuevos miembros, no de un producto real. Vendedores falsos en redes sociales.',
        },
        {
          title: 'Cómo protegerte',
          body: 'No compartas contraseñas ni datos bancarios. Verifica siempre la fuente. Si tienes duda, no hagas nada — mejor perder una oportunidad que todo tu dinero.',
        },
      ],
      quiz: [
        {
          q: '¿Cómo reconoces una estafa probable?',
          options: [
            'Promete ganancias muy altas con poco esfuerzo',
            'Te cobra por adelantado de forma rara',
            'Ambas son señales',
          ],
          answer: 2,
          explain: 'Las promesas imposibles y los cobros extraños son señales de alerta clásicas.',
        },
        {
          q: '¿Qué es el phishing?',
          options: [
            'Emails falsos que roban tu información',
            'Pesca deportiva',
            'Un tipo de inversión',
          ],
          answer: 0,
          explain: 'El phishing simula ser una empresa real para robarte contraseñas o dinero.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'If it sounds too good…',
          body: '"Earn $5,000 from home working 1 hour a day." "Your uncle abroad left you an inheritance." If it seems incredible, it is almost certainly a trap.',
        },
        {
          title: 'The most common scams',
          body: 'Phishing: fake emails that look like your bank. Pyramids: businesses where money comes from new members, not a real product. Fake sellers on social media.',
        },
        {
          title: 'How to protect yourself',
          body: 'Never share passwords or banking details. Always verify the source. When in doubt, do nothing — better to miss an opportunity than lose all your money.',
        },
      ],
      quiz: [
        {
          q: 'How do you recognize a likely scam?',
          options: [
            'It promises very high gains with little effort',
            'It charges you upfront in a strange way',
            'Both are signs',
          ],
          answer: 2,
          explain: 'Impossible promises and strange upfront charges are classic warning signs.',
        },
        {
          q: 'What is phishing?',
          options: [
            'Fake emails that steal your information',
            'Sport fishing',
            'A type of investment',
          ],
          answer: 0,
          explain: 'Phishing pretends to be a real company to steal your passwords or money.',
        },
      ],
    },
  },
  investing: {
    es: {
      cards: [
        {
          title: '¿Qué es invertir?',
          body: 'Invertir es poner tu dinero a trabajar esperando que crezca. A diferencia del ahorro (que crece lento en el banco), invertir puede dar mayores rendimientos — pero también mayor riesgo.',
        },
        {
          title: 'Acciones y fondos',
          body: 'Una acción es una pequeña parte de una empresa. Si la empresa crece, tu parte vale más. Los fondos mezclan muchas acciones para que si una baja, las otras te protejan.',
        },
        {
          title: 'El tiempo es tu mejor aliado',
          body: 'Empezar a invertir a los 15 años vs. a los 30 puede duplicar lo que tienes al retiro, gracias al interés compuesto. Cada año que esperas te cuesta mucho.',
        },
      ],
      quiz: [
        {
          q: '¿Cuál es la diferencia entre ahorrar e invertir?',
          options: [
            'Invertir puede dar más rendimiento pero con más riesgo',
            'Son lo mismo',
            'Ahorrar da más dinero',
          ],
          answer: 0,
          explain:
            'Ahorrar es seguro pero lento. Invertir puede crecer más, pero puede bajar también.',
        },
        {
          q: '¿Por qué es importante empezar a invertir joven?',
          options: [
            'El interés compuesto multiplica el dinero con el tiempo',
            'Porque los jóvenes son más inteligentes',
            'No importa cuándo empiezas',
          ],
          answer: 0,
          explain: 'Cada año que el dinero trabaja se multiplica. Empezar joven cambia todo.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'What is investing?',
          body: 'Investing is putting your money to work hoping it grows. Unlike saving (which grows slowly at the bank), investing can give higher returns — but also higher risk.',
        },
        {
          title: 'Stocks and funds',
          body: 'A stock is a small piece of a company. If the company grows, your piece is worth more. Funds mix many stocks so if one drops, the others protect you.',
        },
        {
          title: 'Time is your best ally',
          body: 'Starting to invest at 15 vs. 30 can double what you have at retirement, thanks to compound interest. Every year you wait costs you a lot.',
        },
      ],
      quiz: [
        {
          q: 'What is the difference between saving and investing?',
          options: [
            'Investing can give more return but with more risk',
            'They are the same',
            'Saving gives more money',
          ],
          answer: 0,
          explain: 'Saving is safe but slow. Investing can grow more, but can also drop.',
        },
        {
          q: 'Why is it important to start investing young?',
          options: [
            'Compound interest multiplies money over time',
            'Because young people are smarter',
            "It doesn't matter when you start",
          ],
          answer: 0,
          explain: 'Every year money works it multiplies. Starting young changes everything.',
        },
      ],
    },
  },
  money_emotions: {
    es: {
      cards: [
        {
          title: 'El dinero y los sentimientos',
          body: 'Muchas decisiones de dinero vienen del miedo, la euforia, la tristeza o el aburrimiento. "Compro cuando estoy triste" es una frase que sale muy cara.',
        },
        {
          title: 'El gasto emocional',
          body: '"Retail therapy" — comprar para sentirte mejor — funciona por 30 minutos y luego viene el remordimiento. Identificar qué sientes antes de comprar es el primer paso.',
        },
        {
          title: 'Hablar de dinero',
          body: 'En muchas familias el dinero es tabú. Pero hablar abiertamente de él — sin vergüenza — lleva a mejores decisiones. El silencio cuesta más que la incomodidad.',
        },
      ],
      quiz: [
        {
          q: '¿Por qué el gasto emocional es peligroso?',
          options: [
            'La satisfacción es temporal pero el gasto es real',
            'Porque es caro siempre',
            'No es peligroso',
          ],
          answer: 0,
          explain: 'Comprar para sentirse mejor da alivio corto pero deja un hoyo en la cartera.',
        },
        {
          q: '¿Cuál es el primer paso para controlar el gasto emocional?',
          options: [
            'Identificar qué sientes antes de comprar',
            'No tener tarjeta',
            'Comprar solo en efectivo',
          ],
          answer: 0,
          explain: 'Si sabes que compras cuando estás triste, puedes pausar y elegir diferente.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'Money and feelings',
          body: 'Many money decisions come from fear, euphoria, sadness, or boredom. "I buy when I am sad" is a phrase that gets very expensive.',
        },
        {
          title: 'Emotional spending',
          body: '"Retail therapy" — buying to feel better — works for 30 minutes and then comes regret. Identifying what you feel before buying is the first step.',
        },
        {
          title: 'Talking about money',
          body: 'In many families money is taboo. But talking openly about it — without shame — leads to better decisions. Silence costs more than the discomfort.',
        },
      ],
      quiz: [
        {
          q: 'Why is emotional spending dangerous?',
          options: [
            'Satisfaction is temporary but the expense is real',
            'Because it is always expensive',
            'It is not dangerous',
          ],
          answer: 0,
          explain: 'Buying to feel better gives short relief but leaves a hole in your wallet.',
        },
        {
          q: 'What is the first step to control emotional spending?',
          options: [
            'Identify what you feel before buying',
            'Not having a card',
            'Only buying with cash',
          ],
          answer: 0,
          explain: 'If you know you buy when sad, you can pause and choose differently.',
        },
      ],
    },
  },
  income: {
    es: {
      cards: [
        {
          title: 'Más formas de ganar',
          body: 'El trabajo asalariado (sueldo por horas o mes) es una manera. Pero también existe el trabajo freelance, los negocios propios, y los ingresos pasivos (rentas, inversiones).',
        },
        {
          title: 'Habilidades que pagan más',
          body: 'Las habilidades escasas y valiosas (programar, diseñar, hablar otro idioma, resolver problemas complejos) generalmente se pagan mejor. Invertir en aprender paga dividendos.',
        },
        {
          title: 'Diversifica tus ingresos',
          body: 'Depender de una sola fuente de dinero es riesgoso. Tener 2 o 3 fuentes (trabajo + negocio pequeño + inversión) te da más estabilidad si una falla.',
        },
      ],
      quiz: [
        {
          q: '¿Qué son los ingresos pasivos?',
          options: [
            'Dinero que ganas sin trabajar activamente (renta, inversión)',
            'El sueldo de tu trabajo',
            'Dinero que recibes de propinas',
          ],
          answer: 0,
          explain:
            'Los ingresos pasivos son los que no requieren tu tiempo directo para generarse.',
        },
        {
          q: '¿Por qué conviene tener varias fuentes de ingreso?',
          options: [
            'Si una falla, las otras te sostienen',
            'Para pagar más impuestos',
            'No conviene',
          ],
          answer: 0,
          explain:
            'Diversificar ingresos reduce el riesgo de quedarte sin dinero si un trabajo se acaba.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'More ways to earn',
          body: 'Salaried work (pay per hour or month) is one way. But there is also freelance work, your own businesses, and passive income (rent, investments).',
        },
        {
          title: 'Skills that pay more',
          body: 'Scarce and valuable skills (coding, designing, speaking another language, solving complex problems) generally pay better. Investing in learning pays dividends.',
        },
        {
          title: 'Diversify your income',
          body: 'Depending on a single money source is risky. Having 2 or 3 sources (job + small business + investment) gives you more stability if one fails.',
        },
      ],
      quiz: [
        {
          q: 'What is passive income?',
          options: [
            'Money you earn without actively working (rent, investment)',
            'Your work salary',
            'Money from tips',
          ],
          answer: 0,
          explain: 'Passive income does not require your direct time to generate.',
        },
        {
          q: 'Why is having multiple income sources a good idea?',
          options: [
            'If one fails, the others support you',
            'To pay more taxes',
            'It is not a good idea',
          ],
          answer: 0,
          explain: 'Diversifying income reduces the risk of running out of money if a job ends.',
        },
      ],
    },
  },
  long_goals: {
    es: {
      cards: [
        {
          title: 'Pensar en años, no en días',
          body: 'Las metas cortas (un juguete, una salida) son motivantes. Pero las metas a largo plazo (universidad, un auto, retiro) son las que cambian tu vida.',
        },
        {
          title: 'El poder de la consistencia',
          body: 'Ahorrar $100 al mes durante 10 años, con un rendimiento modesto, puede convertirse en $15,000 o más. No es magia — es constancia.',
        },
        {
          title: 'Escríbelas',
          body: 'Las personas que escriben sus metas financieras tienen muchas más probabilidades de alcanzarlas. Escribe la meta, la fecha, y cuánto necesitas ahorrar por mes.',
        },
      ],
      quiz: [
        {
          q: '¿Por qué escribir tus metas financieras?',
          options: [
            'Porque quien las escribe tiene más probabilidad de lograrlas',
            'Para que otros las vean',
            'No cambia nada',
          ],
          answer: 0,
          explain: 'Escribir metas activa el compromiso mental y ayuda a seguirlas.',
        },
        {
          q: '¿Cuál es la clave de alcanzar metas a largo plazo?',
          options: [
            'Constancia: ahorrar un poco cada mes, siempre',
            'Ahorrar mucho de golpe',
            'Esperar a ganar más',
          ],
          answer: 0,
          explain: 'La constancia mes a mes es más poderosa que los esfuerzos esporádicos.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'Think in years, not days',
          body: 'Short-term goals (a toy, an outing) are motivating. But long-term goals (college, a car, retirement) are the ones that change your life.',
        },
        {
          title: 'The power of consistency',
          body: 'Saving $100 a month for 10 years, with a modest return, can become $15,000 or more. It is not magic — it is consistency.',
        },
        {
          title: 'Write them down',
          body: 'People who write their financial goals are much more likely to achieve them. Write the goal, the date, and how much you need to save per month.',
        },
      ],
      quiz: [
        {
          q: 'Why write your financial goals?',
          options: [
            'Because those who write them are more likely to achieve them',
            'So others can see them',
            'It changes nothing',
          ],
          answer: 0,
          explain: 'Writing goals activates mental commitment and helps you follow through.',
        },
        {
          q: 'What is the key to reaching long-term goals?',
          options: [
            'Consistency: save a little each month, always',
            'Save a lot all at once',
            'Wait until you earn more',
          ],
          answer: 0,
          explain: 'Monthly consistency is more powerful than sporadic efforts.',
        },
      ],
    },
  },
  negotiation: {
    es: {
      cards: [
        {
          title: 'Todo es negociable',
          body: 'El precio de casi cualquier cosa puede bajarse si sabes negociar: desde el precio de un coche hasta un servicio de internet. No preguntar es pagar de más.',
        },
        {
          title: 'El silencio es tu arma',
          body: 'Después de hacer una oferta, cállate. El que habla primero suele ceder. Aprende a esperar cómodamente — es incómodo pero efectivo.',
        },
        {
          title: 'Gana-gana',
          body: 'La mejor negociación no es en la que tú ganas todo. Es en la que ambos se van satisfechos. Busca entender qué quiere la otra persona y encuentra soluciones que funcionen para los dos.',
        },
      ],
      quiz: [
        {
          q: '¿Cuál es el primer paso para negociar mejor?',
          options: [
            'Investigar el valor real de lo que quieres comprar',
            'Hablar muy rápido',
            'Ofrecer lo más alto posible',
          ],
          answer: 0,
          explain:
            'Saber el precio real te da poder para hacer una oferta razonable con confianza.',
        },
        {
          q: '¿Por qué el silencio ayuda en una negociación?',
          options: ['El que habla primero suele ceder', 'Asusta al vendedor', 'Muestra desinterés'],
          answer: 0,
          explain: 'La incomodidad del silencio presiona al otro a hacer concesiones.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'Everything is negotiable',
          body: 'The price of almost anything can be lowered if you know how to negotiate: from the price of a car to an internet service. Not asking is paying more.',
        },
        {
          title: 'Silence is your weapon',
          body: 'After making an offer, be quiet. The person who speaks first usually gives in. Learn to wait comfortably — it is uncomfortable but effective.',
        },
        {
          title: 'Win-win',
          body: 'The best negotiation is not the one where you win everything. It is the one where both parties leave satisfied. Try to understand what the other person wants and find solutions that work for both.',
        },
      ],
      quiz: [
        {
          q: 'What is the first step to negotiate better?',
          options: [
            'Research the real value of what you want to buy',
            'Talk very fast',
            'Offer as high as possible',
          ],
          answer: 0,
          explain:
            'Knowing the real price gives you the power to make a reasonable offer with confidence.',
        },
        {
          q: 'Why does silence help in a negotiation?',
          options: [
            'The person who speaks first usually gives in',
            'It scares the seller',
            'It shows disinterest',
          ],
          answer: 0,
          explain: 'The discomfort of silence pressures the other person to make concessions.',
        },
      ],
    },
  },
  insurance: {
    es: {
      cards: [
        {
          title: '¿Qué es el seguro?',
          body: 'Es un contrato donde pagas una cantidad pequeña y regular (prima) a cambio de que alguien te ayude si ocurre algo malo costoso (accidente, enfermedad, robo).',
        },
        {
          title: 'Por qué vale la pena',
          body: 'Un accidente de auto puede costar $50,000. Si tienes seguro, tal vez pagas $500. La prima mensual es el precio de no arriesgar todo.',
        },
        {
          title: 'Tipos comunes',
          body: 'Seguro de salud (enfermedad), de auto (accidentes), de vida (para tu familia si mueres), de hogar (incendio, robo). Cada uno protege algo diferente.',
        },
      ],
      quiz: [
        {
          q: '¿Qué es una prima de seguro?',
          options: [
            'El pago regular que haces para tener cobertura',
            'El dinero que recibes si algo pasa',
            'Un regalo de la aseguradora',
          ],
          answer: 0,
          explain: 'La prima es lo que pagas mensual o anualmente para mantener activo tu seguro.',
        },
        {
          q: '¿Para qué sirve el seguro de vida?',
          options: [
            'Para proteger económicamente a tu familia si mueres',
            'Para ganar dinero',
            'Para viajar',
          ],
          answer: 0,
          explain: 'El seguro de vida garantiza que tu familia tenga recursos si tú faltas.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'What is insurance?',
          body: 'It is a contract where you pay a small regular amount (premium) in exchange for help if something expensive happens (accident, illness, theft).',
        },
        {
          title: 'Why it is worth it',
          body: 'A car accident can cost $50,000. With insurance, maybe you pay $500. The monthly premium is the price of not risking everything.',
        },
        {
          title: 'Common types',
          body: 'Health insurance (illness), auto insurance (accidents), life insurance (for your family if you die), home insurance (fire, theft). Each protects something different.',
        },
      ],
      quiz: [
        {
          q: 'What is an insurance premium?',
          options: [
            'The regular payment you make to have coverage',
            'The money you receive if something happens',
            'A gift from the insurer',
          ],
          answer: 0,
          explain: 'The premium is what you pay monthly or annually to keep your insurance active.',
        },
        {
          q: 'What is life insurance for?',
          options: ['To financially protect your family if you die', 'To make money', 'To travel'],
          answer: 0,
          explain: 'Life insurance ensures your family has resources if you are gone.',
        },
      ],
    },
  },
  value: {
    es: {
      cards: [
        {
          title: 'Precio ≠ valor',
          body: 'Un libro de $200 que cambia tu vida vale más que un celular de $20,000 que usas para redes sociales. El valor es lo que algo aporta a tu vida, no lo que cuesta.',
        },
        {
          title: 'El valor de las experiencias',
          body: 'Los estudios muestran que las experiencias (viajes, conciertos, aprender algo) dan más felicidad duradera que los objetos. Una cena especial se recuerda más que un gadget.',
        },
        {
          title: 'Tu propio sistema de valores',
          body: 'No hay respuesta universal sobre qué vale la pena comprar. Lo importante es que TÚ decidas basado en lo que realmente importa en tu vida, no en lo que otros piensan.',
        },
      ],
      quiz: [
        {
          q: '¿Cuál es la diferencia entre precio y valor?',
          options: [
            'El precio es lo que pagas; el valor es lo que aporta a tu vida',
            'Son lo mismo',
            'El valor siempre es más alto que el precio',
          ],
          answer: 0,
          explain:
            'Algo puede ser caro y tener poco valor para ti, o barato y transformar tu vida.',
        },
        {
          q: 'Según estudios, ¿qué da más felicidad duradera?',
          options: [
            'Las experiencias (viajes, aprendizaje)',
            'Los objetos caros',
            'No hay diferencia',
          ],
          answer: 0,
          explain:
            'Las experiencias crean recuerdos y habilidades; los objetos se desgastan y aburren.',
        },
      ],
    },
    en: {
      cards: [
        {
          title: 'Price ≠ value',
          body: 'A $20 book that changes your life is worth more than a $2,000 phone you use for social media. Value is what something contributes to your life, not what it costs.',
        },
        {
          title: 'The value of experiences',
          body: 'Studies show that experiences (travel, concerts, learning) give more lasting happiness than objects. A special dinner is remembered more than a gadget.',
        },
        {
          title: 'Your own value system',
          body: 'There is no universal answer about what is worth buying. What matters is that YOU decide based on what truly matters in your life, not what others think.',
        },
      ],
      quiz: [
        {
          q: 'What is the difference between price and value?',
          options: [
            'Price is what you pay; value is what it adds to your life',
            'They are the same',
            'Value is always higher than price',
          ],
          answer: 0,
          explain:
            'Something can be expensive with little value to you, or cheap and transform your life.',
        },
        {
          q: 'According to studies, what gives more lasting happiness?',
          options: ['Experiences (travel, learning)', 'Expensive objects', 'No difference'],
          answer: 0,
          explain: 'Experiences create memories and skills; objects wear out and become boring.',
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
