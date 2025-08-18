package com.benditorok.dwrecv

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import app.tauri.plugin.Invoke

@InvokeArg
class PingArgs {
    var value: String? = null
}

@TauriPlugin
class DWIntentReciever(private val activity: Activity): Plugin(activity) {
    // Default DataWedge intent action - can be customized
    private var currentIntentAction = "com.symbol.datawedge.api.RESULT_ACTION"
    private var currentIntentCategory = "android.intent.category.DEFAULT"

    @Command
    fun ping(invoke: Invoke) {
        val args = invoke.parseArgs(PingArgs::class.java)
        val ret = JSObject()
        ret.put("value", args.value ?: "pong")
        invoke.resolve(ret)
    }

    override fun onNewIntent(intent: Intent) {
        // Handle direct intent launches if needed
        if (intent.action != currentIntentAction) {
            return;
        }

        try {
            val bundle = intent.extras ?: return
            
            // Extract DataWedge data
            val barcode = bundle.getString("com.symbol.datawedge.data_string") ?: ""
            val timestamp = bundle.getString("com.symbol.datawedge.timestamp")
            val symbology = bundle.getString("com.symbol.datawedge.label_type")
            
            // Create data object to send to frontend
            val dataWedgeData = JSObject().apply {
                put("barcode", barcode)
                put("timestamp", timestamp)
                put("symbology", symbology)
            }
            
            // Emit event to frontend
            trigger("dw-scan", dataWedgeData)
        } catch (e: Exception) {
            // Log error or handle silently
            val errorData = JSObject().apply {
                put("error", "Failed to process DataWedge intent: ${e.message}")
            }
            trigger("dw-error", errorData)
        }
    }
}
