use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::models::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
  app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<Dwrecv<R>> {
  Ok(Dwrecv(app.clone()))
}

/// Access to the dwrecv APIs.
pub struct Dwrecv<R: Runtime>(AppHandle<R>);

impl<R: Runtime> Dwrecv<R> {
  pub fn ping(&self, payload: PingRequest) -> crate::Result<PingResponse> {
    Ok(PingResponse {
      value: payload.value,
    })
  }

  pub fn subscribe_to_datawedge(&self, _payload: SubscribeRequest) -> crate::Result<SubscribeResponse> {
    // Desktop doesn't support DataWedge intents
    Ok(SubscribeResponse {
      success: false,
      message: Some("DataWedge is only available on Android devices".to_string()),
    })
  }

  pub fn unsubscribe_from_datawedge(&self) -> crate::Result<UnsubscribeResponse> {
    // Desktop doesn't support DataWedge intents
    Ok(UnsubscribeResponse {
      success: false,
      message: Some("DataWedge is only available on Android devices".to_string()),
    })
  }
}
