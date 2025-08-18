# Tauri Plugin DataWedge Receiver

A Tauri plugin for receiving Zebra DataWedge broadcast intents on Android devices. This plugin enables your Tauri application to capture barcode scans and other data from Zebra devices through DataWedge.

## Features

- 🔄 Real-time DataWedge intent reception
- 📱 Native Android implementation using Kotlin
- 🎯 Event-driven architecture with TypeScript support
- ⚙️ Configurable intent actions and categories
- 🛡️ Automatic error handling and cleanup
- 📋 Full TypeScript type definitions

## Quick Start

### 1. Add to your Tauri project

```toml
# Cargo.toml
[dependencies]
tauri-plugin-dwrecv = { path = "path/to/this/plugin" }
```

```rust
// main.rs
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dwrecv::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 2. Install the JavaScript API

```bash
npm install tauri-plugin-dwrecv-api
```

### 3. Use in your frontend

```typescript
import { subscribeToDataWedge, onDataWedgeScan } from 'tauri-plugin-dwrecv-api';

// Subscribe to DataWedge intents
const result = await subscribeToDataWedge();

if (result.success) {
  // Listen for barcode scans
  const unlisten = await onDataWedgeScan((data) => {
    console.log('Scanned:', data.barcode);
    console.log('Type:', data.symbology);
  });
}
```

## Requirements

- Zebra device with DataWedge installed
- Android platform (DataWedge is Android-only)
- Properly configured DataWedge profile

## Documentation

- [Complete Setup Guide](./DATAWEDGE_SETUP.md) - Detailed configuration and usage
- [Example App](./examples/tauri-app/) - Working Svelte example
- [API Reference](./DATAWEDGE_SETUP.md#api-reference) - TypeScript API documentation

## DataWedge Configuration

Configure DataWedge to broadcast intents:

1. Open DataWedge app on your Zebra device
2. Create/edit a profile for your app
3. Enable "Intent Output" in Output settings
4. Set Intent Action: `com.symbol.datawedge.api.RESULT_ACTION`
5. Set Intent Category: `android.intent.category.DEFAULT`
6. Set Intent Delivery: "Broadcast Intent"

## Example Output

When a barcode is scanned, you'll receive:

```typescript
{
  barcode: "123456789012",
  symbology: "CODE128", 
  timestamp: "2023-12-07 10:30:45"
}
```

## Contributing

Issues and pull requests are welcome! Please test on actual Zebra devices.

## License

MIT License - see [LICENSE](./LICENSE) for details.
