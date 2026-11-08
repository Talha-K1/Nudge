
import type { Subscription, Task } from './types';
import { daysUntil } from '../lib/dates';

const at = (n: number, h = 17) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

const dateOnly = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const db: {
  tasks: Task[];
  subscriptions: Subscription[];
} = {
  tasks: [
    {
      id: 1,
      title: 'Pay hydro bill',
      description: 'Invoice #4471, $86.20',
      dueAt: at(0),
      priority: 'HIGH',
      status: 'TODO',
      sourceEmailId: 101,
    },
    {
      id: 2,
      title: 'Submit CMPT assignment 3',
      dueAt: at(3),
      priority: 'HIGH',
      status: 'TODO',
    },
    {
      id: 3,
      title: 'Reply to landlord about lease',
      dueAt: at(1),
      priority: 'MEDIUM',
      status: 'TODO',
    },
    {
      id: 4,
      title: 'Book dentist appointment',
      dueAt: at(6),
      priority: 'LOW',
      status: 'TODO',
    },
    {
      id: 5,
      title: 'Send receipt to accounting',
      dueAt: at(-2),
      priority: 'MEDIUM',
      status: 'TODO',
    },
    {
      id: 6,
      title: 'Renew passport',
      dueAt: at(20),
      priority: 'MEDIUM',
      status: 'DONE',
    },
  ],

  subscriptions: [
    {
      id: 101,
      merchant: 'Netflix',
      amount: 16.49,
      currency: 'CAD',
      billingCycle: 'MONTHLY',
      nextChargeDate: dateOnly(4),
      status: 'ACTIVE',
    },
    {
      id: 102,
      merchant: 'Spotify',
      amount: 11.99,
      currency: 'CAD',
      billingCycle: 'MONTHLY',
      nextChargeDate: dateOnly(11),
      status: 'ACTIVE',
    },
    {
      id: 103,
      merchant: 'Adobe CC',
      amount: 719.88,
      currency: 'CAD',
      billingCycle: 'YEARLY',
      nextChargeDate: dateOnly(30),
      status: 'ACTIVE',
    },
    {
      id: 104,
      merchant: 'Gym',
      amount: 12,
      currency: 'CAD',
      billingCycle: 'WEEKLY',
      nextChargeDate: dateOnly(2),
      status: 'ACTIVE',
    },
  ],
};

// Used to give mock responses a small network-like delay.
export function mock<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const copy =
        value === undefined
          ? value
          : JSON.parse(JSON.stringify(value)) as T;

      resolve(copy);
    }, ms);
  });
}

// Temporary placeholder until Student B confirms
// the exact dashboard briefing response.
export function buildBriefing(): null {
  return null;
}

// Find a task in the mock database.
export function findMockTask(id: number): Task {
  const task = db.tasks.find((t) => t.id === id);

  if (!task) {
    throw new Error(`Task ${id} was not found.`);
  }

  return task;
}

// Find a subscription in the mock database.
export function findMockSubscription(id: number): Subscription {
  const subscription = db.subscriptions.find(
    (s) => s.id === id
  );

  if (!subscription) {
    throw new Error(`Subscription ${id} was not found.`);
  }

  return subscription;
}

// Helpers for mock dashboard calculations once
// the briefing response contract is confirmed.
export function getOverdueTasks(): Task[] {
  return db.tasks.filter(
    (t) =>
      t.status !== 'DONE' &&
      !t.parentTaskId &&
      t.dueAt &&
      daysUntil(t.dueAt) < 0
  );
}
