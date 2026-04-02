import * as SQLite from 'expo-sqlite';

export type RoundSummary = {
  roundNumber: number;
  shotsTaken: number;
  shotsScores?: number[];
};

export type TrainingRecord = {
  id: number;
  distance: number;
  arrowsPerRound: number;
  countPoints: number;
  rounds: RoundSummary[];
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
      rounds TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function createTraining(input: {
  distance: number;
  arrowsPerRound: number;
  countPoints: boolean;
  rounds?: RoundSummary[];
}) {
  const roundsJson = JSON.stringify(input.rounds ?? {});
  const createdAt = new Date().toISOString();

  const result = db.runSync(
    `INSERT INTO trainings (distance, arrows_per_round, count_points, rounds, created_at)
     VALUES (?, ?, ?, ?, ?);`,
    [input.distance, input.arrowsPerRound, input.countPoints ? 1 : 0, roundsJson, createdAt]
  );
  return result.lastInsertRowId;
}

export function deleteTraining(id: number) {
  db.runSync(`DELETE FROM trainings WHERE id = ?`, [id]);
}

export function updateTrainingRounds(id: number, rounds: RoundSummary[]) {
  const roundsJson = JSON.stringify(rounds ?? {});
  db.runSync(`UPDATE trainings SET rounds = ? WHERE id = ?`, [roundsJson, id]);
}

export function getTrainings(): TrainingRecord[] {
  return db
    .getAllSync<TrainingRecord>(
      `SELECT
      id,
      distance,
      arrows_per_round as arrowsPerRound,
      count_points as countPoints,
      rounds,
      created_at as createdAt
     FROM trainings
     ORDER BY id DESC;`
    )
    .map((record) => ({
      ...record,
      rounds: typeof record.rounds === 'string' ? JSON.parse(record.rounds) : record.rounds,
    }));
}
