package com.oponiti.tamtalk.biz

import android.content.Context
import android.content.Intent
import android.net.wifi.ScanResult
import android.net.wifi.WifiManager
import android.provider.Settings
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.IllegalViewOperationException
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

class AppNativeModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    private val wifi: WifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager

    override fun getName(): String {
        return "AppNativeModule"
    }

    @ReactMethod
    fun openAndroidWifiSetting() {
        currentActivity?.startActivity(Intent(Settings.ACTION_WIFI_SETTINGS))
    }

    @ReactMethod
    fun getListWifi(promise: Promise) {
        try {
            val results: List<ScanResult> = wifi.scanResults
            val wifiArray = JSONArray()

            for (result in results) {
                if (result.SSID.isNotEmpty()) {
                    try {
                        val wifiObject = JSONObject().apply {
                            put("SSID", result.SSID)
                            put("BSSID", result.BSSID)
                            put("capabilities", result.capabilities)
                            put("frequency", result.frequency)
                            put("level", result.level)
                            put("timestamp", result.timestamp)
                        }
                        wifiArray.put(wifiObject)
                    } catch (e: JSONException) {
                        promise.reject(e)
                    }
                }
            }
            promise.resolve(wifiArray.toString())
        } catch (e: IllegalViewOperationException) {
            promise.reject(e)
        }
    }
}

