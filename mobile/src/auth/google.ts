
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { BASE_URL, TOKEN_KEY } from '../api/client';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle(): Promise<boolean> {
  const redirectUrl = 'nudge://auth';

  const result = await WebBrowser.openAuthSessionAsync(
    `${BASE_URL}/api/auth/google/start`,
    redirectUrl
  );

  if (result.type !== 'success') {
    return false;
  }

  const parsed = Linking.parse(result.url);
  const token = parsed.queryParams?.token;

  if (typeof token !== 'string') {
    throw new Error('Google login did not return an authentication token.');
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);

  return true;
}

export async function signOut(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
