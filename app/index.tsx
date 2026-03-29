import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'QuiverCalc' }} />
      <View className="flex-1 items-center justify-center px-4">
        <Button onPress={() => router.push('/configure-new-training')} className="w-full max-w-xs">
          <Text>New training</Text>
        </Button>
      </View>
    </>
  );
}
