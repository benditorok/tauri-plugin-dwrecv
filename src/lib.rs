use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub use models::*;

#[cfg(target_os = "android")]
mod android;
#[cfg(not(target_os = "android"))]
mod unsupported;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(target_os = "android")]
pub use android::Dwrecv;
#[cfg(not(target_os = "android"))]
pub use unsupported::Dwrecv;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the dwrecv APIs.
pub trait DwrecvExt<R: Runtime> {
    fn dwrecv(&self) -> &Dwrecv<R>;
}

impl<R: Runtime, T: Manager<R>> crate::DwrecvExt<R> for T {
    fn dwrecv(&self) -> &Dwrecv<R> {
        self.state::<Dwrecv<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R, models::PluginConfig> {
    let builder = Builder::<R, models::PluginConfig>::new("dwrecv");
    #[cfg(target_os = "android")]
    let builder = builder.invoke_handler(tauri::generate_handler![commands::ping, commands::status]);
    #[cfg(not(target_os = "android"))]
    let builder = builder.invoke_handler(tauri::generate_handler![
        commands::ping,
        commands::status,
        commands::register_listener,
        commands::unregister_listener,
        commands::remove_listener,
    ]);

    builder
        .setup(|app, api| {
            #[cfg(target_os = "android")]
            let dwrecv = android::init(app, api)?;
            #[cfg(not(target_os = "android"))]
            let dwrecv = unsupported::init(app, api)?;
            app.manage(dwrecv);
            Ok(())
        })
        .build()
}

impl<R: Runtime> Dwrecv<R> {
    /// Reports platform support only; does not probe intent senders or hardware.
    pub fn status(&self) -> Status {
        Status::current()
    }
}
