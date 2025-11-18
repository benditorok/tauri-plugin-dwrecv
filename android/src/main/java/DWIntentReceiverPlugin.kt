package com.benditorok.dwrecv

import android.app.Activity
import android.content.IntentFilter
import android.util.Log
import android.webkit.WebView
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin

/*
 * Configuration class for DW intent receiver plugin
 */
@InvokeArg
class Config {
    var pingValue: String? = "pong"
    var intentAction: String? = "com.symbol.datawedge.api.RESULT_ACTION"
}

/*
 * DW intent receiver plugin
 */
@TauriPlugin
class DWIntentReceiverPlugin(private val activity: Activity) : Plugin(activity) {
    private var pingValue = "pong"
    private var intentAction = "com.symbol.datawedge.api.RESULT_ACTION"
    private var receiver: DWIntentBroadcastReceiver? = null

    companion object {
        private const val TAG = "DWIntentReceiverPlugin"
    }

    @Command
    fun ping(invoke: Invoke) {
        val ret = JSObject().apply { put("value", pingValue) }
        invoke.resolve(ret)
    }

    override fun load(webView: WebView) {
        Log.i(TAG, "Loading plugin with intent action: $intentAction")

        // Load configuration if available
        getConfig(Config::class.java)?.let { config ->
            pingValue = config.pingValue ?: pingValue
            intentAction = config.intentAction ?: intentAction
            Log.i(TAG, "Loaded config - intentAction: $intentAction, pingValue: $pingValue")
        }

        // Unregister existing receiver if any
        unregisterReceiver()

        // Use the separate BroadcastReceiver class and provide a lambda to trigger events
        receiver =
            DWIntentBroadcastReceiver(intentAction) { data ->
                Log.i(TAG, "Triggering event: dw-scan")
                trigger("dw-scan", data)
            }

        try {
            activity.registerReceiver(
                receiver,
                IntentFilter(intentAction),
                android.content.Context.RECEIVER_EXPORTED
            )
            Log.i(TAG, "Successfully registered receiver for action: $intentAction")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to register receiver", e)
        }
    }

    private fun unregisterReceiver() {
        receiver?.let {
            try {
                activity.unregisterReceiver(it)
                Log.i(TAG, "Unregistered existing receiver")
            } catch (e: IllegalArgumentException) {
                Log.w(TAG, "Receiver was not registered")
            }
        }
    }

    override fun onPause() {
        Log.i(TAG, "Plugin paused - unregistering receiver")
        unregisterReceiver()
        super.onPause()
    }

    override fun onResume() {
        Log.i(TAG, "Plugin resumed - re-registering receiver")
        super.onResume()
        // Re-register receiver when app resumes
        receiver?.let {
            try {
                activity.registerReceiver(
                    it,
                    IntentFilter(intentAction),
                    android.content.Context.RECEIVER_EXPORTED
                )
                Log.i(TAG, "Re-registered receiver for action: $intentAction")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to re-register receiver", e)
            }
        }
    }
}
