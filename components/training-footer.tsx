import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export const TrainingFooter = ({
  roundsPassed,
  arrowsShot,
  showRounds = true,
}: {
  roundsPassed: number;
  arrowsShot: number;
  showRounds?: boolean;
}) => {
  return (
    <View className="mt-3 rounded-md border border-border p-4">
      {showRounds && <Text variant="muted">Rounds passed: {roundsPassed}</Text>}
      <Text variant="muted">Total arrows shot: {arrowsShot}</Text>
    </View>
  );
};
