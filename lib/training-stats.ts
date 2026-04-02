import type { TrainingRecord } from '@/lib/database';
import type { TrainingScoresPayload } from '@/lib/training-scores';

export function parseTrainingScoresPayload(scores: string): TrainingScoresPayload | null {
  try {
    const parsed: unknown = JSON.parse(scores);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'version' in parsed &&
      (parsed as { version: unknown }).version === 1 &&
      'pointsMode' in parsed
    ) {
      return parsed as TrainingScoresPayload;
    }
  } catch {
    // ignore
  }
  return null;
}

export function getTrainingListStats(record: TrainingRecord): {
  totalShots: number;
  avgPointsPerRound: number | null;
} {
  const payload = parseTrainingScoresPayload(record.scores);
  if (!payload) {
    return { totalShots: 0, avgPointsPerRound: null };
  }

  if (payload.pointsMode && payload.pointsRounds?.length) {
    const rounds = payload.pointsRounds;
    const totalShots = rounds.reduce((sum, r) => sum + r.shots.length, 0);
    const totalPoints = rounds.reduce((sum, r) => sum + r.totalScore, 0);
    const avgPointsPerRound = totalPoints / rounds.length;
    return { totalShots, avgPointsPerRound };
  }

  if (!payload.pointsMode && payload.noPointsRounds?.length) {
    const totalShots = payload.noPointsRounds.reduce((sum, r) => sum + r.arrowsShot, 0);
    return { totalShots, avgPointsPerRound: null };
  }

  return { totalShots: 0, avgPointsPerRound: null };
}

export function formatTrainingDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
