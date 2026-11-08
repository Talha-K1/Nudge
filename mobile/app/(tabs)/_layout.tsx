
import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';

import { colors } from '@/src/theme';
import { getPushToken } from '@/src/notifications';
import { registerDevice } from '@/src/api/endpoints';
import { USE_MOCK } from '@/src/api/client';

export default function TabLayout() {
  const router = useRouter();

  // Register the device for push notifications when using the real API.
  useEffect(() => {
    if (USE_MOCK) return;

    getPushToken().then((token) => {
      if (token) {
        registerDevice(token).catch(console.warn);
      }
    });
  }, []);

  // Handle taps on push notifications.
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    const taskId =
      response?.notification.request.content.data?.taskId;

    if (
      taskId &&
      response?.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      router.push({
        pathname: '/task/[id]',
        params: { id: String(taskId) },
      });
    }
  }, [response, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              color={typeof color === 'string' ? color : colors.muted}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="checkbox-outline"
              color={typeof color === 'string' ? color : colors.muted}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="repeat-outline"
              color={typeof color === 'string' ? color : colors.muted}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              color={typeof color === 'string' ? color : colors.muted}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
