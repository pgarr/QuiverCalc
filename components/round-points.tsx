import { POINT_OPTIONS } from '@/lib/points-styles';
import { StyleSheet, View } from 'react-native';
import { TrainingScoreButton } from './training-score-button';
import { Text } from '@/components/ui/text';
import { useCallback, useState } from 'react';
import { TrainingScoreLabel } from './training-score-label';

export const RoundPoints = ({
  arrowsPerRound,
  onRoundCompleted,
}: {
  arrowsPerRound: number;
  onRoundCompleted: (scores: number[]) => void;
}) => {
  const [scores, setScores] = useState<number[]>([]);

  const onRoundFinish = useCallback(() => {
    onRoundCompleted(scores);
    setScores([]);
  }, [onRoundCompleted, scores]);

  return (
    <>
      <View style={styles.scoreButtonRow}>
        {POINT_OPTIONS.map((option) => (
          <TrainingScoreButton
            key={`point-${option.label}`}
            option={option}
            onPress={() => {
              setScores((prev) => {
                const newScores = [...prev, option.value];
                if (newScores.length === arrowsPerRound) {
                  onRoundFinish();
                  return [];
                }
                return newScores;
              });
            }}
          />
        ))}
      </View>

      <Text variant="muted" className="mt-2">
        Current round: {scores.length}/{arrowsPerRound || '-'} shots
      </Text>

      <View style={styles.scoresContainer}>
        {scores.map((score, index) => (
          <TrainingScoreLabel score={score} key={index} />
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
