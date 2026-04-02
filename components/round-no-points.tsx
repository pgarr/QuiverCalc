import { View } from 'react-native';
import { Button } from './ui/button';
import { Text } from './ui/text';
import { useMemo } from 'react';

export const RoundNoPoints = ({
  arrowsPerRound,
  onRoundCompleted,
}: {
  arrowsPerRound: number;
  onRoundCompleted: (value: number) => void;
}) => {
  const roundButtons = useMemo(() => {
    if (arrowsPerRound <= 0) {
      return [];
    }

    // Most common value first: +N, then +N-1 ... +1
    return Array.from({ length: arrowsPerRound }, (_, index) => arrowsPerRound - index);
  }, [arrowsPerRound]);

  return (
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
  );
};
