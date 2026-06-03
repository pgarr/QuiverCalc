import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AppState, ScrollView, View } from 'react-native';
import { RoundNoPoints } from '@/components/round-no-points';
import { RoundPoints } from '@/components/round-points';
import { TrainingFooter } from '@/components/training-footer';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  DEFAULT_TRAINING_PROGRESS,
  RoundSummary,
  TrainingProgress,
  deleteTraining,
  getActiveTraining,
  initDatabase,
  markTrainingCompleted,
  updateTrainingProgress,
} from '@/lib/database';
import {
  onNotificationActionPress,
  stopTrainingNotification,
  updateTrainingNotification,
} from '@/lib/training-notification';
import { useFocusEffect } from '@react-navigation/native';

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

  const arrowsPerRound = useMemo(() => {
    const parsedValue = Number(params.arrowsPerRound);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) return 0;
    return parsedValue;
  }, [params.arrowsPerRound]);

  const [progress, setProgress] = useState<TrainingProgress>(DEFAULT_TRAINING_PROGRESS);

  // Sync from DB when screen gains navigation focus
  useFocusEffect(
    useCallback(() => {
      initDatabase();
      const active = getActiveTraining();
      if (active && active.id === trainingId) {
        setProgress(active.currentProgress);
      }
    }, [trainingId])
  );

  // Sync from DB when the app comes back to the foreground (e.g. after notification shade use)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const active = getActiveTraining();
        if (active && active.id === trainingId) {
          setProgress(active.currentProgress);
        }
      }
    });
    return () => sub.remove();
  }, [trainingId]);

  // Sync UI when a notification action button is pressed.
  // The native receiver already updated the DB and the notification; we only need to
  // refresh the in-memory progress so the screen stays consistent.
  useEffect(() => {
    const unsubscribe = onNotificationActionPress(() => {
      const active = getActiveTraining();
      if (active && active.id === trainingId) {
        setProgress(active.currentProgress);
      }
    });
    return unsubscribe;
  }, [trainingId]);

  const persistProgress = useCallback(
    async (next: TrainingProgress) => {
      updateTrainingProgress(trainingId, next);
      const training = getActiveTraining();
      if (training) await updateTrainingNotification(training, next);
    },
    [trainingId]
  );

  const onCancelTraining = () => {
    Alert.alert('Cancel training', 'This training will be removed from your history. Continue?', [
      { text: 'Keep training', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await stopTrainingNotification();
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

  const onFinishTraining = async () => {
    if (!Number.isFinite(trainingId)) {
      Alert.alert('Error', 'Missing training id.');
      return;
    }
    try {
      initDatabase();
      const rounds: RoundSummary[] = isCountPointsEnabled
        ? progress.completedRounds
        : [{ roundNumber: 1, shotsTaken: progress.totalShots }];
      markTrainingCompleted(trainingId, rounds);
      await stopTrainingNotification();
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
              scores={progress.currentRoundScores}
              onScoresChanged={(currentRoundScores) => {
                const next: TrainingProgress = { ...progress, currentRoundScores };
                setProgress(next);
                persistProgress(next);
              }}
              onRoundCompleted={(scores) => {
                const round: RoundSummary = {
                  roundNumber: progress.completedRounds.length + 1,
                  shotsTaken: scores.length,
                  shotsScores: scores,
                };
                const next: TrainingProgress = {
                  totalShots: progress.totalShots + scores.length,
                  completedRounds: [...progress.completedRounds, round],
                  currentRoundScores: [],
                };
                setProgress(next);
                persistProgress(next);
              }}
            />

            <ScrollView className="mt-3 flex-1 rounded-md border border-border p-3">
              {progress.completedRounds.length === 0 ? (
                <Text variant="muted">No completed rounds yet.</Text>
              ) : (
                progress.completedRounds.map((round) => (
                  <View
                    key={`completed-round-${round.roundNumber}`}
                    className="mb-3 rounded-md border border-border p-3">
                    <Text>Round {round.roundNumber}</Text>
                    <Text variant="muted">
                      Total score:{' '}
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
            arrowsPerRound={arrowsPerRound}
            onRoundCompleted={(value) => {
              const next: TrainingProgress = {
                ...progress,
                totalShots: progress.totalShots + value,
              };
              setProgress(next);
              persistProgress(next);
            }}
          />
        )}

        <TrainingFooter
          roundsPassed={progress.completedRounds.length}
          arrowsShot={
            isCountPointsEnabled
              ? progress.completedRounds.reduce((sum, r) => sum + r.shotsTaken, 0)
              : progress.totalShots
          }
          showRounds={isCountPointsEnabled}
        />

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
