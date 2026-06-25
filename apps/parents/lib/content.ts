// Parents dashboard — bilingual strings + seed data, ported from the handoff.
export type Lang = 'es' | 'en';
export type View = 'overview' | 'tasks' | 'approvals' | 'kids' | 'reports' | 'settings';

export interface Kid {
  id: string;
  name: string;
  age: number;
  lvl: number;
  balance: number;
  streak: number;
  resisted: number;
  tasksDone: number;
  color: string;
  initial: string;
  goalEs: string;
  goalEn: string;
  goalTarget: number;
  allowance: number;
  autopay: boolean;
}

export interface DashStrings {
  parentTag: string;
  parentRole: string;
  newTask: string;
  yourKids: string;
  manage: string;
  balance: string;
  tasksDone: string;
  resisted: string;
  pendingApproval: string;
  activity: string;
  allClear: string;
  allClearSub: string;
  colTask: string;
  colKid: string;
  colRecur: string;
  colReward: string;
  colStatus: string;
  sendBack: string;
  everyWeek: string;
  streakWord: string;
  savingsGoal: string;
  autoAllowance: string;
  tasksThisWeek: string;
  tasksThisWeekSub: string;
  impulseTitle: string;
  impulseSub: string;
  impulseSaved: string;
  payoutTitle: string;
  payoutSub: string;
  prefsTitle: string;
  modalEyebrow: string;
  taskNameLabel: string;
  taskNamePh: string;
  categoryLabel: string;
  iconLabel: string;
  payTypeLabel: string;
  amountLabel: string;
  xpLabel: string;
  assignLabel: string;
  recurLabel: string;
  summaryLabel: string;
  stepTitles: [string, string, string];
  cats: { id: 'chore' | 'lesson'; icon: string; title: string; desc: string }[];
  pays: { id: 'money' | 'xp' | 'both'; label: string }[];
  recurs: { id: 'once' | 'daily' | 'weekly'; icon: string; label: string }[];
  back: string;
  next: string;
  create: string;
  recurLabels: Record<'once' | 'daily' | 'weekly', string>;
  catLabels: Record<'chore' | 'lesson', string>;
  statusActive: string;
  approve: string;
  approveXp: string;
  payouts: { id: string; icon: string; title: string; desc: string }[];
  prefsList: { id: 'notify' | 'weekly' | 'autoApprove'; title: string; desc: string }[];
  reportStats: { t: string; v: string; d: string }[];
  days: string[];
  navLabel: Record<View, string>;
  titles: Record<View, [string, string]>;
  statTitle: Record<'toApprove' | 'paid' | 'saved' | 'active', string>;
  filters: { id: 'all' | 'chore' | 'lesson'; label: string }[];
  ageLabel: (age: number) => string;
  levelWord: string;
}

export const STR: Record<Lang, DashStrings> = {
  es: {
    parentTag: 'PADRES',
    parentRole: 'Cuenta familiar',
    newTask: 'Nueva tarea',
    yourKids: 'Tus hijos',
    manage: 'Gestionar',
    balance: 'AHORRADO',
    tasksDone: 'TAREAS',
    resisted: 'RESISTIDOS',
    pendingApproval: 'Por aprobar',
    activity: 'Actividad reciente',
    allClear: 'Todo al día',
    allClearSub: 'No hay tareas pendientes de aprobar.',
    colTask: 'TAREA',
    colKid: 'ASIGNADA A',
    colRecur: 'FRECUENCIA',
    colReward: 'PREMIO',
    colStatus: 'ESTADO',
    sendBack: 'Devolver',
    everyWeek: 'Cada semana',
    streakWord: 'de racha',
    savingsGoal: 'META DE AHORRO',
    autoAllowance: 'MESADA AUTOMÁTICA',
    tasksThisWeek: 'Tareas completadas',
    tasksThisWeekSub: 'Esta semana, por día',
    impulseTitle: 'Impulsos resistidos',
    impulseSub: 'Lo que tus hijos decidieron NO gastar, gracias a la cochinita.',
    impulseSaved: 'ahorrado en impulsos este año',
    payoutTitle: 'Cómo se paga',
    payoutSub: 'Elige cómo entregas el dinero cuando apruebas una tarea o liberas un ahorro.',
    prefsTitle: 'Preferencias',
    modalEyebrow: 'NUEVA TAREA',
    taskNameLabel: 'NOMBRE DE LA TAREA',
    taskNamePh: 'Ej. Sacar la basura',
    categoryLabel: 'TIPO',
    iconLabel: 'ÍCONO',
    payTypeLabel: '¿CÓMO SE PAGA?',
    amountLabel: 'CANTIDAD',
    xpLabel: 'EXPERIENCIA',
    assignLabel: 'ASIGNAR A',
    recurLabel: 'FRECUENCIA',
    summaryLabel: 'RESUMEN',
    stepTitles: ['¿Qué hay que hacer?', '¿Cuánto vale?', '¿Para quién y cuándo?'],
    cats: [
      { id: 'chore', icon: 'home', title: 'Tarea del hogar', desc: 'Paga en dinero' },
      { id: 'lesson', icon: 'graduation-cap', title: 'Lección', desc: 'Da experiencia' },
    ],
    pays: [
      { id: 'money', label: 'Dinero' },
      { id: 'xp', label: 'Experiencia' },
      { id: 'both', label: 'Ambos' },
    ],
    recurs: [
      { id: 'once', icon: 'calendar-o', label: 'Una vez' },
      { id: 'daily', icon: 'sun-o', label: 'Diario' },
      { id: 'weekly', icon: 'refresh', label: 'Semanal' },
    ],
    back: 'Atrás',
    next: 'Siguiente',
    create: 'Crear tarea',
    recurLabels: { once: 'Una vez', daily: 'Diario', weekly: 'Semanal' },
    catLabels: { chore: 'Tarea del hogar', lesson: 'Lección' },
    statusActive: 'ACTIVA',
    approve: 'Aprobar y pagar',
    approveXp: 'Aprobar',
    payouts: [
      { id: 'card', icon: 'credit-card', title: 'Tarjeta vinculada', desc: 'Visa ···· 4821' },
      { id: 'transfer', icon: 'bank', title: 'Transferencia', desc: 'A la cuenta de tu hijo' },
      { id: 'cash', icon: 'money', title: 'Efectivo', desc: 'Tú entregas a mano' },
    ],
    prefsList: [
      { id: 'notify', title: 'Notificaciones', desc: 'Avísame cuando haya algo por aprobar' },
      { id: 'weekly', title: 'Resumen semanal', desc: 'Recibe un reporte cada domingo' },
      {
        id: 'autoApprove',
        title: 'Aprobar lecciones solas',
        desc: 'Las misiones de finanzas se aprueban automático',
      },
    ],
    reportStats: [
      { t: 'TAREAS / SEMANA', v: '27', d: '+18%' },
      { t: 'AHORRO TOTAL', v: '$2,340', d: '+12%' },
      { t: 'IMPULSOS RESISTIDOS', v: '17', d: '+5' },
      { t: 'NIVEL PROMEDIO', v: '5.5', d: '+1' },
    ],
    days: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    navLabel: {
      overview: 'Inicio',
      tasks: 'Tareas',
      approvals: 'Aprobaciones',
      kids: 'Hijos',
      reports: 'Reportes',
      settings: 'Ajustes',
    },
    titles: {
      overview: ['Inicio', 'Aquí está tu familia de un vistazo'],
      tasks: ['Tareas', 'Crea y asigna tareas para tus hijos'],
      approvals: ['Aprobaciones', 'Revisa y libera el dinero ganado'],
      kids: ['Hijos', 'Saldos, metas y mesada de cada hijo'],
      reports: ['Reportes', 'Cómo va tu familia con el dinero'],
      settings: ['Ajustes', 'Pagos y preferencias de la cuenta'],
    },
    statTitle: {
      toApprove: 'POR APROBAR',
      paid: 'PAGADO',
      saved: 'AHORRADO',
      active: 'TAREAS ACTIVAS',
    },
    filters: [
      { id: 'all', label: 'Todas' },
      { id: 'chore', label: 'Hogar' },
      { id: 'lesson', label: 'Lecciones' },
    ],
    ageLabel: (age) => `${age} años`,
    levelWord: 'Nivel',
  },
  en: {
    parentTag: 'PARENTS',
    parentRole: 'Family account',
    newTask: 'New task',
    yourKids: 'Your kids',
    manage: 'Manage',
    balance: 'SAVED',
    tasksDone: 'TASKS',
    resisted: 'RESISTED',
    pendingApproval: 'To approve',
    activity: 'Recent activity',
    allClear: 'All caught up',
    allClearSub: 'No tasks waiting for approval.',
    colTask: 'TASK',
    colKid: 'ASSIGNED TO',
    colRecur: 'FREQUENCY',
    colReward: 'REWARD',
    colStatus: 'STATUS',
    sendBack: 'Send back',
    everyWeek: 'Every week',
    streakWord: 'streak',
    savingsGoal: 'SAVINGS GOAL',
    autoAllowance: 'AUTO ALLOWANCE',
    tasksThisWeek: 'Tasks completed',
    tasksThisWeekSub: 'This week, by day',
    impulseTitle: 'Impulses resisted',
    impulseSub: 'What your kids chose NOT to spend, thanks to the piggy.',
    impulseSaved: 'saved from impulses this year',
    payoutTitle: 'How payouts work',
    payoutSub: 'Choose how you hand over money when you approve a task or release savings.',
    prefsTitle: 'Preferences',
    modalEyebrow: 'NEW TASK',
    taskNameLabel: 'TASK NAME',
    taskNamePh: 'e.g. Take out the trash',
    categoryLabel: 'TYPE',
    iconLabel: 'ICON',
    payTypeLabel: 'HOW DOES IT PAY?',
    amountLabel: 'AMOUNT',
    xpLabel: 'EXPERIENCE',
    assignLabel: 'ASSIGN TO',
    recurLabel: 'FREQUENCY',
    summaryLabel: 'SUMMARY',
    stepTitles: ['What needs doing?', 'What is it worth?', 'For who and when?'],
    cats: [
      { id: 'chore', icon: 'home', title: 'Household chore', desc: 'Pays in money' },
      { id: 'lesson', icon: 'graduation-cap', title: 'Lesson', desc: 'Gives XP' },
    ],
    pays: [
      { id: 'money', label: 'Money' },
      { id: 'xp', label: 'XP' },
      { id: 'both', label: 'Both' },
    ],
    recurs: [
      { id: 'once', icon: 'calendar-o', label: 'Once' },
      { id: 'daily', icon: 'sun-o', label: 'Daily' },
      { id: 'weekly', icon: 'refresh', label: 'Weekly' },
    ],
    back: 'Back',
    next: 'Next',
    create: 'Create task',
    recurLabels: { once: 'Once', daily: 'Daily', weekly: 'Weekly' },
    catLabels: { chore: 'Household chore', lesson: 'Lesson' },
    statusActive: 'ACTIVE',
    approve: 'Approve & pay',
    approveXp: 'Approve',
    payouts: [
      { id: 'card', icon: 'credit-card', title: 'Linked card', desc: 'Visa ···· 4821' },
      { id: 'transfer', icon: 'bank', title: 'Bank transfer', desc: "To your kid's account" },
      { id: 'cash', icon: 'money', title: 'Cash', desc: 'You hand it over' },
    ],
    prefsList: [
      { id: 'notify', title: 'Notifications', desc: 'Tell me when something needs approval' },
      { id: 'weekly', title: 'Weekly summary', desc: 'Get a report every Sunday' },
      {
        id: 'autoApprove',
        title: 'Auto-approve lessons',
        desc: 'Finance quests get approved automatically',
      },
    ],
    reportStats: [
      { t: 'TASKS / WEEK', v: '27', d: '+18%' },
      { t: 'TOTAL SAVED', v: '$2,340', d: '+12%' },
      { t: 'IMPULSES RESISTED', v: '17', d: '+5' },
      { t: 'AVG LEVEL', v: '5.5', d: '+1' },
    ],
    days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    navLabel: {
      overview: 'Overview',
      tasks: 'Tasks',
      approvals: 'Approvals',
      kids: 'Kids',
      reports: 'Reports',
      settings: 'Settings',
    },
    titles: {
      overview: ['Overview', "Here's your family at a glance"],
      tasks: ['Tasks', 'Create and assign tasks for your kids'],
      approvals: ['Approvals', 'Review and release earned money'],
      kids: ['Kids', "Each kid's balance, goals and allowance"],
      reports: ['Reports', 'How your family is doing with money'],
      settings: ['Settings', 'Account payouts and preferences'],
    },
    statTitle: { toApprove: 'TO APPROVE', paid: 'PAID', saved: 'SAVED', active: 'ACTIVE TASKS' },
    filters: [
      { id: 'all', label: 'All' },
      { id: 'chore', label: 'Chores' },
      { id: 'lesson', label: 'Lessons' },
    ],
    ageLabel: (age) => `Age ${age}`,
    levelWord: 'Level',
  },
};
