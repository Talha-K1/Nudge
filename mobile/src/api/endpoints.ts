
import { api, USE_MOCK } from './client';

import {
  db,
  mock,
  findMockTask,
  findMockSubscription,
  buildBriefing,
} from './mocks';

import type {
  Briefing,
  Id,
  NewTask,
  Subscription,
  Task,
} from './types';

let nextMockTaskId = 7;

export const getBriefing = (): Promise<Briefing> =>
  USE_MOCK
    ? mock(buildBriefing())
    : api<Briefing>('/dashboard/briefing');

export const getTasks = (): Promise<Task[]> =>
  USE_MOCK
    ? mock(db.tasks)
    : api<Task[]>('/tasks');

export const createTask = (
  input: NewTask
): Promise<Task> => {
  if (!USE_MOCK) {
    return api<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  const task: Task = {
    id: nextMockTaskId++,
    title: input.title,
    description: input.description ?? null,
    dueAt: input.dueAt ?? null,
    priority: input.priority ?? 'MEDIUM',
    status: 'TODO',
  };

  db.tasks.unshift(task);

  return mock(task);
};

export const updateTask = (
  id: Id,
  patch: Partial<Task>
): Promise<Task> => {
  if (!USE_MOCK) {
    return api<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  }

  const task = findMockTask(id);

  Object.assign(task, patch);

  return mock(task);
};

export const deleteTask = (
  id: Id
): Promise<void> => {
  if (!USE_MOCK) {
    return api<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  const index = db.tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    throw new Error(`Task ${id} was not found.`);
  }

  db.tasks.splice(index, 1);

  return mock(undefined);
};

export const breakdownTask = (
  id: Id
): Promise<unknown> => {
  if (!USE_MOCK) {
    return api<unknown>(`/tasks/${id}/breakdown`, {
      method: 'POST',
    });
  }

  const parent = findMockTask(id);

  const subtasks = [
    'Gather what you need',
    'Do the main work',
    'Review and submit',
  ];

  subtasks.forEach((title) => {
    db.tasks.push({
      id: nextMockTaskId++,
      title,
      priority: parent.priority,
      status: 'TODO',
      parentTaskId: parent.id,
      dueAt: parent.dueAt,
    });
  });

  return mock(null);
};

export const getSubscriptions = (): Promise<Subscription[]> =>
  USE_MOCK
    ? mock(db.subscriptions)
    : api<Subscription[]>('/subscriptions');

export const updateSubscription = (
  id: Id,
  patch: Partial<Subscription>
): Promise<Subscription> => {
  if (!USE_MOCK) {
    return api<Subscription>(`/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  }

  const subscription = findMockSubscription(id);

  Object.assign(subscription, patch);

  return mock(subscription);
};

export const registerDevice = (
  expoPushToken: string
): Promise<void> => {
  if (!USE_MOCK) {
    return api<void>('/devices', {
      method: 'POST',
      body: JSON.stringify({ expoPushToken }),
    });
  }

  return mock(undefined, 0);
};

// Included in the shared API contract.
export const syncEmails = (): Promise<unknown> => {
  if (!USE_MOCK) {
    return api<unknown>('/emails/sync', {
      method: 'POST',
    });
  }

  return mock(null);
};
