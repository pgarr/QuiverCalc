import * as SQLite from 'expo-sqlite';

export type RoundSummary = {
  roundNumber: number;
  shotsTaken: number;
  shotsScores?: number[];
};

export type TrainingProgress = {
  totalShots: number;
  completedRounds: RoundSummary[];
  currentRoundScores: number[];
};

export const DEFAULT_TRAINING_PROGRESS: TrainingProgress = {
  totalShots: 0,
  completedRounds: [],
  currentRoundScores: [],
};

export type TrainingRecord = {
  id: number;
  distance: number;
  arrowsPerRound: number;
  countPoints: number;
  rounds: RoundSummary[];
  currentProgress: TrainingProgress;
  status: 'active' | 'completed';
  createdAt: string;
};

const db = SQLite.openDatabaseSync('quivercalc.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS trainings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      distance REAL NOT NULL,
      arrows_per_round INTEGER NOT NULL,
      count_points INTEGER NOT NULL,
      rounds TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'completed',
      current_progress TEXT NOT NULL DEFAULT '{}'
    );
  `);
  // Migrations for existing databases
  try {
    db.execSync(`ALTER TABLE trainings ADD COLUMN status TEXT NOT NULL DEFAULT 'completed'`);
  } catch {}
  try {
    db.execSync(`ALTER TABLE trainings ADD COLUMN current_progress TEXT NOT NULL DEFAULT '{}'`);
  } catch {}
}

function parseProgress(raw: unknown): TrainingProgress {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { ...DEFAULT_TRAINING_PROGRESS, ...(parsed as Partial<TrainingProgress>) };
    }
  } catch {}
  return { ...DEFAULT_TRAINING_PROGRESS };
}

function parseRecord(record: Record<string, unknown>): TrainingRecord {
  return {
    id: record.id as number,
    distance: record.distance as number,
    arrowsPerRound: record.arrowsPerRound as number,
    countPoints: record.countPoints as number,
    status: (record.status as 'active' | 'completed') ?? 'completed',
    createdAt: record.createdAt as string,
    rounds: (() => {
      try {
        const r = typeof record.rounds === 'string' ? JSON.parse(record.rounds) : record.rounds;
        return Array.isArray(r) ? (r as RoundSummary[]) : [];
      } catch {
        return [];
      }
    })(),
    currentProgress: parseProgress(record.current_progress),
  };
}

export function createTraining(input: {
  distance: number;
  arrowsPerRound: number;
  countPoints: boolean;
}): number {
  const createdAt = new Date().toISOString();
  const progressJson = JSON.stringify(DEFAULT_TRAINING_PROGRESS);
  const result = db.runSync(
    `INSERT INTO trainings (distance, arrows_per_round, count_points, rounds, created_at, status, current_progress)
     VALUES (?, ?, ?, '[]', ?, 'active', ?);`,
    [input.distance, input.arrowsPerRound, input.countPoints ? 1 : 0, createdAt, progressJson]
  );
  return result.lastInsertRowId;
}

export function deleteTraining(id: number) {
  db.runSync(`DELETE FROM trainings WHERE id = ?`, [id]);
}

export function getActiveTraining(): TrainingRecord | null {
  const records = db.getAllSync<Record<string, unknown>>(
    `SELECT id, distance, arrows_per_round as arrowsPerRound, count_points as countPoints,
            rounds, current_progress, status, created_at as createdAt
     FROM trainings WHERE status = 'active' LIMIT 1`
  );
  if (records.length === 0) return null;
  return parseRecord(records[0]);
}

export function updateTrainingProgress(id: number, progress: TrainingProgress) {
  db.runSync(`UPDATE trainings SET current_progress = ? WHERE id = ?`, [
    JSON.stringify(progress),
    id,
  ]);
}

export function markTrainingCompleted(id: number, rounds: RoundSummary[]) {
  db.runSync(
    `UPDATE trainings SET status = 'completed', rounds = ?, current_progress = '{}' WHERE id = ?`,
    [JSON.stringify(rounds), id]
  );
}

export function getTrainings(): TrainingRecord[] {
  return db
    .getAllSync<Record<string, unknown>>(
      `SELECT id, distance, arrows_per_round as arrowsPerRound, count_points as countPoints,
              rounds, current_progress, status, created_at as createdAt
       FROM trainings
       WHERE status = 'completed'
       ORDER BY id DESC;`
    )
    .map(parseRecord);
}
