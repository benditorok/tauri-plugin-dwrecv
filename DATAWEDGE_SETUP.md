# DataWedge Intent Receiver Plugin

This Tauri plugin enables your application to receive and handle DataWedge broadcast intents from Zebra devices. It provides a seamless way to capture barcode scans and other data from Zebra's DataWedge service.

## Features

- ✅ Subscribe to DataWedge broadcast intents
- ✅ Real-time barcode scan events
- ✅ Customizable intent actions and categories
- ✅ TypeScript support with full type definitions
- ✅ Event-driven architecture
- ✅ Automatic cleanup and error handling
- ✅ Works on Android devices with DataWedge

## Prerequisites

1. **Zebra Device**: This plugin only works on Zebra devices with DataWedge installed
2. **DataWedge Configuration**: DataWedge must be configured to broadcast intents
3. **Android Permissions**: Required permissions are automatically included

## Installation

Add the plugin to your Tauri project:

```bash
# Add to Cargo.toml
tauri-plugin-dwrecv = { path = "path/to/this/plugin" }

# Add to package.json
npm install tauri-plugin-dwrecv-api
```

## Rust Setup

In your `main.rs` or `lib.rs`:

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dwrecv::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## TypeScript/JavaScript Usage

### Basic Setup

```typescript
import { 
  subscribeToDataWedge, 
  onDataWedgeScan, 
  onDataWedgeError 
} from 'tauri-plugin-dwrecv-api';

// Subscribe to DataWedge intents
const result = await subscribeToDataWedge();

if (result.success) {
  console.log('Successfully subscribed to DataWedge');
  
  // Listen for scan events
  const unlistenScan = await onDataWedgeScan((data) => {
    console.log('Barcode scanned:', data.barcode);
    console.log('Symbology:', data.symbology);
    console.log('Timestamp:', data.timestamp);
  });
  
  // Listen for errors
  const unlistenError = await onDataWedgeError((error) => {
    console.error('DataWedge error:', error.error);
  });
  
  // Cleanup when done
  // unlistenScan();
  // unlistenError();
} else {
  console.error('Failed to subscribe:', result.message);
}
```

### Advanced Configuration

```typescript
// Subscribe with custom intent configuration
const result = await subscribeToDataWedge({
  intentAction: "com.symbol.datawedge.api.RESULT_ACTION",
  intentCategory: "android.intent.category.DEFAULT"
});
```

### React Example

```tsx
import React, { useEffect, useState } from 'react';
import { 
  subscribeToDataWedge, 
  onDataWedgeScan, 
  DataWedgeData 
} from 'tauri-plugin-dwrecv-api';

function BarcodeScanner() {
  const [scans, setScans] = useState<DataWedgeData[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let unlistenScan: (() => void) | null = null;

    const setupDataWedge = async () => {
      try {
        const result = await subscribeToDataWedge();
        
        if (result.success) {
          setIsSubscribed(true);
          
          unlistenScan = await onDataWedgeScan((data) => {
            setScans(prev => [data, ...prev].slice(0, 100)); // Keep last 100 scans
          });
        }
      } catch (error) {
        console.error('Failed to setup DataWedge:', error);
      }
    };

    setupDataWedge();

    return () => {
      if (unlistenScan) {
        unlistenScan();
      }
    };
  }, []);

  return (
    <div>
      <h2>Barcode Scanner</h2>
      <p>Status: {isSubscribed ? 'Connected' : 'Disconnected'}</p>
      
      <div>
        <h3>Recent Scans:</h3>
        {scans.length === 0 ? (
          <p>No scans yet</p>
        ) : (
          <ul>
            {scans.map((scan, index) => (
              <li key={index}>
                <strong>{scan.barcode}</strong>
                {scan.symbology && <span> ({scan.symbology})</span>}
                {scan.timestamp && <span> - {scan.timestamp}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

## DataWedge Configuration

To use this plugin, you need to configure DataWedge on your Zebra device:

### Method 1: Using DataWedge UI

1. Open **DataWedge** app on your Zebra device
2. Create a new **Profile** or edit an existing one
3. Go to **Output** settings
4. Enable **Intent Output**
5. Configure the intent settings:
   - **Intent Action**: `com.symbol.datawedge.api.RESULT_ACTION` (default)
   - **Intent Category**: `android.intent.category.DEFAULT` (default)
   - **Intent Delivery**: Broadcast Intent

### Method 2: Programmatic Configuration

You can also configure DataWedge programmatically by sending intents from your app:

```kotlin
// Example configuration intent (this could be added to the plugin if needed)
val configIntent = Intent().apply {
    action = "com.symbol.datawedge.api.ACTION"
    putExtra("com.symbol.datawedge.api.SET_CONFIG", Bundle().apply {
        putString("PROFILE_NAME", "YourAppProfile")
        putString("PROFILE_ENABLED", "true")
        putString("CONFIG_MODE", "UPDATE")
        // Add more configuration as needed
    })
}
context.sendBroadcast(configIntent)
```

## API Reference

### Types

```typescript
interface DataWedgeData {
  barcode: string;      // The scanned barcode data
  timestamp?: string;   // Scan timestamp
  symbology?: string;   // Barcode symbology (e.g., "CODE128", "QR_CODE")
}

interface SubscribeOptions {
  intentAction?: string;    // Custom intent action
  intentCategory?: string;  // Custom intent category
}

interface SubscribeResponse {
  success: boolean;     // Whether subscription was successful
  message?: string;     // Success/error message
}
```

### Functions

#### `subscribeToDataWedge(options?: SubscribeOptions): Promise<SubscribeResponse>`

Subscribes to DataWedge broadcast intents.

#### `onDataWedgeScan(callback: (data: DataWedgeData) => void): Promise<() => void>`

Listens for barcode scan events. Returns an unlisten function.

#### `onDataWedgeError(callback: (error: {error: string}) => void): Promise<() => void>`

Listens for DataWedge error events. Returns an unlisten function.

#### `ping(value: string): Promise<string | null>`

Test function to verify plugin connectivity.

## Troubleshooting

### Common Issues

1. **No scan events received**
   - Verify DataWedge is enabled and configured correctly
   - Check that your app profile is active in DataWedge
   - Ensure intent output is enabled in DataWedge settings

2. **Permission denied**
   - Check that required permissions are granted
   - Verify DataWedge version supports the intent action you're using

3. **Plugin not found**
   - Ensure the plugin is properly installed and imported
   - Check that you're running on an Android device (DataWedge is Android-only)

### Testing on Non-Zebra Devices

The plugin includes safety checks and will gracefully handle non-Zebra devices:

- Desktop: Returns an error message indicating DataWedge is not available
- Non-Zebra Android: Will attempt to subscribe but won't receive events

### Debugging

Enable debug logging to see plugin activity:

```typescript
// Check subscription status
const result = await subscribeToDataWedge();
console.log('Subscription result:', result);

// Monitor all events
await onDataWedgeError((error) => {
  console.error('DataWedge error:', error);
});
```

## Example App

See the `examples/tauri-app` directory for a complete working example that demonstrates:

- Subscribing to DataWedge intents
- Displaying real-time scan data
- Error handling
- UI integration with Svelte

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on a Zebra device
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues related to:
- **Plugin functionality**: Open an issue in this repository
- **DataWedge configuration**: Consult Zebra's DataWedge documentation
- **Tauri integration**: Check Tauri's plugin development guide
