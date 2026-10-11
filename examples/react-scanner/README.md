# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Usage

The plugin is registered on every platform. The UI checks `checkStatus()` before
subscribing and displays an unavailable message on non-Android platforms.
Android status checks only platform support; it does not probe DataWedge or hardware.

```bash
deno install
deno task tauri android init

# For Desktop development, run:
deno task tauri dev

# For Android development, run:
deno task tauri android dev
```
