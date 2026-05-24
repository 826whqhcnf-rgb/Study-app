import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors, fonts } from '@/ui/theme';

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: {
          backgroundColor: 'rgba(26,20,15,0.92)',
          borderTopColor: colors.line,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodySemi, fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon glyph="🏰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          title: 'Train',
          tabBarIcon: ({ focused }) => <TabIcon glyph="💪" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="eat"
        options={{
          title: 'Eat',
          tabBarIcon: ({ focused }) => <TabIcon glyph="🥗" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ focused }) => <TabIcon glyph="🎯" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
