package com.benditorok.dwrecv

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import app.tauri.plugin.JSObject

class DWIntentBroadcastReceiver(
        private val intentAction: String,
        private val trigger: (event: String, data: JSObject) -> Unit
) : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != intentAction) return

        try {
            val bundle = intent.extras ?: return
            val barcodeLabelType = bundle.getString("com.symbol.datawedge.label_type") ?: ""
            val barcodeData = bundle.getString("com.symbol.datawedge.data_string") ?: ""
            val barcodeSource = bundle.getString("com.symbol.datawedge.source") ?: ""

            val dataWedgeData =
                    JSObject().apply {
                        put("labelType", barcodeLabelType)
                        put("data", barcodeData)
                        put("source", barcodeSource)
                    }
            trigger("dw-scan", dataWedgeData)
        } catch (e: Exception) {
            val dataWedgeError =
                    JSObject().apply {
                        put("errorMessage", "Failed to process DataWedge intent: ${e.message}")
                    }
            trigger("dw-error", dataWedgeError)
        }
    }
}
