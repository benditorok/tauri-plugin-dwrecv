package com.benditorok.dwrecv

import android.app.Activity
import android.content.IntentFilter
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

    @Command
    fun ping(invoke: Invoke) {
        val ret = JSObject().apply { put("value", pingValue) }
        invoke.resolve(ret)
    }

    override fun load(webView: WebView) {
        // Load configuration if available
        getConfig(Config::class.java)?.let { config ->
            pingValue = config.pingValue ?: pingValue
            intentAction = config.intentAction ?: intentAction
        }

        // Use the separate BroadcastReceiver class and provide a lambda to trigger events
        receiver = DWIntentBroadcastReceiver(intentAction) { event, data -> trigger(event, data) }
        activity.registerReceiver(
                receiver,
                IntentFilter(intentAction),
                android.content.Context.RECEIVER_EXPORTED
        )
    }

    // override fun onDestroy() {
    //     receiver?.let { activity.unregisterReceiver(it) }
    //     receiver = null
    //     super.onDestroy()
    // }
}
