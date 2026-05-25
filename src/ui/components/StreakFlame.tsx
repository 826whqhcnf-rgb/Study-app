import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme';

export function StreakFlame({ streak }: { streak: number }) {
  const rot = useSharedValue(-3);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (streak > 0) {
      rot.value = withRepeat(
        withTiming(3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
      scale.value = withRepeat(
        withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(rot);
      cancelAnimation(scale);
      rot.value = 0;
      scale.value = 1;
    }
    return () => {
      cancelAnimation(rot);
      cancelAnimation(scale);
    };
  }, [streak, rot, scale]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }, { scale: scale.value }],
  }));

  return (
    <View style={s.wrap}>
      <Animated.Text style={[s.flame, aStyle]}>🔥</Animated.Text>
      <Text style={s.num}>{streak}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 34 },
  flame: { fontSize: 18 },
  num: { fontFamily: fonts.pixel, fontSize: 12, color: colors.ember },
});
