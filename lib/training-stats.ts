import type { TrainingRecord } from '@/lib/database';

export function getTrainingListStats(record: TrainingRecord): {
  totalShots: number;
  avgPointsPerShot?: number;
} {
  if (record.countPoints === 1 && Array.isArray(record.rounds)) {
    const rounds = record.rounds;
    const { totalShots, totalPoints } = rounds.reduce(
      (sum, r) => {
        return {
          totalShots: sum.totalShots + r.shotsTaken,
          totalPoints:
            sum.totalPoints +
            (r.shotsScores ? r.shotsScores.reduce((s, score) => s + score, 0) : 0),
        };
      },
      { totalShots: 0, totalPoints: 0 }
    );

    const avgPointsPerShot = totalShots > 0 ? totalPoints / totalShots : undefined;
    return { totalShots, avgPointsPerShot };
  }
  const totalShots = record.rounds.reduce((sum, r) => sum + r.shotsTaken, 0);
  return { totalShots };
}

export function formatTrainingDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
