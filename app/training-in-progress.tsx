import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

export default function TrainingInProgressScreen() {
  const params = useLocalSearchParams<{
    distance?: string;
    arrowsPerRound?: string;
    countPoints?: string;
  }>();

  const isCountPointsEnabled = params.countPoints === '1';
  const [roundsPassed, setRoundsPassed] = useState(0);
  const [totalArrowsShot, setTotalArrowsShot] = useState(0);

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
    setRoundsPassed((prev) => prev + 1);
    setTotalArrowsShot((prev) => prev + arrowsShotInRound);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Training in progress' }} />
      <View className="flex-1 gap-3 px-4 py-6">
        <Text variant="h4">Training in progress</Text>
        <Text variant="muted">Distance: {params.distance ?? '-'} m</Text>
        <Text variant="muted">Arrows per round: {params.arrowsPerRound ?? '-'}</Text>

        {isCountPointsEnabled ? (
          <View className="mt-4 rounded-md border border-dashed border-border p-4">
            <Text variant="muted">Points mode placeholder: score entry UI will be added later.</Text>
          </View>
        ) : (
          <>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {roundButtons.map((buttonValue, index) => (
                <Button
                  key={`round-value-${buttonValue}`}
                  variant={index === 0 ? 'default' : 'secondary'}
                  onPress={() => onRoundCompleted(buttonValue)}>
                  <Text>{`+${buttonValue}`}</Text>
                </Button>
              ))}
            </View>

            <View className="mt-2 rounded-md border border-border p-4">
              <Text variant="muted">Rounds passed: {roundsPassed}</Text>
              <Text variant="muted">Total arrows shot: {totalArrowsShot}</Text>
            </View>
          </>
        )}
      </View>
    </>
  );
}
