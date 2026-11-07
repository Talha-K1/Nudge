
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home"
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
              name="checkbox"
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
              name="card"
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
              name="settings"
              color={typeof color === 'string' ? color : colors.muted}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
