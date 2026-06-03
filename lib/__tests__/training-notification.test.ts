import { DEFAULT_TRAINING_PROGRESS, TrainingProgress, TrainingRecord } from '../database';
import { applyAction, buildActions, buildBody } from '../training-notification';

jest.mock('react-native', () => ({
  NativeModules: {
    TrainingNotification: {
      show: jest.fn(),
      update: jest.fn(),
      stop: jest.fn(),
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    },
  },
  DeviceEventEmitter: { addListener: jest.fn(() => ({ remove: jest.fn() })) },
  PermissionsAndroid: { request: jest.fn(), PERMISSIONS: { POST_NOTIFICATIONS: 'POST_NOTIFICATIONS' } },
  Platform: { OS: 'android', Version: '33' },
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getAllSync: jest.fn(() => []),
  })),
}));

const makeTraining = (overrides: Partial<TrainingRecord> = {}): TrainingRecord => ({
  id: 1,
  distance: 18,
  arrowsPerRound: 6,
  countPoints: 0,
  rounds: [],
  currentProgress: { ...DEFAULT_TRAINING_PROGRESS },
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeProgress = (overrides: Partial<TrainingProgress> = {}): TrainingProgress => ({
  ...DEFAULT_TRAINING_PROGRESS,
  ...overrides,
});

// ─── applyAction ─────────────────────────────────────────────────────────────

describe('applyAction — no-points mode', () => {
  const training = makeTraining({ countPoints: 0, arrowsPerRound: 6 });

  it('add-N increases totalShots by N', () => {
    const result = applyAction('add-6', training, makeProgress());
    expect(result.totalShots).toBe(6);
  });

  it('add-1 increases totalShots by 1', () => {
    const result = applyAction('add-1', training, makeProgress({ totalShots: 10 }));
    expect(result.totalShots).toBe(11);
  });

  it('does not mutate the original progress', () => {
    const progress = makeProgress({ totalShots: 5 });
    applyAction('add-3', training, progress);
    expect(progress.totalShots).toBe(5);
  });

  it('ignores add- with non-numeric suffix', () => {
    const progress = makeProgress({ totalShots: 5 });
    const result = applyAction('add-abc', training, progress);
    expect(result.totalShots).toBe(5);
  });
});

describe('applyAction — with-points mode', () => {
  const training = makeTraining({ countPoints: 1, arrowsPerRound: 3 });

  it('score-10 appends 10 to currentRoundScores and increments totalShots', () => {
    const result = applyAction('score-10', training, makeProgress());
    expect(result.currentRoundScores).toEqual([10]);
    expect(result.totalShots).toBe(1);
  });

  it('score-0 (miss) appends 0 to currentRoundScores', () => {
    const result = applyAction('score-0', training, makeProgress());
    expect(result.currentRoundScores).toEqual([0]);
    expect(result.totalShots).toBe(1);
  });

  it('completing a round moves scores to completedRounds and resets currentRoundScores', () => {
    const progress = makeProgress({ currentRoundScores: [10, 9] });
    const result = applyAction('score-8', training, progress);

    expect(result.currentRoundScores).toEqual([]);
    expect(result.completedRounds).toHaveLength(1);
    expect(result.completedRounds[0].shotsScores).toEqual([10, 9, 8]);
    expect(result.completedRounds[0].shotsTaken).toBe(3);
    expect(result.completedRounds[0].roundNumber).toBe(1);
  });

  it('assigns incrementing roundNumber across multiple rounds', () => {
    const training2 = makeTraining({ countPoints: 1, arrowsPerRound: 1 });

    let p = makeProgress();
    p = applyAction('score-10', training2, p); // completes round 1
    p = applyAction('score-9', training2, p); // completes round 2

    expect(p.completedRounds).toHaveLength(2);
    expect(p.completedRounds[0].roundNumber).toBe(1);
    expect(p.completedRounds[1].roundNumber).toBe(2);
    expect(p.totalShots).toBe(2);
  });

  it('ignores score- with non-numeric suffix', () => {
    const progress = makeProgress({ totalShots: 0, currentRoundScores: [] });
    const result = applyAction('score-x', training, progress);
    expect(result.currentRoundScores).toEqual([]);
    expect(result.totalShots).toBe(0);
  });
});

describe('applyAction — unknown actions', () => {
  const training = makeTraining();

  it('returns progress unchanged for unknown action', () => {
    const progress = makeProgress({ totalShots: 7 });
    const result = applyAction('unknown', training, progress);
    expect(result.totalShots).toBe(7);
  });

  it('returns progress unchanged for empty string', () => {
    const progress = makeProgress({ totalShots: 3 });
    const result = applyAction('', training, progress);
    expect(result.totalShots).toBe(3);
  });
});

// ─── buildBody ───────────────────────────────────────────────────────────────

describe('buildBody', () => {
  it('no-points: shows distance and total shots', () => {
    const training = makeTraining({ distance: 18, countPoints: 0 });
    const body = buildBody(training, makeProgress({ totalShots: 45 }));
    expect(body).toBe('18m | Total: 45 shots');
  });

  it('with-points: shows round number, in-round progress, and total shots', () => {
    const training = makeTraining({ countPoints: 1, arrowsPerRound: 6 });
    const body = buildBody(
      training,
      makeProgress({ completedRounds: [], currentRoundScores: [10, 9], totalShots: 2 }),
    );
    expect(body).toBe('Round 1 | 2/6 shots | Total: 2');
  });

  it('with-points: increments round number after a round is completed', () => {
    const training = makeTraining({ countPoints: 1, arrowsPerRound: 3 });
    const progress = makeProgress({
      completedRounds: [{ roundNumber: 1, shotsTaken: 3, shotsScores: [10, 9, 8] }],
      currentRoundScores: [],
      totalShots: 3,
    });
    const body = buildBody(training, progress);
    expect(body).toBe('Round 2 | 0/3 shots | Total: 3');
  });
});

// ─── buildActions ────────────────────────────────────────────────────────────

describe('buildActions', () => {
  it('with-points: always returns 10, 9, M', () => {
    const actions = buildActions(makeTraining({ countPoints: 1 }));
    expect(actions).toEqual([
      { id: 'score-10', title: '10' },
      { id: 'score-9', title: '9' },
      { id: 'score-0', title: 'M' },
    ]);
  });

  it('no-points arrowsPerRound=6: returns top 3 buttons (+6, +5, +4)', () => {
    const actions = buildActions(makeTraining({ countPoints: 0, arrowsPerRound: 6 }));
    expect(actions).toEqual([
      { id: 'add-6', title: '+6' },
      { id: 'add-5', title: '+5' },
      { id: 'add-4', title: '+4' },
    ]);
  });

  it('no-points arrowsPerRound=2: returns only 2 buttons', () => {
    const actions = buildActions(makeTraining({ countPoints: 0, arrowsPerRound: 2 }));
    expect(actions).toEqual([
      { id: 'add-2', title: '+2' },
      { id: 'add-1', title: '+1' },
    ]);
  });

  it('no-points arrowsPerRound=1: returns only 1 button', () => {
    const actions = buildActions(makeTraining({ countPoints: 0, arrowsPerRound: 1 }));
    expect(actions).toEqual([{ id: 'add-1', title: '+1' }]);
  });
});
