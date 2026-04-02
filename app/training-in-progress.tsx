import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { deleteTraining, initDatabase, updateTrainingScores } from '@/lib/database';
import { POINT_OPTIONS, type PointOption } from '@/lib/training-points';
import { buildTrainingScoresPayload, type PointsRoundSummary } from '@/lib/training-scores';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function TrainingInProgressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    trainingId?: string;
    distance?: string;
    arrowsPerRound?: string;
    countPoints?: string;
  }>();

  const trainingId = params.trainingId ? Number(params.trainingId) : NaN;

  const isCountPointsEnabled = params.countPoints === '1';
  const [noPointsRounds, setNoPointsRounds] = useState<{ roundNumber: number; arrowsShot: number }[]>([]);
  const [currentRoundShots, setCurrentRoundShots] = useState<PointOption[]>([]);
  const [completedRounds, setCompletedRounds] = useState<PointsRoundSummary[]>([]);
  const [totalArrowsShotPoints, setTotalArrowsShotPoints] = useState(0);

  const arrowsPerRound = useMemo(() => {
    const parsedValue = Number(params.arrowsPerRound);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      return 0;
    }
    return parsedValue;
  }, [params.arrowsPerRound]);

  const roundButtons = useMemo(() => {
    if (arrowsPerRound <= 0) {
      return [];
    }

    // Most common value first: +N, then +N-1 ... +1
    return Array.from({ length: arrowsPerRound }, (_, index) => arrowsPerRound - index);
  }, [arrowsPerRound]);

  const onRoundCompleted = (arrowsShotInRound: number) => {
    setNoPointsRounds((prev) => [
      ...prev,
      { roundNumber: prev.length + 1, arrowsShot: arrowsShotInRound },
    ]);
  };

  const roundsPassedNoPoints = noPointsRounds.length;
  const totalArrowsShotNoPoints = useMemo(
    () => noPointsRounds.reduce((sum, r) => sum + r.arrowsShot, 0),
    [noPointsRounds]
  );

  const onPointShot = (selectedOption: PointOption) => {
    if (arrowsPerRound <= 0) {
      return;
    }

    const nextShots = [...currentRoundShots, selectedOption];
    setCurrentRoundShots(nextShots);
    setTotalArrowsShotPoints((prev) => prev + 1);

    if (nextShots.length === arrowsPerRound) {
      const roundTotalScore = nextShots.reduce((sum, shot) => sum + shot.value, 0);
      setCompletedRounds((prev) => [
        ...prev,
        {
          roundNumber: prev.length + 1,
          totalScore: roundTotalScore,
          shots: nextShots.map((shot) => shot.label),
        },
      ]);
      setCurrentRoundShots([]);
    }
  };

  const onCancelTraining = () => {
    Alert.alert('Cancel training', 'This training will be removed from your history. Continue?', [
      { text: 'Keep training', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (!Number.isFinite(trainingId)) {
            router.replace('/');
            return;
          }
          try {
            initDatabase();
            deleteTraining(trainingId);
            router.replace('/');
          } catch {
            Alert.alert('Error', 'Could not remove training.');
          }
        },
      },
    ]);
  };

  const onFinishTraining = () => {
    if (!Number.isFinite(trainingId)) {
      Alert.alert('Error', 'Missing training id.');
      return;
    }
    try {
      initDatabase();
      const payload = buildTrainingScoresPayload(
        isCountPointsEnabled,
        completedRounds,
        noPointsRounds
      );
      updateTrainingScores(trainingId, JSON.stringify(payload));
      router.replace('/');
    } catch {
      Alert.alert('Error', 'Could not save training.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Training in progress' }} />
      <View className="flex-1 gap-3 px-4 py-6">
        <Text variant="h4">Training in progress</Text>
        <Text variant="muted">Distance: {params.distance ?? '-'} m</Text>
        <Text variant="muted">Arrows per round: {params.arrowsPerRound ?? '-'}</Text>

        {isCountPointsEnabled ? (
          <>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {POINT_OPTIONS.map((option) => (
                <Button
                  key={`point-${option.label}`}
                  onPress={() => onPointShot(option)}
                  className={`size-14 rounded-full ${option.backgroundClassName}`}>
                  <Text className={option.textClassName}>{option.label}</Text>
                </Button>
              ))}
            </View>

            <Text variant="muted" className="mt-2">
              Current round: {currentRoundShots.length}/{arrowsPerRound || '-'} shots
            </Text>

            <ScrollView className="mt-3 flex-1 rounded-md border border-border p-3">
              {completedRounds.length === 0 ? (
                <Text variant="muted">No completed rounds yet.</Text>
              ) : (
                completedRounds.map((round) => (
                  <View key={`completed-round-${round.roundNumber}`} className="mb-3 rounded-md border border-border p-3">
                    <Text>Round {round.roundNumber}</Text>
                    <Text variant="muted">Total score: {round.totalScore}</Text>
                    <Text variant="muted">Shots: {round.shots.join(', ')}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View className="mt-3 rounded-md border border-border p-4">
              <Text variant="muted">Rounds passed: {completedRounds.length}</Text>
              <Text variant="muted">Total arrows shot: {totalArrowsShotPoints}</Text>
            </View>
          </>
        ) : (
          <>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {roundButtons.map((buttonValue, index) => (
                <Button
                  key={`round-value-${buttonValue}`}
                  variant={index === 0 ? 'default' : 'secondary'}
                  size="icon"
                  className="size-14 rounded-full"
                  onPress={() => onRoundCompleted(buttonValue)}>
                  <Text>{`+${buttonValue}`}</Text>
                </Button>
              ))}
            </View>

            <View className="mt-2 rounded-md border border-border p-4">
              <Text variant="muted">Rounds passed: {roundsPassedNoPoints}</Text>
              <Text variant="muted">Total arrows shot: {totalArrowsShotNoPoints}</Text>
            </View>
          </>
        )}

        <View className="mt-3 flex-row gap-2">
          <Button variant="outline" className="flex-1" onPress={onCancelTraining}>
            <Text>Cancel training</Text>
          </Button>
          <Button className="flex-1" onPress={onFinishTraining}>
            <Text>Finish training</Text>
          </Button>
        </View>
      </View>
    </>
  );
}
