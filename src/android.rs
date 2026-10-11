use tauri::{
    AppHandle, Runtime,
    plugin::{PluginApi, PluginHandle},
};

use crate::models::*;

// Initializes the Android Kotlin plugin class.
pub fn init<R: Runtime>(
    _app: &AppHandle<R>,
    api: PluginApi<R, PluginConfig>,
) -> crate::Result<Dwrecv<R>> {
    let handle = api.register_android_plugin("com.benditorok.dwrecv", "DWIntentReceiverPlugin")?;
    Ok(Dwrecv { _handle: handle })
}

/// Access to the dwrecv APIs.
pub struct Dwrecv<R: Runtime> {
    _handle: PluginHandle<R>,
}
