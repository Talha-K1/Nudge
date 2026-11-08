
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useSubscriptions,
  useUpdateSubscription,
} from '@/src/api/hooks';

import type { Subscription } from '@/src/api/types';

import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState/EmptyState';
import { colors, spacing } from '@/src/theme';

// Convert each subscription amount to its monthly equivalent.
const monthly = (s: Subscription) =>
  s.billingCycle === 'MONTHLY'
    ? s.amount
    : s.billingCycle === 'YEARLY'
      ? s.amount / 12
      : (s.amount * 52) / 12;

// Calculate the number of days until a subscription renews.
function getDaysUntil(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renewalDate = new Date(date);
  renewalDate.setHours(0, 0, 0, 0);

  return Math.ceil(
    (renewalDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatCycle(cycle: string): string {
  switch (cycle) {
    case 'MONTHLY':
      return 'month';
    case 'YEARLY':
      return 'year';
    case 'WEEKLY':
      return 'week';
    default:
      return cycle.toLowerCase();
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SubscriptionsScreen() {
  const {
    data = [],
    isLoading,
    refetch,
    isRefetching,
  } = useSubscriptions();

  const updateSubscription = useUpdateSubscription();

  // Only active subscriptions count toward the totals.
  const active = data.filter(
    (subscription) => subscription.status === 'ACTIVE'
  );

  const monthlyTotal = active.reduce(
    (sum, subscription) => sum + monthly(subscription),
    0
  );

  const yearlyTotal = monthlyTotal * 12;

  // Use the first subscription's currency for the totals.
  const currency = data[0]?.currency ?? 'CAD';

  // Active subscriptions first, then cancelled subscriptions.
  // Within each group, sort by next charge date.
  const sortedSubscriptions = useMemo(() => {
    return [...data].sort((a, b) => {
      const aActive = a.status === 'ACTIVE';
      const bActive = b.status === 'ACTIVE';

      if (aActive !== bActive) {
        return aActive ? -1 : 1;
      }

      const aDate = a.nextChargeDate
        ? new Date(a.nextChargeDate).getTime()
        : Infinity;

      const bDate = b.nextChargeDate
        ? new Date(b.nextChargeDate).getTime()
        : Infinity;

      return aDate - bDate;
    });
  }, [data]);

  function confirmCancel(subscription: Subscription) {
    Alert.alert(
      'Cancel subscription?',
      `Are you sure you want to mark ${subscription.merchant} as cancelled?`,
      [
        {
          text: 'Keep subscription',
          style: 'cancel',
        },
        {
          text: 'Cancel subscription',
          style: 'destructive',
          onPress: () => {
            updateSubscription.mutate({
              id: subscription.id,
              patch: {
                status: 'CANCELLED',
              },
            });
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={async () => {
  await refetch();
}}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Subscriptions</Text>
        <Text style={styles.subtitle}>
          Keep track of your recurring payments.
        </Text>
      </View>

      {/* Monthly and yearly totals */}
      <Card>
        <Text style={styles.totalLabel}>Monthly spending</Text>

        <Text style={styles.monthlyTotal}>
          {formatCurrency(monthlyTotal, currency)}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.totalLabel}>Yearly spending</Text>

        <Text style={styles.yearlyTotal}>
          {formatCurrency(yearlyTotal, currency)}
        </Text>

        <Text style={styles.totalCaption}>
          Based on {active.length} active{' '}
          {active.length === 1 ? 'subscription' : 'subscriptions'}
        </Text>
      </Card>

      {/* Subscription list */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Your subscriptions</Text>

        <Text style={styles.count}>
          {data.length} total
        </Text>
      </View>

      {data.length === 0 ? (
        <EmptyState
          title="No subscriptions yet"
        />
      ) : (
        sortedSubscriptions.map((subscription) => {
          const isCancelled =
            subscription.status === 'CANCELLED';

          const daysUntil = subscription.nextChargeDate
            ? getDaysUntil(subscription.nextChargeDate)
            : null;

          let badgeText = 'No renewal date';
          let badgeColor = '#8A8A8A';
          let badgeBackground = '#EEEEEE';

          if (isCancelled) {
            badgeText = 'Cancelled';
          } else if (daysUntil !== null) {
            badgeText =
              daysUntil < 0
                ? `Overdue by ${Math.abs(daysUntil)} days`
                : daysUntil === 0
                  ? 'Renews today'
                  : `Renews in ${daysUntil} days`;

            if (daysUntil <= 3) {
              badgeColor = '#C62828';
              badgeBackground = '#FDECEC';
            } else if (daysUntil <= 7) {
              badgeColor = '#B76E00';
              badgeBackground = '#FFF3DC';
            }
          }

          return (
            <Card key={subscription.id}>
              <View style={styles.subscriptionTop}>
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.merchant}>
                    {subscription.merchant}
                  </Text>

                  <Text style={styles.amount}>
                    {formatCurrency(
                      subscription.amount,
                      subscription.currency
                    )}{' '}
                    / {formatCycle(subscription.billingCycle)}
                  </Text>

                  {subscription.nextChargeDate ? (
                    <Text style={styles.date}>
                      Next charge: {formatDate(subscription.nextChargeDate)}
                    </Text>
                  ) : null}
                </View>

                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badgeBackground },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: badgeColor },
                    ]}
                  >
                    {badgeText}
                  </Text>
                </View>
              </View>

              {!isCancelled && (
                <Pressable
                  onPress={() => confirmCancel(subscription)}
                  disabled={updateSubscription.isPending}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>
                    Mark as cancelled
                  </Text>
                </Pressable>
              )}
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '500',
  },
  monthlyTotal: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  yearlyTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  totalCaption: {
    fontSize: 12,
    color: colors.muted,
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  count: {
    fontSize: 13,
    color: colors.muted,
  },
  subscriptionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  subscriptionInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  merchant: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  amount: {
    fontSize: 14,
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.muted,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.high,
    textAlign: 'center',
  },
});
