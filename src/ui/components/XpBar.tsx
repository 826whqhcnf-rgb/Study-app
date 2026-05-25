import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '../theme';

export function XpBar({ into, need }: { into: number; need: number }) {
  const pct = need > 0 ? Math.min(100, Math.max(0, (into / need) * 100)) : 0;
  const width = useSharedValue(pct);

  useEffect(() => {
    width.value = withTiming(pct, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [pct, width]);

  const aStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={s.track}>
      <Animated.View style={[s.fill, aStyle]} />
    </View>
  );
}

const s = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.wellDark,
    borderColor: colors.line,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.gold,
  },
});
