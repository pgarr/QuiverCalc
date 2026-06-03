import { Switch, View } from 'react-native';
import { Button } from './ui/button';
import { Text } from './ui/text';
import { useMemo, useState } from 'react';

export const RoundNoPoints = ({
  arrowsPerRound,
  onRoundCompleted,
}: {
  arrowsPerRound: number;
  onRoundCompleted: (value: number) => void;
}) => {
  const [isSubtractMode, setIsSubtractMode] = useState(false);

  const roundButtons = useMemo(() => {
    if (arrowsPerRound <= 0) {
      return [];
    }

    // Most common value first: +N, then +N-1 ... +1
    return Array.from({ length: arrowsPerRound }, (_, index) => arrowsPerRound - index);
  }, [arrowsPerRound]);

  return (
    <View className="mt-4 gap-3">
      <View className="flex-row items-center gap-2">
        <Text variant="muted">+</Text>
        <Switch value={isSubtractMode} onValueChange={setIsSubtractMode} />
        <Text variant="muted">-</Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {roundButtons.map((buttonValue, index) => (
          <Button
            key={`round-value-${buttonValue}`}
            variant={
              isSubtractMode
                ? index === 0
                  ? 'destructive'
                  : 'outline'
                : index === 0
                  ? 'default'
                  : 'secondary'
            }
            size="icon"
            className="size-14 rounded-full"
            onPress={() => onRoundCompleted(isSubtractMode ? -buttonValue : buttonValue)}>
            <Text>{isSubtractMode ? `-${buttonValue}` : `+${buttonValue}`}</Text>
          </Button>
        ))}
      </View>
    </View>
  );
};
