import { Pressable, Text, View, StyleSheet } from 'react-native';
import { EmptyState } from './EmptyState/EmptyState';
import { colors, spacing } from '../theme';

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.wrap}>
      <EmptyState
        icon="cloud-offline-outline"
        title="Can't reach the server"
        subtitle="Check your connection and try again."
      />
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});