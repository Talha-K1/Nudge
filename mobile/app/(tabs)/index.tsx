
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useBriefing } from '@/src/api/hooks';
import { Card } from '@/src/components/Card';
import { PriorityChip } from '@/src/components/PriorityChip';
import { ErrorBanner } from '@/src/components/ErrorBanner';
import { ErrorState } from '@/src/components/ErrorState';
import { EmptyState } from '@/src/components/EmptyState/EmptyState';

import type { Task, Subscription } from '@/src/api/types';

import { formatDue, daysUntil } from '@/src/lib/dates';
import { colors, spacing } from '@/src/theme';

// Expected shape of the daily briefing response.
type Briefing = {
  summary: string;
  overdue: Task[];
  dueToday: Task[];
  upcoming: Task[];
  renewals: Subscription[];
};

function greeting() {
  const h = new Date().getHours();

  return h < 12
    ? 'Good morning'
    : h < 18
      ? 'Good afternoon'
      : 'Good evening';
}

export default function Home() {
  const router = useRouter();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useBriefing();

  // Tell TypeScript the expected briefing response shape.
  const briefing = data as unknown as Briefing | undefined;

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 80 }} />;
  }

  if (!briefing) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  const taskRow = (task: Task) => (
    <Pressable
      key={String(task.id)}
      onPress={() =>
        router.push({
          pathname: '/task/[id]',
          params: { id: String(task.id) },
        })
      }
    >
      <Card>
        <Text style={styles.title}>{task.title}</Text>

        <View style={styles.row}>
          <PriorityChip priority={task.priority} />
          <Text style={styles.muted}>
            {formatDue(task.dueAt)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );

  const section = (label: string, tasks: Task[]) => {
    if (tasks.length === 0) {
      return null;
    }

    return (
      <View>
        <Text style={styles.h}>{label}</Text>
        {tasks.map(taskRow)}
      </View>
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.md }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            void refetch();
          }}
        />
      }
    >
      <Text style={styles.greet}>{greeting()}</Text>

      <Text style={styles.summary}>
        {briefing.summary}
      </Text>

      {section('Overdue', briefing.overdue)}
      {section('Due today', briefing.dueToday)}
      {section('Coming up', briefing.upcoming)}

      {briefing.renewals.length > 0 && (
        <View>
          <Text style={styles.h}>Renewals soon</Text>

          {briefing.renewals.map((subscription) => (
            <Card key={String(subscription.id)}>
              <Text style={styles.title}>
                {subscription.merchant}
              </Text>

              <Text style={styles.muted}>
                {subscription.currency}{' '}
                {subscription.amount.toFixed(2)}
                {' · in '}
                {daysUntil(subscription.nextChargeDate)} days
              </Text>
            </Card>
          ))}
        </View>
      )}

      {!briefing.overdue.length &&
        !briefing.dueToday.length &&
        !briefing.upcoming.length &&
        !briefing.renewals.length && (
          <EmptyState
            title="All clear"
            subtitle="Nothing needs your attention."
          />
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  greet: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  summary: {
    color: colors.muted,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  h: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  muted: {
    color: colors.muted,
  },
});
