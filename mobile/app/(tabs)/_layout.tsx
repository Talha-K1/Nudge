
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '@/src/theme';

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { getPushToken } from '@/src/notifications';
import { registerDevice } from '@/src/api/endpoints';
import { USE_MOCK } from '@/src/api/client';

// inside TabsLayout():
const router = useRouter();

useEffect(() => {
  if (USE_MOCK) return;
  getPushToken().then((t) => { if (t) registerDevice(t).catch(console.warn); });
}, []);

const response = Notifications.useLastNotificationResponse();
useEffect(() => {
  const taskId = response?.notification.request.content.data?.taskId;
  if (taskId && response?.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
    router.push({ pathname: '/task/[id]', params: { id: String(taskId) } });
  }
}, [response]);

export default function TabLayout() {
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
            <Ionicons name="home-outline" color={typeof color === 'string' ? color : colors.muted} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" color={typeof color === 'string' ? color : colors.muted} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="repeat-outline" color={typeof color === 'string' ? color : colors.muted} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={typeof color === 'string' ? color : colors.muted} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
