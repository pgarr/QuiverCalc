import { POINT_OPTIONS } from '@/lib/points-styles';
import { Pressable, StyleSheet, View } from 'react-native';
import { TrainingScoreButton } from './training-score-button';
import { Text } from '@/components/ui/text';
import { TrainingScoreLabel } from './training-score-label';

export const RoundPoints = ({
  arrowsPerRound,
  scores,
  onRoundCompleted,
  onScoresChanged,
}: {
  arrowsPerRound: number;
  scores: number[];
  onRoundCompleted: (scores: number[]) => void;
  onScoresChanged: (scores: number[]) => void;
}) => {
  return (
    <>
      <View style={styles.scoreButtonRow}>
        {POINT_OPTIONS.map((option) => (
          <TrainingScoreButton
            key={`point-${option.label}`}
            option={option}
            onPress={() => {
              const newScores = [...scores, option.value];
              if (newScores.length === arrowsPerRound) {
                onRoundCompleted(newScores);
              } else {
                onScoresChanged(newScores);
              }
            }}
          />
        ))}
      </View>

      <Text variant="muted" className="mt-2">
        Current round: {scores.length}/{arrowsPerRound || '-'} shots
      </Text>

      <View style={styles.scoresContainer}>
        {scores.map((score, index) => (
          <Pressable
            key={index}
            onLongPress={() => onScoresChanged(scores.filter((_, i) => i !== index))}>
            <TrainingScoreLabel score={score} />
          </Pressable>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  scoreButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  scoresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
});
