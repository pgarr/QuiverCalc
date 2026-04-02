export const TRAINING_SCORES_VERSION = 1 as const;

export type PointsRoundSummary = {
  roundNumber: number;
  totalScore: number;
  shots: string[];
};

export type NoPointsRoundSummary = {
  roundNumber: number;
  arrowsShot: number;
};

export type TrainingScoresPayload = {
  version: typeof TRAINING_SCORES_VERSION;
  pointsMode: boolean;
  pointsRounds?: PointsRoundSummary[];
  noPointsRounds?: NoPointsRoundSummary[];
};

export function buildTrainingScoresPayload(
  pointsMode: boolean,
  pointsRounds: PointsRoundSummary[],
  noPointsRounds: NoPointsRoundSummary[]
): TrainingScoresPayload {
  if (pointsMode) {
    return { version: TRAINING_SCORES_VERSION, pointsMode: true, pointsRounds };
  }
  return { version: TRAINING_SCORES_VERSION, pointsMode: false, noPointsRounds };
}
