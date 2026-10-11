use tauri::{AppHandle, Runtime, command};

use crate::{DwrecvExt, Status};

#[command]
pub(crate) fn status<R: Runtime>(app: AppHandle<R>) -> Status {
    app.dwrecv().status()
}
