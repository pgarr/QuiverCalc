import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { createTraining, initDatabase } from '@/lib/database';
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

  const onStartTraining = () => {
    if (!isValid) {
      Alert.alert('Invalid values', 'Please enter valid arrows per round and distance values.');
      return;
    }

    try {
      initDatabase();
      const trainingId = createTraining({
        arrowsPerRound: Number(arrowsPerRound),
        distance: Number(distance),
        countPoints,
        scores: [],
      });

      router.push({
        pathname: '/training-in-progress',
        params: {
          trainingId: String(trainingId),
          distance,
          arrowsPerRound,
          countPoints: countPoints ? '1' : '0',
        },
      });
    } catch {
      Alert.alert('Database error', 'Could not save training. Please try again.');
    }
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
