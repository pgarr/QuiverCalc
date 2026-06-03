package com.pgarr.quivercalc

import android.app.NotificationManager
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class TrainingNotificationModule(private val ctx: ReactApplicationContext) :
    ReactContextBaseJavaModule(ctx) {

    companion object {
        private const val MODULE_NAME = "TrainingNotification"
        const val EVENT_ACTION_PRESS = "TrainingNotificationActionPress"

        @Volatile
        private var instance: TrainingNotificationModule? = null

        fun emitActionPress(actionId: String) {
            instance?.ctx
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(EVENT_ACTION_PRESS, actionId)
        }
    }

    override fun getName() = MODULE_NAME

    override fun initialize() {
        super.initialize()
        instance = this
    }

    override fun invalidate() {
        if (instance === this) instance = null
        super.invalidate()
    }

    /** Start the foreground service with the initial MediaStyle notification. */
    @ReactMethod
    fun show(title: String, body: String, actionsJson: String) {
        val intent = Intent(ctx, TrainingForegroundService::class.java).apply {
            putExtra("title", title)
            putExtra("body", body)
            putExtra("actions", actionsJson)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ctx.startForegroundService(intent)
        } else {
            ctx.startService(intent)
        }
    }

    /** Update the notification body/actions in-place without restarting the service. */
    @ReactMethod
    fun update(title: String, body: String, actionsJson: String) {
        val actions = TrainingForegroundService.parseActionsJson(actionsJson)
        val notification = TrainingForegroundService.buildNotification(ctx, title, body, actions)
        ctx.getSystemService(NotificationManager::class.java)
            ?.notify(TrainingForegroundService.NOTIFICATION_ID, notification)
    }

    /** Stop the foreground service and remove the notification. */
    @ReactMethod
    fun stop() {
        ctx.stopService(Intent(ctx, TrainingForegroundService::class.java))
    }

    // Required by React Native's NativeEventEmitter
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}
}
