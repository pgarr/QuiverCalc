import * as SQLite from 'expo-sqlite';

export type TrainingRecord = {
  id: number;
  distance: number;
  arrowsPerRound: number;
  countPoints: number;
  scores: string;
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
      scores TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function createTraining(input: {
  distance: number;
  arrowsPerRound: number;
  countPoints: boolean;
  scores?: number[];
}) {
  const scoresJson = JSON.stringify(input.scores ?? []);

  const result = db.runSync(
    `INSERT INTO trainings (distance, arrows_per_round, count_points, scores)
     VALUES (?, ?, ?, ?);`,
    [input.distance, input.arrowsPerRound, input.countPoints ? 1 : 0, scoresJson]
  );
  return result.lastInsertRowId;
}

export function deleteTraining(id: number) {
  db.runSync(`DELETE FROM trainings WHERE id = ?`, [id]);
}

export function updateTrainingScores(id: number, scoresJson: string) {
  db.runSync(`UPDATE trainings SET scores = ? WHERE id = ?`, [scoresJson, id]);
}

export function getTrainings(): TrainingRecord[] {
  return db.getAllSync<TrainingRecord>(
    `SELECT
      id,
      distance,
      arrows_per_round as arrowsPerRound,
      count_points as countPoints,
      scores,
      created_at as createdAt
     FROM trainings
     ORDER BY id DESC;`
  );
}
