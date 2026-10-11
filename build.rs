// Tauri supplies the native listener commands; include them for permission generation.
const COMMANDS: &[&str] = &["status", "register_listener", "remove_listener"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .build();
}
