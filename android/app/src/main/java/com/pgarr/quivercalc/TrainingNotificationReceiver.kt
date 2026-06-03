package com.pgarr.quivercalc

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class TrainingNotificationReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_PRESS = "com.pgarr.quivercalc.TRAINING_ACTION"
        const val EXTRA_ACTION_ID = "action_id"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_PRESS) return
        val actionId = intent.getStringExtra(EXTRA_ACTION_ID) ?: return

        // Update DB natively — works regardless of whether the JS bridge is live
        val record = TrainingDatabase.applyAction(context, actionId) ?: return

        // Rebuild and post the updated notification in-place (no service restart)
        val body = TrainingForegroundService.buildBody(record)
        val actions = TrainingForegroundService.buildActions(record)
        val notification = TrainingForegroundService.buildNotification(
            context, "Training in progress", body, actions,
        )
        context.getSystemService(NotificationManager::class.java)
            ?.notify(TrainingForegroundService.NOTIFICATION_ID, notification)

        // Tell JS to sync the UI (best-effort — fine if bridge is unavailable)
        TrainingNotificationModule.emitActionPress(actionId)
    }
}
