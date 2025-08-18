use tauri::{command, AppHandle, Runtime};

use crate::models::*;
use crate::DwrecvExt;
use crate::Result;

#[command]
pub(crate) async fn ping<R: Runtime>(
    app: AppHandle<R>,
    payload: PingRequest,
) -> Result<PingResponse> {
    app.dwrecv().ping(payload)
}

#[command]
pub(crate) async fn subscribe_to_datawedge<R: Runtime>(
    app: AppHandle<R>,
    payload: SubscribeRequest,
) -> Result<SubscribeResponse> {
    app.dwrecv().subscribe_to_datawedge(payload)
}

#[command]
pub(crate) async fn unsubscribe_from_datawedge<R: Runtime>(
    app: AppHandle<R>,
) -> Result<UnsubscribeResponse> {
    app.dwrecv().unsubscribe_from_datawedge()
}
