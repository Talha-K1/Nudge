
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import Constants from 'expo-constants';

import { useAuth } from '@/src/auth/AuthContext';
import { colors, spacing } from '@/src/theme';

export default function Settings() {
  const { signOut } = useAuth();

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.label}>App version</Text>
        <Text style={styles.value}>{version}</Text>
      </View>

      <Pressable
        style={styles.logout}
        onPress={signOut}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },

  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  label: {
    fontSize: 14,
    color: colors.muted,
  },

  value: {
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.xs,
  },

  logout: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },

  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
