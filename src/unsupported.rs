use std::marker::PhantomData;
use tauri::{AppHandle, Runtime, plugin::PluginApi};

use crate::{PluginConfig, Result};

pub fn init<R: Runtime>(
    _app: &AppHandle<R>,
    _api: PluginApi<R, PluginConfig>,
) -> Result<Dwrecv<R>> {
    Ok(Dwrecv(PhantomData))
}

/// Platform status for platforms that do not support scanning.
pub struct Dwrecv<R: Runtime>(PhantomData<fn() -> R>);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unsupported_platform_reports_unavailable_status() {
        let plugin = Dwrecv::<tauri::Wry>(PhantomData);
        let status = plugin.status();
        assert!(!status.is_available);
        assert_eq!(status.reason, Some("unsupportedPlatform"));
    }
}
