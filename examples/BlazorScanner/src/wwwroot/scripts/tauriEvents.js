const { addPluginListener } = window.__TAURI__.core;

window.registerScanListeners = async function (dotnetRef) {
  try {
    await addPluginListener("dwrecv", "dw-scan", (payload) => dotnetRef.invokeMethodAsync("OnScanReceived", payload));
    console.log("Handle registered successfully");
  } catch (e) {
    console.error("Failed to register handle: {e}", e);
  }
};
