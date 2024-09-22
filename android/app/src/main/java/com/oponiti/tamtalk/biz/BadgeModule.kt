package com.oponiti.tamtalk.biz

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.wifi.ScanResult
import android.net.wifi.WifiManager
import android.os.Build
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.IllegalViewOperationException
import me.leolin.shortcutbadger.ShortcutBadger

class BadgeModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

    override fun getName(): String {
        return "BadgeModule"
    }

    @ReactMethod
    fun openAndroidWifiSetting() {
        currentActivity?.startActivity(Intent(Settings.ACTION_WIFI_SETTINGS))
    }

    @ReactMethod
    fun setBadge(number: Int) {
        if (number == 0) {
            ShortcutBadger.applyCount(reactApplicationContext, 0)
            ShortcutBadger.removeCount(reactApplicationContext)
            resetBadgeCounterOfPushMessages(reactApplicationContext)
            return
        }

        if (!ShortcutBadger.isBadgeCounterSupported(reactApplicationContext)) {
            Log.d("GN", "BadgeCounterNOTSupported")
        }
        ShortcutBadger.applyCount(reactApplicationContext, number)
    }

    companion object {
        fun applyBadgeCount(context: Context, badgeCount: Int) {
            Log.d("GN", "applyBadgeCount $badgeCount")
            if (Build.MANUFACTURER.equals("Xiaomi", ignoreCase = true)) {
                // context.startService(Intent(context, BadgeIntentService::class.java).putExtra("badgeCount", badgeCount))
            } else {
                ShortcutBadger.applyCount(context, badgeCount)
            }
        }
    }

    private fun resetBadgeCounterOfPushMessages(context: Context) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            notificationManager.cancelAll()
        }
    }
}

