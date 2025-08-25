use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::Dwrecv;
#[cfg(mobile)]
use mobile::Dwrecv;

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
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("dwrecv")
        .invoke_handler(tauri::generate_handler![commands::ping,])
        .setup(|app, api| {
            #[cfg(mobile)]
            let dwrecv = mobile::init(app, api)?;
            #[cfg(desktop)]
            let dwrecv = desktop::init(app, api)?;
            app.manage(dwrecv);
            Ok(())
        })
        .build()
}
