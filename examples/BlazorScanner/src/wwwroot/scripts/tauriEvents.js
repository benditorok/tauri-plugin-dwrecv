// Blazor-compatible wrapper for tauri-plugin-dwrecv
// This uses the Tauri core API directly since Blazor doesn't support ES module imports

const { addPluginListener } = window.__TAURI__.core;

/**
 * Helper function to register a scan listener with simplified callbacks
 * @param {Function} onBarcode - Callback for successful barcode scans
 * @param {Function} onError - Callback for scan errors
 * @returns {Promise<Function>} Unlisten function
 */
async function onScan(onBarcode, onError) {
  const listener = await addPluginListener("dwrecv", "dw-scan", (payload) => {
    if ("data" in payload) {
      onBarcode(payload);
    } else if ("errorMessage" in payload) {
      if (onError) {
        onError(payload.errorMessage);
      } else {
        console.error("Scan error:", payload.errorMessage);
      }
    }
  });

  return async () => {
    await listener.unregister();
  };
}

/**
 * Wrapper class for managing the scan listener lifecycle
 */
class ScanListener {
  constructor(unlistenFn) {
    this.unlistenFn = unlistenFn;
  }

  async unregister() {
    if (this.unlistenFn) {
      await this.unlistenFn();
      console.log("Scan listener unregistered successfully");
    }
  }
}

/**
 * Register scan listener for Blazor interop
 * @param {Object} dotnetRef - DotNetObjectReference to invoke callbacks on
 * @returns {Promise<ScanListener>} ScanListener instance for cleanup
 */
window.registerScanListener = async function (dotnetRef) {
  try {
    const unlisten = await onScan(
      (barcode) => dotnetRef.invokeMethodAsync("OnScanReceived", barcode),
      (error) => dotnetRef.invokeMethodAsync("OnScanError", error),
    );

    console.log("Scan listener registered successfully");
    return new ScanListener(unlisten);
  } catch (e) {
    console.error("Failed to register scan listener:", e);
    return null;
  }
};

/**
 * Unregister scan listener for Blazor interop
 * @param {ScanListener} listener - The listener to unregister
 */
window.unregisterScanListener = async function (listener) {
  try {
    if (listener) {
      await listener.unregister();
    }
  } catch (e) {
    console.error("Failed to unregister scan listener:", e);
  }
};
