package com.pgarr.quivercalc

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

object TrainingDatabase {

    data class Record(
        val id: Long,
        val distance: Double,
        val arrowsPerRound: Int,
        val countPoints: Int,
        val totalShots: Int,
        val completedRounds: JSONArray,
        val currentRoundScores: JSONArray,
    )

    /** Applies an add-N or score-N action, persists the result, and returns the updated record. */
    fun applyAction(context: Context, actionId: String): Record? {
        val db = openDb(context) ?: return null
        return try {
            val record = queryActive(db) ?: return null
            val updated = applyToRecord(actionId, record) ?: return record
            saveProgress(db, updated)
            updated
        } finally {
            db.close()
        }
    }

    fun getActive(context: Context): Record? {
        val db = openDb(context) ?: return null
        return try {
            queryActive(db)
        } finally {
            db.close()
        }
    }

    private fun queryActive(db: SQLiteDatabase): Record? {
        db.rawQuery(
            """SELECT id, distance, arrows_per_round, count_points, current_progress
               FROM trainings WHERE status = 'active' LIMIT 1""",
            null,
        ).use { c ->
            if (!c.moveToFirst()) return null
            val progressStr = c.getString(4) ?: "{}"
            val progress = try { JSONObject(progressStr) } catch (_: Exception) { JSONObject() }
            return Record(
                id = c.getLong(0),
                distance = c.getDouble(1),
                arrowsPerRound = c.getInt(2),
                countPoints = c.getInt(3),
                totalShots = progress.optInt("totalShots", 0),
                completedRounds = progress.optJSONArray("completedRounds") ?: JSONArray(),
                currentRoundScores = progress.optJSONArray("currentRoundScores") ?: JSONArray(),
            )
        }
    }

    private fun applyToRecord(actionId: String, r: Record): Record? = when {
        actionId.startsWith("add-") -> {
            val shots = actionId.removePrefix("add-").toIntOrNull() ?: return null
            r.copy(totalShots = r.totalShots + shots)
        }
        actionId.startsWith("score-") -> {
            val score = actionId.removePrefix("score-").toIntOrNull() ?: return null
            val newScores = copyArray(r.currentRoundScores).also { it.put(score) }
            val newTotal = r.totalShots + 1
            if (newScores.length() >= r.arrowsPerRound) {
                val round = JSONObject().apply {
                    put("roundNumber", r.completedRounds.length() + 1)
                    put("shotsTaken", newScores.length())
                    put("shotsScores", newScores)
                }
                r.copy(
                    totalShots = newTotal,
                    completedRounds = copyArray(r.completedRounds).also { it.put(round) },
                    currentRoundScores = JSONArray(),
                )
            } else {
                r.copy(totalShots = newTotal, currentRoundScores = newScores)
            }
        }
        else -> null
    }

    private fun saveProgress(db: SQLiteDatabase, r: Record) {
        val progress = JSONObject().apply {
            put("totalShots", r.totalShots)
            put("completedRounds", r.completedRounds)
            put("currentRoundScores", r.currentRoundScores)
        }
        val values = ContentValues().apply { put("current_progress", progress.toString()) }
        db.update("trainings", values, "id = ?", arrayOf(r.id.toString()))
    }

    private fun copyArray(src: JSONArray): JSONArray {
        val dst = JSONArray()
        for (i in 0 until src.length()) dst.put(src.get(i))
        return dst
    }

    private fun openDb(context: Context): SQLiteDatabase? = try {
        // expo-sqlite stores databases at filesDir/SQLite/<name>
        val file = File(context.filesDir, "SQLite/quivercalc.db")
        if (!file.exists()) null
        else SQLiteDatabase.openDatabase(file.absolutePath, null, SQLiteDatabase.OPEN_READWRITE)
    } catch (_: Exception) {
        null
    }
}
