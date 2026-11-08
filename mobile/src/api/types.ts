
import type { Priority } from '../theme';

export type Id = number;

export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'SNOOZED';

export type BillingCycle =
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY';

export interface Email {
  id: Id;
  subject: string;
  sender: string;
  receivedAt: string;
  snippet: string;
}

export interface Task {
  id: Id;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  priority: Priority;
  status: TaskStatus;
  sourceEmailId?: Id | null;
  parentTaskId?: Id | null;
}

export type NewTask = Pick<Task, 'title'> &
  Partial<
    Pick<Task, 'description' | 'dueAt' | 'priority'>
  >;

export interface Subscription {
  id: Id;
  merchant: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  nextChargeDate: string;
  status: 'ACTIVE' | 'CANCELLED';
  sourceEmailId?: Id | null;
}

// Backend response shape is not finalized yet.
export type Briefing = unknown;
