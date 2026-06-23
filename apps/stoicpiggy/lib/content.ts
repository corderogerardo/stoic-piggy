// Mobile app — bilingual strings + data, ported from the handoff.
export type Lang = 'es' | 'en';

export interface QuestData {
  icon: string;
  xp: number;
  status: 'done' | 'prog' | 'locked';
  prog?: string;
  es: { t: string; d: string };
  en: { t: string; d: string };
}
export interface AchData {
  icon: string;
  earned: boolean;
  es: { t: string; d: string };
  en: { t: string; d: string };
}
export interface KidTask {
  id: number;
  icon: string;
  amt?: number;
  xp?: number;
  es: string;
  en: string;
}

export const TASKS: KidTask[] = [
  { id: 1, icon: 'trash-o', amt: 20, es: 'Sacar la basura', en: 'Take out the trash' },
  { id: 3, icon: 'book', xp: 50, es: 'Leer 20 minutos', en: 'Read for 20 minutes' },
  { id: 4, icon: 'paw', amt: 25, es: 'Pasear al perro', en: 'Walk the dog' },
  { id: 5, icon: 'paint-brush', amt: 50, es: 'Pintar la cerca', en: 'Paint the fence' },
  { id: 2, icon: 'bed', amt: 10, es: 'Tender la cama', en: 'Make the bed' },
];

export const QUESTS: QuestData[] = [
  {
    icon: 'pie-chart',
    xp: 120,
    status: 'done',
    es: { t: 'Presupuesto base', d: 'Dale un trabajo a cada peso antes de gastarlo.' },
    en: { t: 'The base budget', d: 'Give every dollar a job before you spend it.' },
  },
  {
    icon: 'line-chart',
    xp: 150,
    status: 'prog',
    prog: '3/5',
    es: { t: 'Interés compuesto', d: 'Tu dinero crece mientras descansas.' },
    en: { t: 'Compound interest', d: 'Your money grows while you rest.' },
  },
  {
    icon: 'shield',
    xp: 140,
    status: 'prog',
    prog: '1/4',
    es: { t: 'Fondo de emergencia', d: 'El colchón que te da calma estoica.' },
    en: { t: 'Emergency fund', d: 'The cushion that buys you calm.' },
  },
  {
    icon: 'balance-scale',
    xp: 160,
    status: 'locked',
    es: { t: 'Deuda buena vs mala', d: 'No toda deuda es tu enemiga.' },
    en: { t: 'Good vs bad debt', d: 'Not all debt is your enemy.' },
  },
  {
    icon: 'rocket',
    xp: 200,
    status: 'locked',
    es: { t: 'Inversión 101', d: 'Pon tu dinero a trabajar a largo plazo.' },
    en: { t: 'Investing 101', d: 'Put your money to work for the long run.' },
  },
];

export const ACHIEVEMENTS: AchData[] = [
  {
    icon: 'star',
    earned: true,
    es: { t: 'Primera semana', d: '7 días de racha' },
    en: { t: 'First week', d: '7-day streak' },
  },
  {
    icon: 'snowflake-o',
    earned: true,
    es: { t: 'Mente fría', d: 'Resististe 10 impulsos' },
    en: { t: 'Cool mind', d: 'Resisted 10 urges' },
  },
  {
    icon: 'bank',
    earned: true,
    es: { t: 'Ahorrador', d: '$2,000 guardados' },
    en: { t: 'Saver', d: '$2,000 saved' },
  },
  {
    icon: 'book',
    earned: false,
    es: { t: 'Estudiante', d: 'Completa 3 misiones' },
    en: { t: 'Student', d: 'Finish 3 quests' },
  },
  {
    icon: 'trophy',
    earned: false,
    es: { t: 'Filósofo del dinero', d: 'Llega a nivel 10' },
    en: { t: 'Money sage', d: 'Reach level 10' },
  },
  {
    icon: 'fire',
    earned: false,
    es: { t: 'Racha de fuego', d: '30 días seguidos' },
    en: { t: 'On fire', d: '30-day streak' },
  },
];

export const REPLIES: Record<Lang, string[]> = {
  es: [
    'Pregúntate: ¿lo necesito o solo lo deseo? El deseo pasa; la meta queda.',
    'Empieza pequeño: aparta el 10% apenas te paguen, antes de gastar nada.',
    'Un fondo de emergencia son 3 a 6 meses de gastos. Es tu armadura contra el caos.',
    'Si esperas 24 horas y aún lo quieres, quizá valga. Casi nunca lo querrás igual.',
  ],
  en: [
    'Ask yourself: do I need it, or do I just want it? The want fades; the goal stays.',
    'Start small: set aside 10% the moment you get paid, before you spend anything.',
    'An emergency fund is 3 to 6 months of expenses. It is your armor against chaos.',
    'If you wait 24 hours and still want it, maybe it is worth it. You rarely will.',
  ],
};

const es = {
  nav: { home: 'Inicio', tasks: 'Tareas', coach: 'Mentor', learn: 'Misiones', wins: 'Logros' },
  ob: {
    eyebrow: 'TU MENTOR FINANCIERO ZEN',
    title1: 'Ahorra con calma.',
    title2: 'Gasta con propósito.',
    sub: 'Aprende finanzas con una cochinita estoica que te enseña a no comprar por impulso.',
    f1: 'Domina tus impulsos',
    f1d: 'Reta tus antojos antes de pagar',
    f2: 'Misiones de dinero',
    f2d: 'Aprende un concepto a la vez',
    f3: 'Mentor con IA',
    f3d: 'La cochinita responde tus dudas',
    cta: 'Empezar',
    login: 'Ya tengo cuenta',
  },
  home: {
    hi: 'Hola de nuevo',
    level: 'NIVEL 7',
    balLabel: 'AHORRADO ESTE MES',
    streak: '7 DÍAS',
    xp: 'EXPERIENCIA',
    chEyebrow: 'RETO DEL DÍA',
    chTitle: 'Resiste la tentación',
    chBody: 'Apareció un antojo. Respira y decide con la cabeza fría.',
    chCta: 'Aceptar reto',
    questEyebrow: 'MISIÓN ACTUAL',
    questTitle: 'Interés compuesto',
    questProg: '3 / 5',
    questBody: 'El dinero que no gastas trabaja por ti. Aprende cómo crece solo.',
    questCta: 'Continuar misión',
    askEyebrow: 'PREGÚNTALE A LA COCHINITA',
    askBody: '¿Gastar o ahorrar? Tu mentor estoico te ayuda a decidir.',
    tip: '"La riqueza consiste no en tener grandes posesiones, sino en tener pocas necesidades."',
    tipAuthor: '— EPICTETO',
  },
  coach: {
    name: 'Cochinita Zen',
    status: 'EN LÍNEA',
    placeholder: 'Escribe tu duda...',
    intro:
      'Respira. Antes de gastar, preguntémonos: ¿esto te acerca a tu meta o solo calma un impulso?',
    s1: '¿Cómo empiezo a ahorrar?',
    s2: '¿Vale la pena este antojo?',
    s3: '¿Qué es un fondo de emergencia?',
  },
  templ: {
    eyebrow: 'RETO · RESISTE EL IMPULSO',
    wantLabel: 'APARECIÓ UN ANTOJO',
    wantItem: 'Tenis edición limitada',
    wantPrice: '$1,800',
    wantBody: 'Los viste en oferta. Tu mente dice "ahora o nunca". Tu cochinita dice: respira.',
    breatheCta: 'Respira antes de decidir',
    buyNow: 'Comprar sin pensar',
    breathing: 'Inhala… exhala…',
    breathingSub: 'Deja que el impulso pase',
    decideQ: 'El impulso bajó. ¿Qué decides?',
    resist: 'Resistir',
    buyAnyway: 'Comprar de todos modos',
    wonTitle: 'Mente fría.',
    wonBody: 'Resististe. Ese dinero ahora trabaja para tu meta, no para un capricho.',
    wonQuote: '"No es pobre el que tiene poco, sino el que desea más."',
    wonAuthor: '— SÉNECA',
    wonXp: '+50 XP · +$1,800 a tu meta',
    wonCta: 'Volver al inicio',
    again: 'Otro reto',
    boughtTitle: 'Sin culpa.',
    boughtBody:
      'A veces compramos. Lo estoico es notarlo y elegir mejor la próxima vez. Aprendiste algo de ti.',
    boughtCta: 'Entendido',
    resistedLabel: 'RESISTIDOS',
  },
  tasks: {
    title: 'Mis tareas',
    sub: 'Asignadas por mamá. Complétalas y gana.',
    earnLabel: 'PUEDES GANAR ESTA SEMANA',
    todo: 'POR HACER',
    pending: 'ESPERANDO A MAMÁ',
    approved: 'APROBADA ✓',
  },
  lessons: {
    title: 'Misiones',
    sub: 'Aprende finanzas, una quest a la vez',
    done: 'COMPLETADA',
    prog: 'EN CURSO',
    locked: 'BLOQUEADA',
  },
  wins: {
    title: 'Logros',
    sub: 'Tu camino estoico con el dinero',
    earned: 'OBTENIDO',
    locked: 'BLOQUEADO',
    stat1: 'NIVEL',
    stat2: 'RACHA',
    stat3: 'RESISTIDOS',
  },
};

const en: typeof es = {
  nav: { home: 'Home', tasks: 'Tasks', coach: 'Coach', learn: 'Quests', wins: 'Wins' },
  ob: {
    eyebrow: 'YOUR ZEN MONEY MENTOR',
    title1: 'Save with calm.',
    title2: 'Spend with purpose.',
    sub: 'Learn money skills with a stoic little pig who teaches you to resist impulse buys.',
    f1: 'Master your impulses',
    f1d: 'Challenge your urges before you pay',
    f2: 'Money quests',
    f2d: 'Learn one concept at a time',
    f3: 'AI mentor',
    f3d: 'The piggy answers your questions',
    cta: 'Get started',
    login: 'I already have an account',
  },
  home: {
    hi: 'Welcome back',
    level: 'LEVEL 7',
    balLabel: 'SAVED THIS MONTH',
    streak: '7 DAYS',
    xp: 'EXPERIENCE',
    chEyebrow: 'DAILY CHALLENGE',
    chTitle: 'Resist the temptation',
    chBody: 'An urge appeared. Breathe and decide with a cool head.',
    chCta: 'Take the challenge',
    questEyebrow: 'CURRENT QUEST',
    questTitle: 'Compound interest',
    questProg: '3 / 5',
    questBody: 'The money you do not spend works for you. Learn how it grows on its own.',
    questCta: 'Continue quest',
    askEyebrow: 'ASK THE PIGGY',
    askBody: 'Spend or save? Your stoic mentor helps you decide.',
    tip: '"Wealth consists not in having great possessions, but in having few wants."',
    tipAuthor: '— EPICTETUS',
  },
  coach: {
    name: 'Zen Piggy',
    status: 'ONLINE',
    placeholder: 'Type your question...',
    intro:
      'Breathe. Before you spend, let us ask: does this move you toward your goal, or just calm an urge?',
    s1: 'How do I start saving?',
    s2: 'Is this urge worth it?',
    s3: 'What is an emergency fund?',
  },
  templ: {
    eyebrow: 'CHALLENGE · RESIST THE URGE',
    wantLabel: 'AN URGE APPEARED',
    wantItem: 'Limited edition sneakers',
    wantPrice: '$1,800',
    wantBody: 'You saw them on sale. Your mind says "now or never". Your piggy says: breathe.',
    breatheCta: 'Breathe before deciding',
    buyNow: 'Buy without thinking',
    breathing: 'Inhale… exhale…',
    breathingSub: 'Let the urge pass',
    decideQ: 'The urge faded. What do you choose?',
    resist: 'Resist',
    buyAnyway: 'Buy it anyway',
    wonTitle: 'Cool mind.',
    wonBody: 'You resisted. That money now works for your goal, not for a whim.',
    wonQuote: '"It is not the man who has too little, but the man who craves more, that is poor."',
    wonAuthor: '— SENECA',
    wonXp: '+50 XP · +$1,800 to your goal',
    wonCta: 'Back to home',
    again: 'Another challenge',
    boughtTitle: 'No guilt.',
    boughtBody:
      'Sometimes we buy. The stoic move is to notice it and choose better next time. You learned something.',
    boughtCta: 'Got it',
    resistedLabel: 'RESISTED',
  },
  tasks: {
    title: 'My tasks',
    sub: 'Assigned by mom. Finish them and earn.',
    earnLabel: 'YOU CAN EARN THIS WEEK',
    todo: 'TO DO',
    pending: 'WAITING FOR MOM',
    approved: 'APPROVED ✓',
  },
  lessons: {
    title: 'Quests',
    sub: 'Learn money skills, one quest at a time',
    done: 'COMPLETED',
    prog: 'IN PROGRESS',
    locked: 'LOCKED',
  },
  wins: {
    title: 'Wins',
    sub: 'Your stoic journey with money',
    earned: 'EARNED',
    locked: 'LOCKED',
    stat1: 'LEVEL',
    stat2: 'STREAK',
    stat3: 'RESISTED',
  },
};

export type AppStrings = typeof es;
export const STR: Record<Lang, AppStrings> = { es, en };
