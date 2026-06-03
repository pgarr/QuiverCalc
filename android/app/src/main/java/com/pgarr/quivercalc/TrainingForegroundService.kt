package com.pgarr.quivercalc

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.view.View
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import org.json.JSONArray

class TrainingForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "quivercalc_training"
        const val NOTIFICATION_ID = 2001

        private val BUTTON_IDS = listOf(R.id.btn_action_0, R.id.btn_action_1, R.id.btn_action_2)

        // ── Content helpers (mirror the JS buildActions / buildBody) ────────

        fun buildActions(r: TrainingDatabase.Record): List<Pair<String, String>> =
            if (r.countPoints == 1) {
                listOf("score-10" to "10", "score-9" to "9", "score-0" to "M")
            } else {
                val count = minOf(3, r.arrowsPerRound)
                (0 until count).map { i ->
                    val n = r.arrowsPerRound - i
                    "add-$n" to "+$n"
                }
            }

        fun buildBody(r: TrainingDatabase.Record): String =
            if (r.countPoints == 1) {
                val round = r.completedRounds.length() + 1
                val inRound = r.currentRoundScores.length()
                "Round $round | $inRound/${r.arrowsPerRound} shots | Total: ${r.totalShots}"
            } else {
                "${r.distance}m | Total: ${r.totalShots} shots"
            }

        fun parseActionsJson(json: String): List<Pair<String, String>> = try {
            val arr = JSONArray(json)
            (0 until arr.length()).map { i ->
                val obj = arr.getJSONObject(i)
                obj.getString("id") to obj.getString("title")
            }
        } catch (_: Exception) { emptyList() }

        // ── Notification builder ─────────────────────────────────────────────

        fun buildNotification(
            context: Context,
            title: String,
            body: String,
            actions: List<Pair<String, String>>,
        ): Notification {
            val views = RemoteViews(context.packageName, R.layout.notification_training)
            views.setTextViewText(R.id.notification_body, body)

            val capped = actions.take(3)
            capped.forEachIndexed { index, (id, label) ->
                val btnId = BUTTON_IDS[index]
                views.setTextViewText(btnId, label)
                views.setViewVisibility(btnId, View.VISIBLE)

                val intent = Intent(context, TrainingNotificationReceiver::class.java).apply {
                    action = TrainingNotificationReceiver.ACTION_PRESS
                    putExtra(TrainingNotificationReceiver.EXTRA_ACTION_ID, id)
                }
                val pi = PendingIntent.getBroadcast(
                    context,
                    (NOTIFICATION_ID.toString() + id).hashCode() and 0x7FFFFFFF,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )
                views.setOnClickPendingIntent(btnId, pi)
            }
            for (i in capped.size until 3) {
                views.setViewVisibility(BUTTON_IDS[i], View.GONE)
            }

            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            val contentPi = launchIntent?.let {
                PendingIntent.getActivity(
                    context, 0, it,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )
            }

            return NotificationCompat.Builder(context, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(body)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setOngoing(true)
                .setShowWhen(false)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setCustomContentView(views)
                .setStyle(NotificationCompat.DecoratedCustomViewStyle())
                .apply { contentPi?.let { setContentIntent(it) } }
                .build()
        }
    }

    override fun onCreate() {
        super.onCreate()
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val title = intent?.getStringExtra("title") ?: "Training in progress"
        val body = intent?.getStringExtra("body") ?: ""
        val actionsJson = intent?.getStringExtra("actions") ?: "[]"
        startForeground(
            NOTIFICATION_ID,
            buildNotification(this, title, body, parseActionsJson(actionsJson)),
        )
        return START_STICKY
    }

    override fun onDestroy() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(
                CHANNEL_ID, "Active Training", NotificationManager.IMPORTANCE_LOW,
            ).apply {
                setShowBadge(false)
                enableVibration(false)
                setSound(null, null)
            }
            getSystemService(NotificationManager::class.java)?.createNotificationChannel(ch)
        }
    }
}
