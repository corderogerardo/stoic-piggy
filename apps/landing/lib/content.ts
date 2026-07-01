// Bilingual landing copy — ported verbatim from the Claude Design handoff.
export type Lang = 'es' | 'en';

export interface TrustItem {
  icon: string;
  label: string;
}
export interface FlowPoint {
  b: string;
  t: string;
}
export interface Feature {
  icon: string;
  title: string;
  body: string;
}
export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initial: string;
  avBg: string;
}
export interface Faq {
  q: string;
  a: string;
}
export interface StepText {
  tag: string;
  title: string;
  body: string;
}

export interface LandingContent {
  nav: { how: string; features: string; faq: string; download: string; cta: string };
  hero: {
    eyebrow: string;
    title1: string;
    title2: string;
    sub: string;
    cta1: string;
    cta2: string;
    t1: string;
    t2: string;
  };
  mock: {
    hi: string;
    level: string;
    bal: string;
    tasksLabel: string;
    t1: string;
    t2: string;
    streak: string;
  };
  trust: { label: string; items: TrustItem[] };
  how: { eyebrow: string; title: string; sub: string; steps: StepText[] };
  flow: {
    eyebrow: string;
    title: string;
    sub: string;
    points: FlowPoint[];
    cardLabel: string;
    cardTag: string;
    taskName: string;
    taskMeta: string;
    coachMsg: string;
    goalLabel: string;
    goalName: string;
  };
  feat: { eyebrow: string; title: string };
  download: {
    eyebrow: string;
    title: string;
    sub: string;
    cta: string;
    ctaSoon: string;
    note: string;
  };
  features: Feature[];
  stoic: { eyebrow: string; quote: string; author: string; body: string };
  testi: { eyebrow: string; title: string; items: Testimonial[] };
  faq: { eyebrow: string; title: string; items: Faq[] };
  footer: {
    title: string;
    sub: string;
    cta1: string;
    cta2: string;
    legal: string;
    privacy: string;
    terms: string;
  };
}

export const CONTENT: Record<Lang, LandingContent> = {
  es: {
    nav: {
      how: 'Cómo funciona',
      features: 'Funciones',
      faq: 'Preguntas',
      download: 'Descargar',
      cta: 'Empezar gratis',
    },
    hero: {
      eyebrow: 'PARA PADRES QUE CRÍAN HIJOS LISTOS CON EL DINERO',
      title1: 'Tareas que enseñan.',
      title2: 'Dinero con propósito.',
      sub: 'Stoic Piggy convierte las tareas del hogar en lecciones de dinero. Tú las asignas, tus hijos las completan y ganan — y aprenden a ahorrar y gastar con cabeza fría, guiados por una cochinita estoica.',
      cta1: 'Empezar gratis',
      cta2: 'Ver cómo funciona',
      t1: 'Sin tarjeta para empezar',
      t2: 'Listo en 5 minutos',
    },
    mock: {
      hi: 'Hola de nuevo',
      level: 'NIVEL 7',
      bal: 'AHORRADO ESTE MES',
      tasksLabel: 'TAREAS DE HOY',
      t1: 'Sacar la basura',
      t2: 'Leer 20 minutos',
      streak: '7 días de racha. ¡Sigue así!',
    },
    trust: {
      label: 'CONFÍAN EN STOIC PIGGY',
      items: [
        { icon: 'lock', label: 'Datos privados' },
        { icon: 'users', label: 'Para toda la familia' },
        { icon: 'mobile', label: 'iOS y Android' },
        { icon: 'leaf', label: 'Sin anuncios' },
      ],
    },
    how: {
      eyebrow: 'CÓMO FUNCIONA',
      title: 'Tres pasos, cero peleas por la mesada',
      sub: 'Desde tu panel asignas, ellos cumplen, y tú apruebas. El dinero solo entra cuando la tarea está hecha.',
      steps: [
        {
          tag: 'EN TU PANEL',
          title: 'Asigna las tareas',
          body: 'Desde el panel de padres creas tareas con un valor: sacar la basura $20, leer 20 min +50 XP. Únicas o semanales.',
        },
        {
          tag: 'EN SU APP',
          title: 'Completan y aprenden',
          body: 'Tus hijos marcan las tareas como hechas y desbloquean misiones de finanzas mientras avanzan de nivel.',
        },
        {
          tag: 'TÚ APRUEBAS',
          title: 'Ganan y ahorran',
          body: 'Apruebas con un toque, el dinero entra a su alcancía, y la cochinita los reta a ahorrarlo en vez de gastarlo.',
        },
      ],
    },
    flow: {
      eyebrow: 'DE LA TAREA AL AHORRO',
      title: 'Cada tarea es una lección de dinero',
      sub: 'No es solo pagar por chambear. Cada peso ganado pasa por la cochinita estoica, que reta a tus hijos a pensar antes de gastar.',
      points: [
        {
          b: 'Tú pones el valor.',
          t: 'Lavar el coche $50, tender la cama $10, leer un capítulo +50 XP.',
        },
        { b: 'Ellos eligen.', t: 'Marcan la tarea como hecha y la mandan a tu aprobación.' },
        {
          b: 'La cochinita interviene.',
          t: 'Antes de un gasto por impulso, los hace respirar y decidir con calma.',
        },
      ],
      cardLabel: 'TAREA ASIGNADA',
      cardTag: 'POR APROBAR',
      taskName: 'Pintar la cerca',
      taskMeta: 'Asignada a Marco · sábado',
      coachMsg: '"Ganaste $50. ¿Lo guardas para tu meta o lo gastas hoy? Respira y decide."',
      goalLabel: 'META DE AHORRO',
      goalName: 'Bici nueva',
    },
    feat: { eyebrow: 'TODO EN UN LUGAR', title: 'Hecho para padres ocupados' },
    download: {
      eyebrow: 'APP PARA HIJOS · ANDROID',
      title: 'Descarga la app en Android',
      sub: 'La app de tus hijos, directa a su teléfono Android. Descarga el archivo, ábrelo y permite la instalación. Sin tienda, sin costo.',
      cta: 'Descargar APK',
      ctaSoon: 'Disponible pronto',
      note: 'Android 8 o superior. Al instalar fuera de Play Store, tu teléfono pedirá permiso una vez. iOS: próximamente.',
    },
    features: [
      {
        icon: 'list-ul',
        title: 'Tareas con valor real',
        body: 'Crea tareas con pago en pesos o experiencia. Únicas o que se repiten cada semana.',
      },
      {
        icon: 'check-circle',
        title: 'Aprobación con un toque',
        body: 'Tus hijos marcan hecho, tú revisas y liberas el dinero. Tú tienes la última palabra.',
      },
      {
        icon: 'commenting-o',
        title: 'Mentor con IA',
        body: 'La cochinita responde dudas de dinero y los reta a no comprar por impulso.',
      },
      {
        icon: 'bank',
        title: 'Metas de ahorro',
        body: 'Cada hijo fija una meta — una bici, un juego — y ve crecer su alcancía.',
      },
      {
        icon: 'bar-chart',
        title: 'Reportes para padres',
        body: 'Mira qué tareas cumplen, cuánto ahorran y cuántos impulsos resisten.',
      },
      {
        icon: 'refresh',
        title: 'Mesada automática',
        body: 'Programa un depósito semanal o mensual y olvídate de andar con efectivo.',
      },
    ],
    stoic: {
      eyebrow: 'INSPIRADO EN LA FILOSOFÍA ESTOICA',
      quote:
        '"La riqueza no consiste en tener grandes posesiones, sino en tener pocas necesidades."',
      author: '— EPICTETO',
      body: 'Stoic Piggy no premia gastar — premia el dominio propio. Tus hijos aprenden la habilidad que ninguna escuela enseña: querer menos, elegir mejor y ahorrar para lo que de verdad importa.',
    },
    testi: {
      eyebrow: 'FAMILIAS REALES',
      title: 'Padres que ya respiran tranquilos',
      items: [
        {
          quote:
            'Mi hija dejó de pedirme dinero a cada rato. Ahora sabe que se gana, y piensa dos veces antes de gastarlo.',
          name: 'Laura M.',
          role: 'Mamá de 2 · Monterrey',
          initial: 'L',
          avBg: '#E63946',
        },
        {
          quote:
            'Las peleas por la mesada se acabaron. Asigno tareas el domingo y la app se encarga del resto.',
          name: 'Diego R.',
          role: 'Papá de 3 · CDMX',
          initial: 'D',
          avBg: '#457B9D',
        },
        {
          quote:
            'Lo de "respira antes de comprar" le quedó grabado a mi hijo. A los 11 años ya tiene su fondo de ahorro.',
          name: 'Andrea P.',
          role: 'Mamá de 1 · Guadalajara',
          initial: 'A',
          avBg: '#1D3557',
        },
      ],
    },
    faq: {
      eyebrow: 'PREGUNTAS FRECUENTES',
      title: '¿Dudas? Las resolvemos',
      items: [
        {
          q: '¿Cuánto cuesta?',
          a: 'Gratis mientras estamos en acceso anticipado — con hijos ilimitados. Queremos que las familias de verdad lo usen.',
        },
        {
          q: '¿El dinero es real?',
          a: 'Tú decides. La app lleva el saldo y las metas; tú entregas el dinero real (efectivo, transferencia o tarjeta) cuando apruebas una tarea o liberas el ahorro.',
        },
        {
          q: '¿Desde qué edad sirve?',
          a: 'Funciona bien de los 6 a los 16. Los más pequeños se enfocan en tareas y metas; los mayores desbloquean misiones de inversión y deuda.',
        },
        {
          q: '¿Mis hijos pueden gastar sin que yo sepa?',
          a: 'No. Tú apruebas cada tarea y liberas cada retiro. La cochinita además los hace pausar antes de cualquier gasto por impulso.',
        },
        {
          q: '¿Está en español?',
          a: 'Sí, completamente bilingüe español e inglés. Cambias el idioma cuando quieras desde la app.',
        },
        {
          q: '¿Mis datos están seguros?',
          a: 'Sí. No vendemos datos ni mostramos anuncios. La información de tu familia está cifrada y es solo tuya.',
        },
      ],
    },
    footer: {
      title: 'Cría hijos que entienden el dinero',
      sub: 'Empieza gratis hoy. En 5 minutos asignas tu primera tarea y tu hijo gana su primer peso con propósito.',
      cta1: 'Empezar gratis',
      cta2: 'Ver cómo funciona',
      legal: '© 2026 Stoic Piggy · Hecho con calma',
      privacy: 'Privacidad',
      terms: 'Términos',
    },
  },
  en: {
    nav: {
      how: 'How it works',
      features: 'Features',
      faq: 'FAQ',
      download: 'Download',
      cta: 'Start free',
    },
    hero: {
      eyebrow: 'FOR PARENTS RAISING MONEY-SMART KIDS',
      title1: 'Chores that teach.',
      title2: 'Money with purpose.',
      sub: 'Stoic Piggy turns household chores into money lessons. You assign them, your kids complete them and earn — and learn to save and spend with a cool head, guided by a stoic little pig.',
      cta1: 'Start free',
      cta2: 'See how it works',
      t1: 'No card to start',
      t2: 'Set up in 5 minutes',
    },
    mock: {
      hi: 'Welcome back',
      level: 'LEVEL 7',
      bal: 'SAVED THIS MONTH',
      tasksLabel: "TODAY'S TASKS",
      t1: 'Take out the trash',
      t2: 'Read for 20 min',
      streak: '7-day streak. Keep it up!',
    },
    trust: {
      label: 'TRUSTED BY FAMILIES',
      items: [
        { icon: 'lock', label: 'Private data' },
        { icon: 'users', label: 'For the whole family' },
        { icon: 'mobile', label: 'iOS & Android' },
        { icon: 'leaf', label: 'No ads' },
      ],
    },
    how: {
      eyebrow: 'HOW IT WORKS',
      title: 'Three steps, zero allowance fights',
      sub: 'From your dashboard you assign, they do the work, you approve. Money only moves once the task is done.',
      steps: [
        {
          tag: 'IN YOUR DASHBOARD',
          title: 'Assign the tasks',
          body: 'From the parent dashboard you create tasks with a value: take out the trash $20, read 20 min +50 XP. One-off or weekly.',
        },
        {
          tag: 'IN THEIR APP',
          title: 'They complete & learn',
          body: 'Your kids mark tasks done and unlock finance quests as they level up.',
        },
        {
          tag: 'YOU APPROVE',
          title: 'They earn & save',
          body: 'Approve with one tap, the money lands in their piggy bank, and the piggy challenges them to save it instead of spending it.',
        },
      ],
    },
    flow: {
      eyebrow: 'FROM CHORE TO SAVINGS',
      title: 'Every task is a money lesson',
      sub: "It's not just paying for chores. Every dollar earned runs past the stoic piggy, who challenges your kids to think before they spend.",
      points: [
        {
          b: 'You set the value.',
          t: 'Wash the car $50, make the bed $10, read a chapter +50 XP.',
        },
        { b: 'They choose.', t: 'They mark a task done and send it for your approval.' },
        {
          b: 'The piggy steps in.',
          t: 'Before an impulse buy, it makes them breathe and decide calmly.',
        },
      ],
      cardLabel: 'ASSIGNED TASK',
      cardTag: 'TO APPROVE',
      taskName: 'Paint the fence',
      taskMeta: 'Assigned to Marco · Saturday',
      coachMsg: '"You earned $50. Save it for your goal, or spend it today? Breathe and decide."',
      goalLabel: 'SAVINGS GOAL',
      goalName: 'New bike',
    },
    feat: { eyebrow: 'ALL IN ONE PLACE', title: 'Built for busy parents' },
    download: {
      eyebrow: 'KIDS APP · ANDROID',
      title: 'Download the app on Android',
      sub: "Your kids' app, straight to their Android phone. Download the file, open it, and allow the install. No store, no cost.",
      cta: 'Download APK',
      ctaSoon: 'Coming soon',
      note: 'Android 8 or newer. Installing outside the Play Store prompts your phone for permission once. iOS: coming soon.',
    },
    features: [
      {
        icon: 'list-ul',
        title: 'Tasks worth real money',
        body: 'Create tasks that pay in cash or XP. One-off, or repeating every week.',
      },
      {
        icon: 'check-circle',
        title: 'One-tap approval',
        body: 'Kids mark it done, you review and release the money. You always have the final word.',
      },
      {
        icon: 'commenting-o',
        title: 'AI mentor',
        body: 'The piggy answers money questions and challenges them not to buy on impulse.',
      },
      {
        icon: 'bank',
        title: 'Savings goals',
        body: 'Each kid sets a goal — a bike, a game — and watches their piggy bank grow.',
      },
      {
        icon: 'bar-chart',
        title: 'Parent reports',
        body: 'See which tasks they finish, how much they save, and how many urges they resist.',
      },
      {
        icon: 'refresh',
        title: 'Auto allowance',
        body: 'Schedule a weekly or monthly deposit and forget about carrying cash.',
      },
    ],
    stoic: {
      eyebrow: 'INSPIRED BY STOIC PHILOSOPHY',
      quote: '"Wealth consists not in having great possessions, but in having few wants."',
      author: '— EPICTETUS',
      body: "Stoic Piggy doesn't reward spending — it rewards self-control. Your kids learn the skill no school teaches: to want less, choose better, and save for what truly matters.",
    },
    testi: {
      eyebrow: 'REAL FAMILIES',
      title: 'Parents who finally breathe easy',
      items: [
        {
          quote:
            'My daughter stopped asking me for money constantly. Now she knows it has to be earned, and she thinks twice before spending it.',
          name: 'Laura M.',
          role: 'Mom of 2 · Monterrey',
          initial: 'L',
          avBg: '#E63946',
        },
        {
          quote:
            'The allowance fights are over. I assign tasks on Sunday and the app handles the rest.',
          name: 'Diego R.',
          role: 'Dad of 3 · Mexico City',
          initial: 'D',
          avBg: '#457B9D',
        },
        {
          quote:
            '"Breathe before you buy" really stuck with my son. At 11 he already has his own savings fund.',
          name: 'Andrea P.',
          role: 'Mom of 1 · Guadalajara',
          initial: 'A',
          avBg: '#1D3557',
        },
      ],
    },
    faq: {
      eyebrow: 'FREQUENTLY ASKED',
      title: 'Questions? We answer them',
      items: [
        {
          q: 'How much does it cost?',
          a: "Free while we're in early access — with unlimited kids. We want families to actually use it.",
        },
        {
          q: 'Is the money real?',
          a: 'You decide. The app tracks the balance and goals; you hand over the real money (cash, transfer, or card) when you approve a task or release savings.',
        },
        {
          q: 'What age is it for?',
          a: 'It works well from 6 to 16. Younger kids focus on tasks and goals; older kids unlock investing and debt quests.',
        },
        {
          q: 'Can my kids spend without me knowing?',
          a: 'No. You approve every task and release every withdrawal. The piggy also makes them pause before any impulse buy.',
        },
        {
          q: 'Is it in English?',
          a: 'Yes, fully bilingual English and Spanish. Switch the language anytime in the app.',
        },
        {
          q: 'Is my data safe?',
          a: "Yes. We don't sell data or show ads. Your family's information is encrypted and yours alone.",
        },
      ],
    },
    footer: {
      title: 'Raise kids who understand money',
      sub: 'Start free today. In 5 minutes you assign your first task and your kid earns their first dollar with purpose.',
      cta1: 'Start free',
      cta2: 'See how it works',
      legal: '© 2026 Stoic Piggy · Made with calm',
      privacy: 'Privacy',
      terms: 'Terms',
    },
  },
};
