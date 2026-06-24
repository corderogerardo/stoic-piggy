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

export interface DashboardGoal {
  title: string;
  targetCents: number;
  savedCents: number;
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
  goal?: DashboardGoal;
}
