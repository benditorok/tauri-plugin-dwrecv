// Simple wrapper around tauri-plugin-dwrecv for Blazor interop
// This handles the listener lifecycle automatically

class ScanListener {
  constructor(listener) {
    this.listener = listener;
  }

  async unregister() {
    if (this.listener) {
      await this.listener();
      console.log("Scan listener unregistered successfully");
    }
  }
}

window.registerScanListener = async function (dotnetRef) {
  try {
    // Import the onScan function from the plugin
    const { onScan } = await import("tauri-plugin-dwrecv");

    const unlisten = await onScan(
      (barcode) => dotnetRef.invokeMethodAsync("OnScanReceived", barcode),
      (error) => dotnetRef.invokeMethodAsync("OnScanError", error),
    );

    console.log("Scan listener registered successfully");
    return new ScanListener(unlisten);
  } catch (e) {
    console.error("Failed to register scan listener:", e);
  }
};

window.unregisterScanListener = async function (listener) {
  try {
    if (listener) {
      await listener.unregister();
    }
  } catch (e) {
    console.error("Failed to unregister scan listener:", e);
  }
};
