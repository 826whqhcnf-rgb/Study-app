import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { colors, fonts, space } from '@/ui/theme';

export default function Settings() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quest Master Options',
          headerShown: true,
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: fonts.display },
        }}
      />
      <View style={s.screen}>
        <Text style={s.body}>
          Screen-time limit, daily study goal, reset today, and erase all — coming in step 5.
        </Text>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: space.lg },
  body: { fontFamily: fonts.body, color: colors.muted, fontSize: 14, lineHeight: 20 },
});
