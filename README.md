# tauri-plugin-dwrecv

Handle Zebra DataWedge broadcast intents to receive and parse barcode data on Android.

## Usage

- Create a new project: [Tauri Guide](https://tauri.app/start/).
- Add `tauri-plugin-dwrecv` to your project's [`src-tauri/Cargo.toml`].

```toml
[dependencies]
tauri-plugin-dwrecv = { git = "https://github.com/benditorok/tauri-plugin-dwrecv.git", tag = "dwrecv-v0.3.0" }
```

- Configure [`src-tauri/tauri.conf.json`].

  - `intentCategory` is optional.

```json
{
  "build": {},
  "app": {},
  "bundle": {},
  "plugins": {
    "dwrecv": {
      "pingValue": "ping",
      "intentAction": "com.your.intentName",
      "intentCategory": "android.intent.category.DEFAULT"
    }
  }
}
```

- Enable `dwrecv:default` in [`src-tauri/capabilities/mobile.json`].

```json
{
    "$schema": "../gen/schemas/mobile-schema.json",
    "identifier": "mobile-capability",
    "description": "Extra capability for the main window on mobile devices",
    "windows": [
        "main"
    ],
    "platforms": [
        "android"
    ],
    "permissions": [
        "dwrecv:default"
    ]
}
```

- Initialize the plugin in [`src-tauri/src/lib.rs`].

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dwrecv::init()) // Add this line
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Blazor

You can find an example project under [`examples/BlazorScanner`].

- Create a new javascript file [`src/wwwroot/scripts/tauriEvents.js`] that imports and wraps the plugin's `onScan` API for Blazor interop.

```js
// Simple wrapper around tauri-plugin-dwrecv for Blazor interop
class ScanListener {
  constructor(listener) {
    this.listener = listener;
  }

  async unregister() {
    if (this.listener) {
      await this.listener();
      console.log("Scan listener unregistered successfully");
    }
  }
}

window.registerScanListener = async function (dotnetRef) {
  try {
    const { onScan } = await import("tauri-plugin-dwrecv");

    const unlisten = await onScan(
      (barcode) => dotnetRef.invokeMethodAsync("OnScanReceived", barcode),
      (error) => dotnetRef.invokeMethodAsync("OnScanError", error),
    );

    console.log("Scan listener registered successfully");
    return new ScanListener(unlisten);
  } catch (e) {
    console.error("Failed to register scan listener:", e);
    throw e;
  }
};

window.unregisterScanListener = async function (listener) {
  try {
    if (listener) {
      await listener.unregister();
    }
  } catch (e) {
    console.error("Failed to unregister scan listener:", e);
  }
};
```

- Include it in [`src/wwwroot/index.html`].

```html
<!-- -->
    <body>
        <script src="scripts/tauriEvents.js"></script>
    </body>
<!-- -->
```

- Define the callback methods in your Blazor component.

```cs
@using System.Text.Json
@using System.Text.Json.Serialization
@implements IAsyncDisposable

@page "/"
@inject IJSRuntime JsRuntime

<p>Scan a barcode to see the results.</p>

@code {
    private class Barcode
    {
        [JsonPropertyName("data")] public string Data { get; set; }
        [JsonPropertyName("labelType")] public string LabelType { get; set; }
        [JsonPropertyName("source")] public string Source { get; set; }
    }
    
    private IJSObjectReference? _pluginListener;
    private DotNetObjectReference<Home>? _dotNetRef;
    
    protected override async Task OnInitializedAsync()
    {
        _dotNetRef = DotNetObjectReference.Create(this);
        _pluginListener = await JsRuntime.InvokeAsync<IJSObjectReference>("registerScanListener", _dotNetRef);
    }
    
    public async ValueTask DisposeAsync()
    {
        if (_pluginListener is not null)
        {
            await JsRuntime.InvokeVoidAsync("unregisterScanListener", _pluginListener);
            await _pluginListener.DisposeAsync();
        }
        
        _dotNetRef?.Dispose();
    }
    
    [JSInvokable]
    public Task OnScanReceived(Barcode barcode)
    {
        Console.WriteLine($"Barcode received: {barcode.Data}");
        return Task.CompletedTask;
    }
    
    [JSInvokable]
    public Task OnScanError(string errorMessage)
    {
        Console.WriteLine($"Scan error: {errorMessage}");
        return Task.CompletedTask;
    }
}
```

#### Other information

- Your dev URL *should* be set to http://0.0.0.0 instead of http://localhost in:
  - [`src/Properties/launchSettings.json`]: `"applicationUrl": "http://0.0.0.0:1420"`

### React

You can find an example project under [`examples/react-scanner`].

- Import and use the `onScan` function from `tauri-plugin-dwrecv`.

```tsx
import { useEffect } from "react";
import { onScan } from "tauri-plugin-dwrecv";

function App() {
  useEffect(() => {
    let unlisten: (() => Promise<void>) | undefined;

    const setupListener = async () => {
      try {
        unlisten = await onScan(
          (barcode) => console.log("Barcode received:", barcode.data),
          (error) => console.error("Scan error:", error),
        );
        console.log("Scan listener registered successfully");
      } catch (e) {
        console.error("Failed to register scan listener:", e);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return (
    <main>
      <p>Scan a barcode to see the results in the console.</p>
    </main>
  );
}

export default App;
```

## Testing

You can send intents using `adb` to your device. Make sure your device is connected with `adb devices`.


### Check device logs:

- Windows:
  
```powershell
$ adb logcat | findstr DWIntent
```
- Linux: 
  
```bash
$ adb logcat | grep DWIntent
```
  
### Broadcast intents:

- The `-c` switch is optional.
- Windows:

```ps
$ adb shell am broadcast `
  -a com.your.intentName `
  -c android.intent.category.DEFAULT `
  --es 'com.symbol.datawedge.label_type' 'CODE128' `
  --es 'com.symbol.datawedge.data_string' '1234567890123' `
  --es 'com.symbol.datawedge.source' 'test-scanner'
```

- Linux: 

```bash
$ adb shell am broadcast \
  -a com.your.intentName \
  -c android.intent.category.DEFAULT \
  --es 'com.symbol.datawedge.label_type' 'CODE128' \
  --es 'com.symbol.datawedge.data_string' '1234567890123' \
  --es 'com.symbol.datawedge.source' 'test-scanner'
```

## Plugin development information
  
### Show Kotlin compilation errors

```bash
$ cd src-tauri/gen/android/
$ ./gradlew compileDebugKotlin --scan
```

# License 

MIT
