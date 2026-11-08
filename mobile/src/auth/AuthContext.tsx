
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import * as SecureStore from 'expo-secure-store';

import {
  TOKEN_KEY,
  setUnauthorizedHandler,
} from '../api/client';

import { queryClient } from '../api/queryClient';

type AuthContextType = {
  token: string | null;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the saved token when the app opens.
  useEffect(() => {
    async function restoreToken() {
      try {
        const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        setToken(savedToken);
      } catch (error) {
        console.error('Could not restore login:', error);
      } finally {
        setLoading(false);
      }
    }

    restoreToken();
  }, []);

  // Save the token after a successful login.
  const signIn = useCallback(async (newToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  // Remove the token and clear cached user data.
  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    queryClient.clear();
    setToken(null);
  }, []);

  // Automatically log out when the API returns HTTP 401.
  useEffect(() => {
    setUnauthorizedHandler(signOut);

    return () => {
      setUnauthorizedHandler(() => {});
    };
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{ token, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
