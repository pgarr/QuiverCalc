import { DeviceEventEmitter, EmitterSubscription, NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { DEFAULT_TRAINING_PROGRESS, RoundSummary, TrainingProgress, TrainingRecord } from './database';

const { TrainingNotification } = NativeModules;

export function buildActions(training: TrainingRecord): Array<{ id: string; title: string }> {
  if (training.countPoints === 1) {
    return [
      { id: 'score-10', title: '10' },
      { id: 'score-9', title: '9' },
      { id: 'score-0', title: 'M' },
    ];
  }
  const count = Math.min(3, training.arrowsPerRound);
  return Array.from({ length: count }, (_, i) => {
    const n = training.arrowsPerRound - i;
    return { id: `add-${n}`, title: `+${n}` };
  });
}

export function buildBody(training: TrainingRecord, progress: TrainingProgress): string {
  if (training.countPoints === 1) {
    const round = progress.completedRounds.length + 1;
    const inRound = progress.currentRoundScores.length;
    return `Round ${round} | ${inRound}/${training.arrowsPerRound} shots | Total: ${progress.totalShots}`;
  }
  return `${training.distance}m | Total: ${progress.totalShots} shots`;
}

export async function requestPermission() {
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }
}

// No-op — the notification channel is now created inside TrainingForegroundService.onCreate
export async function createNotificationChannel() {}

/** Initial call: starts the foreground service with the MediaStyle notification. */
export async function displayTrainingNotification(
  training: TrainingRecord,
  progress: TrainingProgress,
) {
  const body = buildBody(training, progress);
  const actions = buildActions(training);
  await TrainingNotification.show('Training in progress', body, JSON.stringify(actions));
}

/** Subsequent updates: posts the new notification in-place without restarting the service. */
export async function updateTrainingNotification(
  training: TrainingRecord,
  progress: TrainingProgress,
) {
  const body = buildBody(training, progress);
  const actions = buildActions(training);
  await TrainingNotification.update('Training in progress', body, JSON.stringify(actions));
}

export async function stopTrainingNotification() {
  await TrainingNotification.stop();
}

/** Subscribe to notification action button presses. Returns an unsubscribe function. */
export function onNotificationActionPress(handler: (actionId: string) => void): () => void {
  const sub: EmitterSubscription = DeviceEventEmitter.addListener(
    'TrainingNotificationActionPress',
    handler,
  );
  return () => sub.remove();
}

export function applyAction(
  actionId: string,
  training: TrainingRecord,
  progress: TrainingProgress,
): TrainingProgress {
  const next = {
    ...progress,
    completedRounds: [...progress.completedRounds],
    currentRoundScores: [...progress.currentRoundScores],
  };

  if (actionId.startsWith('add-')) {
    const shots = parseInt(actionId.slice(4), 10);
    if (!isNaN(shots)) next.totalShots += shots;
    return next;
  }

  if (actionId.startsWith('score-')) {
    const score = parseInt(actionId.slice(6), 10);
    if (isNaN(score)) return next;
    next.currentRoundScores = [...next.currentRoundScores, score];
    next.totalShots += 1;
    if (next.currentRoundScores.length >= training.arrowsPerRound) {
      const round: RoundSummary = {
        roundNumber: next.completedRounds.length + 1,
        shotsTaken: next.currentRoundScores.length,
        shotsScores: [...next.currentRoundScores],
      };
      next.completedRounds = [...next.completedRounds, round];
      next.currentRoundScores = [];
    }
    return next;
  }

  return next;
}

export { DEFAULT_TRAINING_PROGRESS };
