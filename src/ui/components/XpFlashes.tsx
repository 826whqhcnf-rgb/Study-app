import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore, type XpFlash } from '@/state/store';
import { colors, fonts } from '../theme';

export function XpFlashes() {
  const insets = useSafeAreaInsets();
  const flashes = useStore((s) => s.xpFlashes);
  const consume = useStore((s) => s.consumeXpFlash);

  return (
    <View
      pointerEvents="none"
      style={[styles.layer, { top: insets.top + 12 }]}
    >
      {flashes.map((f) => (
        <FlashItem key={f.id} flash={f} onDone={() => consume(f.id)} />
      ))}
    </View>
  );
}

function FlashItem({ flash, onDone }: { flash: XpFlash; onDone: () => void }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 140, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(-44, { duration: 1100, easing: Easing.out(Easing.cubic) });
    opacity.value = withDelay(
      700,
      withTiming(
        0,
        { duration: 380, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(onDone)();
        },
      ),
    );
  }, [opacity, translateY, onDone]);

  const aStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.text, aStyle]}>
      +{flash.amount} XP
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    right: 16,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  text: {
    fontFamily: fonts.pixel,
    fontSize: 15,
    color: colors.goldSoft,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 4,
  },
});
