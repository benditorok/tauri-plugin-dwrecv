package com.benditorok.dwrecv

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import app.tauri.plugin.JSObject

class DWIntentBroadcastReceiver(
        private val intentAction: String,
        private val trigger: (event: String, data: JSObject) -> Unit
) : BroadcastReceiver() {

    companion object {
        private const val TAG = "DWIntentBroadcastReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "Received intent: ${intent.action}")

        if (intent.action != intentAction) {
            Log.d(TAG, "Ignoring intent: ${intent.action} doesn't match expected $intentAction")
            return
        }

        try {
            Log.d(TAG, "Processing intent: $intent")
            val bundle = intent.extras
            if (bundle == null) {
                Log.w(TAG, "No extras found in intent")
                return
            }

            val barcodeLabelType = bundle.getString("com.symbol.datawedge.label_type") ?: ""
            val barcodeData = bundle.getString("com.symbol.datawedge.data_string") ?: ""
            val barcodeSource = bundle.getString("com.symbol.datawedge.source") ?: ""

            val dataWedgeData =
                    JSObject().apply {
                        put("labelType", barcodeLabelType)
                        put("data", barcodeData)
                        put("source", barcodeSource)
                    }
            Log.d(TAG, "Triggering event 'dw-scan' with data: $dataWedgeData")
            trigger("dw-scan", dataWedgeData)
        } catch (e: Exception) {
            Log.e(TAG, "Error processing intent", e)
            val dataWedgeError =
                    JSObject().apply {
                        put("errorMessage", "Failed to process DataWedge intent: ${e.message}")
                    }
            trigger("dw-error", dataWedgeError)
        }
    }
}
