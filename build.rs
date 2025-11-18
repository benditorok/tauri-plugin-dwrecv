/// https://github.com/tauri-apps/tauri/issues/13027
///
/// API changed in 2.9.x
/// https://github.com/tauri-apps/tauri/issues/13027#issuecomment-3457217759
/// https://github.com/tauri-apps/tauri/pull/14132
///
/// RegisterListener
/// * Source: https://github.com/tauri-apps/tauri/blob/dev/packages/api/src/core.ts#L189
const COMMANDS: &[&str] = &["ping", "register-listener"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .build();
}
