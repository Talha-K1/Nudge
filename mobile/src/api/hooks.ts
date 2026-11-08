
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import * as e from './endpoints';

import type {
  Id,
  NewTask,
  Subscription,
  Task,
} from './types';

export const useBriefing = () =>
  useQuery({
    queryKey: ['briefing'],
    queryFn: e.getBriefing,
  });

export const useTasks = () =>
  useQuery({
    queryKey: ['tasks'],
    queryFn: e.getTasks,
  });

export const useSubscriptions = () =>
  useQuery({
    queryKey: ['subscriptions'],
    queryFn: e.getSubscriptions,
  });

function useRefreshAll() {
  const qc = useQueryClient();

  return async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['tasks'] }),
      qc.invalidateQueries({ queryKey: ['briefing'] }),
      qc.invalidateQueries({ queryKey: ['subscriptions'] }),
    ]);
  };
}

export function useUpdateTask() {
  const refresh = useRefreshAll();

  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: Id;
      patch: Partial<Task>;
    }) => e.updateTask(id, patch),

    onSuccess: refresh,
  });
}

export function useCreateTask() {
  const refresh = useRefreshAll();

  return useMutation({
    mutationFn: (input: NewTask) =>
      e.createTask(input),

    onSuccess: refresh,
  });
}

export function useDeleteTask() {
  const refresh = useRefreshAll();

  return useMutation({
    mutationFn: (id: Id) => e.deleteTask(id),

    onSuccess: refresh,
  });
}

export function useBreakdown() {
  const refresh = useRefreshAll();

  return useMutation({
    mutationFn: (id: Id) =>
      e.breakdownTask(id),

    onSuccess: refresh,
  });
}

export function useUpdateSubscription() {
  const refresh = useRefreshAll();

  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: Id;
      patch: Partial<Subscription>;
    }) => e.updateSubscription(id, patch),

    onSuccess: refresh,
  });
}
