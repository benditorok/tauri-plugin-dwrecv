# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Usage

The plugin is registered on every platform. The UI checks `checkStatus()` before
subscribing and displays an unavailable message on non-Android platforms.
Android status checks only platform support; it does not probe DataWedge or hardware.

Run these commands from the repository root using pnpm 12.8.1 and Node.js 22.13
or newer. The example uses the local plugin through the pnpm workspace and builds
its JavaScript API before starting Vite or building the frontend.

```bash
pnpm install
pnpm --filter react-scanner tauri android init

# For Desktop development, run:
pnpm --filter react-scanner tauri dev

# For Android development, run:
pnpm --filter react-scanner tauri android dev

# Build the frontend:
pnpm --filter react-scanner build
```

From this example directory, the equivalent commands are `pnpm tauri dev`,
`pnpm tauri android dev`, and `pnpm build`.
