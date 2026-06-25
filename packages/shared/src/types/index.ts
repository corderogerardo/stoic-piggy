export type ID = string;
export type ISODateString = string;

export type UserRole = 'parent' | 'child' | 'admin';

// ---- Auth ----

export type AuthRole = 'parent' | 'child';

/** The authenticated parent, as returned to clients (never includes the hash). */
export interface AuthParent {
  role: 'parent';
  id: ID;
  email: string;
  displayName: string;
  /** ISO timestamp of email verification, or null if still unverified (soft-gated). */
  emailVerifiedAt: ISODateString | null;
}

/** The authenticated kid, as returned to clients. */
export interface AuthChild {
  role: 'child';
  id: ID;
  parentId: ID;
  username: string;
  displayName: string;
}

export type AuthUser = AuthParent | AuthChild;

/** Result of register / login: a bearer token plus the resolved user. */
export interface AuthSession {
  token: string;
  user: AuthUser;
}

/** The kid's home payload after sign-in (aggregated balance + goal + quests). */
export interface ChildHome {
  child: AuthChild & { level: number; xp: number; avatarUrl?: string };
  balanceCents: number;
  goal?: DashboardGoal;
  quests: Quest[];
}

export interface BaseEntity {
  id: ID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Parent extends BaseEntity {
  email: string;
  displayName: string;
  childIds: ID[];
}

export interface Child extends BaseEntity {
  parentId: ID;
  displayName: string;
  avatarUrl?: string;
  level: number;
  xp: number;
}

export interface PiggyBank extends BaseEntity {
  childId: ID;
  name: string;
  balanceCents: number;
  currency: string;
}

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'allowance'
  | 'reward'
  | 'goal_contribution';

export interface Transaction extends BaseEntity {
  piggyBankId: ID;
  type: TransactionType;
  amountCents: number;
  note?: string;
}

export interface SavingsGoal extends BaseEntity {
  childId: ID;
  title: string;
  targetCents: number;
  savedCents: number;
  achievedAt?: ISODateString;
}

export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'claimed';

export interface Quest extends BaseEntity {
  childId: ID;
  title: string;
  description: string;
  rewardXp: number;
  rewardCents: number;
  status: QuestStatus;
}

export type TaskCategory = 'chore' | 'lesson';
export type TaskPayType = 'money' | 'xp' | 'both';
export type TaskRecurrence = 'once' | 'daily' | 'weekly';
/** active → kid submits → submitted → parent approves/rejects. */
export type TaskStatus = 'active' | 'submitted' | 'approved' | 'rejected';

/** A parent-assigned chore/lesson with an approval + pay loop (distinct from Quest). */
export interface Task extends BaseEntity {
  childId: ID;
  title: string;
  category: TaskCategory;
  payType: TaskPayType;
  amountCents: number;
  rewardXp: number;
  recurrence: TaskRecurrence;
  status: TaskStatus;
  note?: string;
  submittedAt?: ISODateString;
  resolvedAt?: ISODateString;
}

export interface DashboardGoal {
  title: string;
  targetCents: number;
  savedCents: number;
}

export type PayoutMethod = 'card' | 'bank' | 'cash';

/** Parent preferences shown on the Settings page. */
export interface ParentSettings {
  notifyEnabled: boolean;
  weeklyReportEnabled: boolean;
  autoApproveTasks: boolean;
  payoutMethod: PayoutMethod;
}

/** Aggregates for the parents Reports page. */
export interface ReportsData {
  /** Approved tasks per day for the last 7 days (oldest → newest). */
  tasksByDay: number[];
  tasksCompletedThisWeek: number;
  paidThisMonthCents: number;
  savedCents: number;
  activeKids: number;
}

/** Headline numbers for the parents dashboard overview. */
export interface ParentSummary {
  toApproveCount: number;
  activeTaskCount: number;
  savedCents: number;
  /** Sum of reward + allowance deposits across the parent's kids, this calendar month. */
  paidThisMonthCents: number;
}

export type ActivityKind =
  | 'task_created'
  | 'task_submitted'
  | 'task_approved'
  | 'task_rejected'
  | TransactionType;

/** One derived event for the parents activity feed (from tasks + transactions). */
export interface ActivityEvent {
  id: ID;
  kind: ActivityKind;
  childId: ID;
  title: string;
  amountCents?: number;
  createdAt: ISODateString;
}

/** Aggregated per-child snapshot for the parents dashboard (one row per kid). */
export interface DashboardChild {
  id: ID;
  displayName: string;
  avatarUrl?: string;
  age?: number;
  level: number;
  xp: number;
  balanceCents: number;
  allowanceCents: number;
  autopayEnabled: boolean;
  /** False when the parent has deactivated the kid (login blocked, shown dimmed). */
  active: boolean;
  goal?: DashboardGoal;
}
