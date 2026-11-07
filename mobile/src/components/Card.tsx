import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, spacing } from '../theme';

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: 12, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
});