const { addPluginListener } = window.__TAURI__.core;

window.registerScanListeners = async function (dotnetRef) {
  try {
    const listener = await addPluginListener("dwrecv", "dw-scan", (payload) =>
      dotnetRef.invokeMethodAsync("OnScanReceived", payload),
    );
    console.log("Handle registered successfully");
    return listener;
  } catch (e) {
    console.error("Failed to register handle: {e}", e);
    throw e;
  }
};

window.unregisterScanListeners = async function (listener) {
  try {
    if (listener) {
      await listener.unregister();
      console.log("Handle unregistered successfully");
    }
  } catch (e) {
    console.error("Failed to unregister handle: {e}", e);
  }
};
