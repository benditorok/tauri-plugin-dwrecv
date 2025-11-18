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

Enable `dwrecv:default` in [`capabilities.json`].

### Blazor

Create a new javascript file with a function name which will be defined in Blazor like `OnScanReceived`.

[`tauriEvents.js`]

```js
const { addPluginListener } = window.__TAURI__.core;

window.registerScanListeners = async function (dotnetRef) {
    await addPluginListener(
        'dwrecv',
        'dw-scan',
        (payload) => dotnetRef.invokeMethodAsync('OnScanReceived', payload)
    );
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
        [JsonPropertyName("data")] public string? Data { get; set; }
        [JsonPropertyName("labelType")] public string? LabelType { get; set; }
        [JsonPropertyName("source")] public string? Source { get; set; }
    }
    
    protected override async Task OnInitializedAsync()
    {
        _ = await JSRuntime.InvokeAsync("registerScanListeners", DotNetObjectReference.Create(this))
    }
    
    [JSInvokable]
    public Task OnScanReceived(JsonObject message)
    {
        var barcode = JsonSerializer.Deserialize<Barcode>();
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
