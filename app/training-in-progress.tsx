import { RoundNoPoints } from '@/components/round-no-points';
import { RoundPoints } from '@/components/round-points';
import { TrainingFooter } from '@/components/training-footer';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { deleteTraining, initDatabase, RoundSummary, updateTrainingRounds } from '@/lib/database';
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
  const [completedRounds, setCompletedRounds] = useState<RoundSummary[]>([]);
  const [totalArrowsShot, setTotalArrowsShot] = useState(0);

  const arrowsPerRound = useMemo(() => {
    const parsedValue = Number(params.arrowsPerRound);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      return 0;
    }
    return parsedValue;
  }, [params.arrowsPerRound]);

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
      updateTrainingRounds(trainingId, completedRounds);

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
            <RoundPoints
              arrowsPerRound={arrowsPerRound}
              onRoundCompleted={(scores) => {
                const newRound: RoundSummary = {
                  roundNumber: completedRounds.length + 1,
                  shotsTaken: scores.length,
                  shotsScores: scores,
                };

                setCompletedRounds((prev) => [...prev, newRound]);
                setTotalArrowsShot((prev) => prev + scores.length);
              }}
            />

            <ScrollView className="mt-3 flex-1 rounded-md border border-border p-3">
              {completedRounds.length === 0 ? (
                <Text variant="muted">No completed rounds yet.</Text>
              ) : (
                completedRounds.map((round) => (
                  <View
                    key={`completed-round-${round.roundNumber}`}
                    className="mb-3 rounded-md border border-border p-3">
                    <Text>Round {round.roundNumber}</Text>
                    <Text variant="muted">
                      Total score:
                      {round.shotsScores?.reduce((sum, score) => sum + score, 0) ?? '-'}
                    </Text>
                    <Text variant="muted">Shots: {round.shotsScores?.join(', ') ?? '-'}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </>
        ) : (
          <RoundNoPoints
            onRoundCompleted={(value) => {
              const newRound: RoundSummary = {
                roundNumber: completedRounds.length + 1,
                shotsTaken: value,
              };
              setCompletedRounds((prev) => [...prev, newRound]);
              setTotalArrowsShot((prev) => prev + value);
            }}
            arrowsPerRound={arrowsPerRound}
          />
        )}
        <TrainingFooter roundsPassed={completedRounds.length} arrowsShot={totalArrowsShot} />

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
