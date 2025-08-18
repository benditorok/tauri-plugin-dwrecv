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

@InvokeArg
class SubscribeToDataWedgeArgs {
    var intentAction: String? = null
    var intentCategory: String? = null
}

@TauriPlugin
class DWIntentReciever(private val activity: Activity): Plugin(activity) {
    
    private var dataWedgeReceiver: BroadcastReceiver? = null
    private var isSubscribed = false
    
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

    @Command
    fun subscribeToDataWedge(invoke: Invoke) {
        val args = invoke.parseArgs(SubscribeToDataWedgeArgs::class.java)
        
        try {
            // Update intent action and category if provided
            args.intentAction?.let { currentIntentAction = it }
            args.intentCategory?.let { currentIntentCategory = it }
            
            // Unregister existing receiver if any
            unregisterDataWedgeReceiver()
            
            // Create and register the broadcast receiver
            dataWedgeReceiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent?) {
                    intent?.let { handleDataWedgeIntent(it) }
                }
            }
            
            val filter = IntentFilter().apply {
                addAction(currentIntentAction)
                addCategory(currentIntentCategory)
            }
            
            activity.registerReceiver(dataWedgeReceiver, filter)
            isSubscribed = true
            
            val ret = JSObject()
            ret.put("success", true)
            ret.put("message", "Successfully subscribed to DataWedge intents")
            invoke.resolve(ret)
            
        } catch (e: Exception) {
            val ret = JSObject()
            ret.put("success", false)
            ret.put("message", "Failed to subscribe: ${e.message}")
            invoke.resolve(ret)
        }
    }

    @Command
    fun unsubscribeFromDataWedge(invoke: Invoke) {
        try {
            unregisterDataWedgeReceiver()
            
            val ret = JSObject()
            ret.put("success", true)
            ret.put("message", "Successfully unsubscribed from DataWedge intents")
            invoke.resolve(ret)
            
        } catch (e: Exception) {
            val ret = JSObject()
            ret.put("success", false)
            ret.put("message", "Failed to unsubscribe: ${e.message}")
            invoke.resolve(ret)
        }
    }

    private fun handleDataWedgeIntent(intent: Intent) {
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
            trigger("datawedge-scan", dataWedgeData)
            
        } catch (e: Exception) {
            // Log error or handle silently
            val errorData = JSObject().apply {
                put("error", "Failed to process DataWedge intent: ${e.message}")
            }
            trigger("datawedge-error", errorData)
        }
    }

    private fun unregisterDataWedgeReceiver() {
        dataWedgeReceiver?.let { receiver ->
            try {
                activity.unregisterReceiver(receiver)
            } catch (e: IllegalArgumentException) {
                // Receiver was not registered, ignore
            }
        }
        dataWedgeReceiver = null
        isSubscribed = false
    }

    override fun onNewIntent(intent: Intent) {
        // Handle direct intent launches if needed
        if (intent.action == currentIntentAction) {
            handleDataWedgeIntent(intent)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterDataWedgeReceiver()
    }

    override fun onPause() {
        super.onPause()
        // Optionally unregister on pause to save battery
        // unregisterDataWedgeReceiver()
    }

    override fun onResume() {
        super.onResume()
        // Re-register if we were previously subscribed
        // This would require storing subscription state
    }
}
