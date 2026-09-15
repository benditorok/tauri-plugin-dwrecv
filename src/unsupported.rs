use std::marker::PhantomData;
use tauri::{AppHandle, Runtime, plugin::PluginApi};

use crate::{Error, PingRequest, PingResponse, PluginConfig, Result};

pub fn init<R: Runtime>(
    _app: &AppHandle<R>,
    _api: PluginApi<R, PluginConfig>,
) -> Result<Dwrecv<R>> {
    Ok(Dwrecv(PhantomData))
}

/// Platform status remains available when Android intent reception is unsupported.
pub struct Dwrecv<R: Runtime>(PhantomData<fn() -> R>);

impl<R: Runtime> Dwrecv<R> {
    pub fn ping(&self, _payload: PingRequest) -> Result<PingResponse> {
        Err(Error::UnsupportedPlatform)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unsupported_platform_reports_status_and_rejects_operations() {
        let plugin = Dwrecv::<tauri::Wry>(PhantomData);
        let status = plugin.status();
        assert!(!status.is_available);
        assert_eq!(status.reason, Some("unsupportedPlatform"));
        assert!(matches!(
            plugin.ping(PingRequest {
                value: "test".into()
            }),
            Err(Error::UnsupportedPlatform)
        ));
        assert!(matches!(
            crate::commands::register_listener(),
            Err(Error::UnsupportedPlatform)
        ));
        assert!(matches!(
            crate::commands::unregister_listener(),
            Err(Error::UnsupportedPlatform)
        ));
    }
}
