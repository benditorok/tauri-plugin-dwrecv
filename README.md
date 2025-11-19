# tauri-plugin-dwrecv

Handle Zebra DataWedge broadcast intents to receive and parse barcode data on Android.

## Usage

- Create a new project: [Tauri Guide](https://tauri.app/start/).
- Add `tauri-plugin-dwrecv` to your project's [`src-tauri/Cargo.toml`].

```toml
[dependencies]
tauri-plugin-dwrecv = { git = "https://github.com/benditorok/tauri-plugin-dwrecv.git", tag = "dwrecv-v0.1.0" }
```

- Configure [`src-tauri/tauri.conf.json`].

```json
{
  "build": {},
  "app": {},
  "bundle": {},
  "plugins": {
    "dwrecv": {
      "pingValue": "ping",
      "intentAction": "com.your.intentName"
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

- Create a new javascript file [`src/wwwroot/scripts/tauriEvents.js`] with a function name which will be defined in Blazor like `OnScanReceived`.

```js
const { addPluginListener } = window.__TAURI__.core;

window.registerScanListeners = async function (dotnetRef) {
  try {
    await addPluginListener(
        'dwrecv',
        'dw-scan',
        (payload) => dotnetRef.invokeMethodAsync('OnScanReceived', payload)
    );
    console.log("Handle registered successfully")
  } catch (e) {
    console.error("Failed to register handle: {e}", e)
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

- Define the function calls in Blazor.

```cs
@code {
    private class Barcode
    {
        [JsonPropertyName("data")] public string Data { get; set; }
        [JsonPropertyName("labelType")] public string LabelType { get; set; }
        [JsonPropertyName("source")] public string Source { get; set; }
    }
    
    private class ScanError
    {
        [JsonPropertyName("errorMessage")] public string ErrorMessage { get; set; }
    }
    
    protected override async Task OnInitializedAsync()
    {
        await JsRuntime.InvokeVoidAsync("registerScanListeners", DotNetObjectReference.Create(this));
    }
    
    [JSInvokable]
    public Task OnScanReceived(JsonElement payload)
    {
        var barcode = JsonSerializer.Deserialize<Barcode>(payload.GetRawText());
        var error = JsonSerializer.Deserialize<ScanError>(payload.GetRawText());
        Logger.LogInformation("Barcode received: {Barcode}", barcode.Data);
    }
}
```

### Other information

- Your dev URL *should* be set to http://0.0.0.0 instead of http://localhost in:
  - [`src-tauri/tauri.conf.json`]: `"devUrl": "http://0.0.0.0:1420"`
  - [`src/Properties/launchSettings.json`]: `"applicationUrl": "http://0.0.0.0:1420"`

## Testing

You can send intents using `adb` to your device. Make sure your device is connected with `adb devices`.

- Windows:

```powershell
$ adb logcat | findstr DWIntent
```

```ps
$ adb shell am broadcast `
  -a com.your.intentName `
  --es 'com.symbol.datawedge.label_type' 'CODE128' `
  --es 'com.symbol.datawedge.data_string' '1234567890123' `
  --es 'com.symbol.datawedge.source' 'test-scanner'
```

- Linux: 

```bash
$ adb logcat | grep DWIntent
```

```bash
$ adb shell am broadcast \
  -a com.your.intentName \
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
