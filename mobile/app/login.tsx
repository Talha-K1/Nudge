
import { useState } from 'react';

import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { useAuth } from '@/src/auth/AuthContext';
import { BASE_URL, USE_MOCK } from '@/src/api/client';
import { loginDemo } from '@/src/api/endpoints';
import { colors, spacing } from '@/src/theme';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);

  async function google() {
    if (USE_MOCK) {
        return demo();
    }
    setBusy(true);

    try {
      // Expo Go needs its own redirect URL.
      const redirect = Linking.createURL('auth');

      const url =
        `${BASE_URL}/api/auth/google/start` +
        `?redirect=${encodeURIComponent(redirect)}`;

      const result = await WebBrowser.openAuthSessionAsync(
        url,
        redirect
      );

      if (result.type !== 'success') {
        return;
      }

      const parsed = Linking.parse(result.url);
      const token = parsed.queryParams?.token;

      if (typeof token !== 'string') {
        Alert.alert('Login failed', 'No token was returned.');
        return;
      }

      await signIn(token);
    } catch (error) {
      Alert.alert('Login failed', String(error));
    } finally {
      setBusy(false);
    }
  }

  async function demo() {
    setBusy(true);

    try {
      const { token } = await loginDemo();
      await signIn(token);
    } catch (error) {
      Alert.alert('Could not start demo', String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.logo}>Nudge</Text>

      <Text style={styles.tag}>
        Never miss a deadline or a renewal.
      </Text>

      {busy ? (
        <ActivityIndicator
          size="large"
          style={{ marginTop: spacing.lg }}
        />
      ) : (
        <>
          <Pressable
            style={styles.primary}
            onPress={google}
          >
            <Text style={styles.primaryText}>
              Continue with Google
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondary}
            onPress={demo}
          >
            <Text style={styles.secondaryText}>
              Try demo
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },

  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
  },

  tag: {
    color: colors.muted,
    marginBottom: spacing.lg * 2,
    marginTop: spacing.sm,
  },

  primary: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },

  secondary: {
    padding: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  secondaryText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
