import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { POINT_OPTIONS, SCORE_LABEL_SIZE } from '@/lib/points-styles';

export function TrainingScoreLabel({ score }: { score: number }) {
  const option = POINT_OPTIONS.find((opt) => opt.value === score);
  if (!option) {
    return null;
  }

  return (
    <View
      style={[
        styles.circle,
        {
          backgroundColor: option.backgroundColor,
          borderColor: option.borderColor,
        },
      ]}>
      <Text style={[styles.label, { color: option.textColor }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: SCORE_LABEL_SIZE,
    height: SCORE_LABEL_SIZE,
    borderRadius: SCORE_LABEL_SIZE / 2,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    includeFontPadding: false,
  },
});
