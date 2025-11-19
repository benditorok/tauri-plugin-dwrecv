/// Commands:
/// * `register_listener` is required so that the user can subscribe to the plugin's window events.
///   * Additional information:
///     * Source: https://github.com/tauri-apps/tauri/blob/dev/packages/api/src/core.ts#L189
///     * https://github.com/tauri-apps/tauri/issues/13027
///     * API changed in 2.9.x
///     * https://github.com/tauri-apps/tauri/issues/13027#issuecomment-3457217759
///     * https://github.com/tauri-apps/tauri/pull/14132
const COMMANDS: &[&str] = &["ping", "register_listener"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .build();
}
