import { getTrainingListStats, formatTrainingDate } from '../training-stats';
import type { TrainingRecord } from '../database';

const BASE: Pick<TrainingRecord, 'id' | 'currentProgress' | 'status' | 'createdAt'> = {
  id: 1,
  currentProgress: { totalShots: 0, completedRounds: [], currentRoundScores: [] },
  status: 'completed',
  createdAt: '2023-01-01T00:00:00Z',
};

describe('getTrainingListStats', () => {
  it('should calculate totalShots and avgPointsPerShot when countPoints is 1', () => {
    const record: TrainingRecord = {
      ...BASE,
      distance: 10,
      arrowsPerRound: 3,
      countPoints: 1,
      rounds: [
        { roundNumber: 1, shotsTaken: 3, shotsScores: [10, 9, 8] },
        { roundNumber: 2, shotsTaken: 3, shotsScores: [7, 6, 5] },
      ],
    };
    const result = getTrainingListStats(record);
    expect(result.totalShots).toBe(6);
    expect(result.avgPointsPerShot).toBe(7.5);
  });

  it('should calculate only totalShots when countPoints is not 1', () => {
    const record: TrainingRecord = {
      ...BASE,
      distance: 10,
      arrowsPerRound: 3,
      countPoints: 0,
      rounds: [
        { roundNumber: 1, shotsTaken: 3 },
        { roundNumber: 2, shotsTaken: 3 },
      ],
    };
    const result = getTrainingListStats(record);
    expect(result.totalShots).toBe(6);
    expect(result.avgPointsPerShot).toBeUndefined();
  });
});

describe('formatTrainingDate', () => {
  it('should format valid ISO string', () => {
    const original = Date.prototype.toLocaleString;
    const spy = jest
      .spyOn(Date.prototype, 'toLocaleString')
      .mockImplementation(function (locales, options) {
        return original.call(this, 'en-US', { ...options, timeZone: 'UTC' });
      });
    const iso = '2023-01-01T12:00:00Z';
    const result = formatTrainingDate(iso);
    expect(result).toBe('Jan 1, 2023, 12:00 PM');
    spy.mockRestore();
  });

  it('should return — for invalid date', () => {
    const result = formatTrainingDate('invalid');
    expect(result).toBe('—');
  });
});
