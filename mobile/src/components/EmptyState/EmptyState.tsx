import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

export function EmptyState({ icon = 'checkmark-circle-outline', title, subtitle }:
  { icon?: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={48} color={colors.muted} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: spacing.lg * 2 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  sub: { color: colors.muted, marginTop: spacing.xs, textAlign: 'center' },
});