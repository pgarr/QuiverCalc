import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getTrainings, initDatabase } from '@/lib/database';
import { formatTrainingDate, getTrainingListStats } from '@/lib/training-stats';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [trainings, setTrainings] = useState(() => {
    initDatabase();
    return getTrainings();
  });

  useFocusEffect(
    useCallback(() => {
      initDatabase();
      setTrainings(getTrainings());
    }, [])
  );

  return (
    <>
      <Stack.Screen options={{ title: 'QuiverCalc' }} />
      <View className="flex-1 px-4 pt-4">
        <Button onPress={() => router.push('/configure-new-training')} className="mb-4 w-full">
          <Text>New training</Text>
        </Button>

        <FlatList
          className="flex-1"
          data={trainings}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="pb-6"
          ListEmptyComponent={
            <Text variant="muted" className="py-8 text-center">
              No trainings yet. Start one to see it here.
            </Text>
          }
          renderItem={({ item }) => {
            const { totalShots, avgPointsPerShot: avgPointsPerRound } = getTrainingListStats(item);
            const showAvg = item.countPoints === 1 && avgPointsPerRound != null;

            return (
              <View className="mb-3 rounded-md border border-border bg-background p-4">
                <Text className="font-medium">{formatTrainingDate(item.createdAt)}</Text>
                <Text variant="muted" className="mt-1">
                  Distance: {item.distance} m
                </Text>
                <Text variant="muted">Total shots: {totalShots}</Text>
                {showAvg ? (
                  <Text variant="muted">Avg points / round: {avgPointsPerRound.toFixed(1)}</Text>
                ) : null}
              </View>
            );
          }}
        />
      </View>
    </>
  );
}
