# tauri-plugin-dwrecv

Receive and parse Zebra DataWedge barcodes as broadcasted intents on Android.

## Configuration

[`tauri.conf.json`]

```json
{
  "build": { ... },
  "tauri": { ... },
  "plugins": {
    "tauri-plugin-dwrecv": {
      "pingValue": "ping",
      "intentAction": "com.your.intentName"
    }
  }
}
```

## Usage

Enable `dwrecv:default` in [`capabilities > mobile.json`].

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

### Blazor

Create a new javascript file with a function name which will be defined in Blazor like `OnScanReceived`.

[`tauriEvents.js`]

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

Include it in index.html.

[`wwwroot\index.html`]

```html
<!-- -->
    <body>
        <script src="scripts/tauriEvents.js"></script>
    </body>
<!-- -->
```

Define the function calls in Blazor.

```cs
@code {
    private class Barcode {
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
        await JSRuntime.InvokeVoidAsync("registerScanListeners", DotNetObjectReference.Create(this));
    }
    
    [JSInvokable]
    public Task OnScanReceived(JsonElement payload)
    {
        var barcode = JsonSerializer.Deserialize<Barcode>(payload.GetRawText());
        var error = JsonSerializer.Deserialize<DwScanError>(payload.GetRawText());
        Logger.LogInformation("Barcode received: {Barcode}", barcode.Data);
        // ...
    }
}
```

## Testing

You can send intents ujsing `adb` to your device. 

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

```powershell
$ adb logcat | grep DWIntent
```

```bash
$ adb shell am broadcast \
  -a com.your.intentName \
  --es 'com.symbol.datawedge.label_type' 'CODE128' \
  --es 'com.symbol.datawedge.data_string' '1234567890123' \
  --es 'com.symbol.datawedge.source' 'test-scanner'
```

## Plugin development
  
### Show Kotlin compilation errors

```bash
$ cd src-tauri/gen/android/
$ ./gradlew compileDebugKotlin --scan
```
