use tauri::{AppHandle, Runtime, command};

use crate::DwrecvExt;
use crate::Result;
use crate::models::*;

#[command]
pub(crate) fn status<R: Runtime>(app: AppHandle<R>) -> Status {
    app.dwrecv().status()
}

#[cfg(not(target_os = "android"))]
#[command]
pub(crate) fn register_listener() -> Result<()> {
    Err(crate::Error::UnsupportedPlatform)
}

#[cfg(not(target_os = "android"))]
#[command]
pub(crate) fn unregister_listener() -> Result<()> {
    Err(crate::Error::UnsupportedPlatform)
}

#[cfg(not(target_os = "android"))]
#[command]
pub(crate) fn remove_listener() -> Result<()> {
    Err(crate::Error::UnsupportedPlatform)
}

#[command]
pub(crate) async fn ping<R: Runtime>(
    app: AppHandle<R>,
    payload: PingRequest,
) -> Result<PingResponse> {
    app.dwrecv().ping(payload)
}
