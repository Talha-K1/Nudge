import { MutationCache, QueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { ApiError } from './client';
import { errorMessage } from '../lib/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
  mutationCache: new MutationCache({
    onError: (error) => {
      // A 401 already logs the user out, so don't also show an alert.
      if (error instanceof ApiError && error.status === 401) return;
      Alert.alert('Something went wrong', errorMessage(error));
    },
  }),
});