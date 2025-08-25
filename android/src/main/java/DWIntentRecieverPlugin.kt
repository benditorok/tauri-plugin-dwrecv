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

/*
 * Configuration class for DW intent receiver plugin
 */
@InvokeArg
class Config {
    var pingvalue: String? = "pong"
    var intentAction: String? = "com.symbol.datawedge.api.RESULT_ACTION"
}

/*
 * DW intent receiver plugin
 */
@TauriPlugin
class DWIntentRecieverPlugin(private val activity: Activity): Plugin(activity) {
    private var pingValue = "pong"
    private var intentAction = "com.symbol.datawedge.api.RESULT_ACTION"

    override fun load(webView: WebView) {
        getConfig(Config::class.java).let {
            this.pingValue = it.pingvalue ?: this.pingValue
            this.intentAction = it.intentAction ?: this.intentAction
        }
    }

    @Command
    fun ping(invoke: Invoke) {
        val ret = JSObject().apply {
            put("value", pingValue)
        }
        invoke.resolve(ret)
    }

    override fun onNewIntent(intent: Intent) {
        // Handle direct intent launches if needed
        if (intent.action != intentAction) {
            return;
        }

        try {
            val bundle = intent.extras ?: return
            
            // Extract DataWedge data
            val barcodeLabelType = bundle.getString("com.symbol.datawedge.label_type") ?: ""
            val barcodeData = bundle.getString("com.symbol.datawedge.data_string") ?: ""
            val barcodeSource = bundle.getString("com.symbol.datawedge.source") ?: ""

            // Create data object to send to frontend
            val dataWedgeData = JSObject().apply {
                put("labelType", barcodeLabelType)
                put("data", barcodeData)
                put("source", barcodeSource)
            }
            
            // Emit event to frontend
            trigger("dw-scan", dataWedgeData)
        } catch (e: Exception) {
            // Handle errors
            val dataWedgeError = JSObject().apply {
                put("errorMessage", "Failed to process DataWedge intent: ${e.message}")
            }
            trigger("dw-error", dataWedgeError)
        }
    }
}
