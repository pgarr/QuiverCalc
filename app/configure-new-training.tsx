import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { createTraining, initDatabase } from '@/lib/database';
import {
  createNotificationChannel,
  DEFAULT_TRAINING_PROGRESS,
  displayTrainingNotification,
  requestPermission,
} from '@/lib/training-notification';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

export default function ConfigureNewTrainingScreen() {
  const router = useRouter();
  const [arrowsPerRound, setArrowsPerRound] = useState('');
  const [distance, setDistance] = useState('');
  const [countPoints, setCountPoints] = useState(true);

  const isValid = useMemo(() => {
    const parsedArrows = Number(arrowsPerRound);
    const parsedDistance = Number(distance);

    return (
      Number.isFinite(parsedArrows) &&
      Number.isFinite(parsedDistance) &&
      Number.isInteger(parsedArrows) &&
      parsedArrows > 0 &&
      parsedDistance > 0
    );
  }, [arrowsPerRound, distance]);

  const onStartTraining = async () => {
    if (!isValid) {
      Alert.alert('Invalid values', 'Please enter valid arrows per round and distance values.');
      return;
    }

    let trainingId: number;
    try {
      initDatabase();
      trainingId = createTraining({
        arrowsPerRound: Number(arrowsPerRound),
        distance: Number(distance),
        countPoints,
      });
    } catch (e) {
      console.error('Failed to create training:', e);
      Alert.alert('Database error', 'Could not save training. Please try again.');
      return;
    }

    // Notification is best-effort — training starts regardless
    try {
      await requestPermission();
      await createNotificationChannel();
      await displayTrainingNotification(
        {
          id: trainingId,
          distance: Number(distance),
          arrowsPerRound: Number(arrowsPerRound),
          countPoints: countPoints ? 1 : 0,
          rounds: [],
          currentProgress: DEFAULT_TRAINING_PROGRESS,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        DEFAULT_TRAINING_PROGRESS
      );
    } catch (e) {
      console.warn('Training notification could not be started:', e);
    }

    router.push({
      pathname: '/training-in-progress',
      params: {
        trainingId: String(trainingId),
        distance,
        arrowsPerRound,
        countPoints: countPoints ? '1' : '0',
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Configure new training' }} />
      <View className="flex-1 gap-4 px-4 py-6">
        <View className="gap-2">
          <Text>Arrows per round</Text>
          <Input
            value={arrowsPerRound}
            onChangeText={setArrowsPerRound}
            keyboardType="number-pad"
            placeholder="e.g. 6"
          />
        </View>

        <View className="gap-2">
          <Text>Distance (m)</Text>
          <Input
            value={distance}
            onChangeText={setDistance}
            keyboardType="decimal-pad"
            placeholder="e.g. 18"
          />
        </View>

        <View className="flex-row items-center justify-between rounded-md border border-border p-3">
          <Text>Count points</Text>
          <Switch checked={countPoints} onCheckedChange={setCountPoints} />
        </View>

        <Button onPress={onStartTraining} disabled={!isValid} className="mt-2">
          <Text>Start training</Text>
        </Button>
      </View>
    </>
  );
}
