import { Text } from '@/components/ui/text';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function TrainingInProgressScreen() {
  const params = useLocalSearchParams<{
    distance?: string;
    arrowsPerRound?: string;
    countPoints?: string;
  }>();

  const isCountPointsEnabled = params.countPoints === '1';

  return (
    <>
      <Stack.Screen options={{ title: 'Training in progress' }} />
      <View className="flex-1 gap-3 px-4 py-6">
        <Text variant="h4">Training in progress</Text>
        <Text variant="muted">Distance: {params.distance ?? '-'} m</Text>
        <Text variant="muted">Arrows per round: {params.arrowsPerRound ?? '-'}</Text>
        <Text variant="muted">Count points: {isCountPointsEnabled ? 'Yes' : 'No'}</Text>

        <View className="mt-4 rounded-md border border-dashed border-border p-4">
          <Text variant="muted">Placeholder: score entry and shot tracking UI will go here.</Text>
        </View>
      </View>
    </>
  );
}
