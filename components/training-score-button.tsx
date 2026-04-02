import type { PointOption } from '@/lib/training-points';
import { SCORE_BUTTON_BORDER_WIDTH, SCORE_BUTTON_SIZE } from '@/lib/training-points';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  option: PointOption;
  onPress: () => void;
};

/**
 * Score rings use only React Native StyleSheet so NativeWind flex/gap and
 * cssInterop do not affect measured size or borders.
 */
export function TrainingScoreButton({ option, onPress }: Props) {
  return (
    <View style={styles.slot}>
      <TouchableOpacity
        activeOpacity={0.88}
        accessibilityRole="button"
        hitSlop={6}
        onPress={onPress}
        style={[
          styles.circle,
          {
            backgroundColor: option.backgroundColor,
            borderColor: option.borderColor,
          },
          Platform.select({ web: { cursor: 'pointer' as const } }),
        ]}>
        <Text style={[styles.label, { color: option.textColor }]}>{option.label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: SCORE_BUTTON_SIZE,
    height: SCORE_BUTTON_SIZE,
    flexShrink: 0,
    flexGrow: 0,
  },
  circle: {
    width: SCORE_BUTTON_SIZE,
    height: SCORE_BUTTON_SIZE,
    borderRadius: SCORE_BUTTON_SIZE / 2,
    borderWidth: SCORE_BUTTON_BORDER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    // Prevent themed Text from shrinking on some platforms
    includeFontPadding: false,
  },
});
