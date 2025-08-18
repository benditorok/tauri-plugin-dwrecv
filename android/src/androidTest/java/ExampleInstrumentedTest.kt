package com.benditorok.dwrecv

import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.ext.junit.runners.AndroidJUnit4

import org.junit.Test
import org.junit.runner.RunWith

import org.junit.Assert.*

/**
 * Instrumented test, which will execute on an Android device.
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
@RunWith(AndroidJUnit4::class)
class ExampleInstrumentedTest {
    @Test
    fun useAppContext() {
        // Context of the app under test.
        val appContext = InstrumentationRegistry.getInstrumentation().targetContext
        assertEquals("com.benditorok.dwrecv", appContext.packageName)

        // Send intent
        val intent = Intent(appContext, DWIntentReciever::class.java)
        intent.putExtra("com.symbol.datawedge.data_string", "test_barcode")
        intent.putExtra("com.symbol.datawedge.timestamp", System.currentTimeMillis())
        intent.putExtra("com.symbol.datawedge.label_type", "QR_CODE")
        appContext.sendBroadcast(intent)

        // Verify the result
        val result = InstrumentationRegistry.getInstrumentation().waitForIdleSync()
        assertNotNull(result)

        // Verify the broadcast
        val broadcastReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                assertEquals("dw-scan", intent?.action)
                val barcode = intent?.getStringExtra("barcode")
                assertEquals("test_barcode", barcode)
            }
        }
        val filter = IntentFilter("dw-scan")
        appContext.registerReceiver(broadcastReceiver, filter)

        // Clean up
        appContext.unregisterReceiver(broadcastReceiver)
    }
}
