use tauri::{
    plugin::{PluginApi, PluginHandle},
    AppHandle, Runtime,
};

use crate::models::*;

// Initializes the Android Kotlin plugin class.
pub fn init<R: Runtime>(
    _app: &AppHandle<R>,
    api: PluginApi<R, PluginConfig>,
) -> crate::Result<Dwrecv<R>> {
    let handle = api.register_android_plugin("com.benditorok.dwrecv", "DWIntentReceiverPlugin")?;
    Ok(Dwrecv(handle))
}

/// Access to the dwrecv APIs.
pub struct Dwrecv<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> Dwrecv<R> {
    pub fn ping(&self, payload: PingRequest) -> crate::Result<PingResponse> {
        self.0
            .run_mobile_plugin("ping", payload)
            .map_err(Into::into)
    }
}
